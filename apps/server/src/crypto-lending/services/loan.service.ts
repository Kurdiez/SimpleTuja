import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { NftFiApiService } from './nftfi-api.service';
import { CustomException } from '~/commons/errors/custom-exception';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import Big from 'big.js';
import { CryptoLoanOfferEntity } from '~/database/entities/crypto-loan-offer.entity';
import { Not, In } from 'typeorm';
import {
  CryptoToken,
  CryptoTokenAddress,
  CryptoTokenDecimals,
} from '@simpletuja/shared';
import { ConfigService } from '~/config';
import { OpenSeaService } from './opensea.service';
import { ethers } from 'ethers';
import { CoinlayerService } from './coinlayer.service';
import { realToScientific, scientificToReal } from '../utils';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly userStateRepo: Repository<CryptoLendingUserStateEntity>,
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    @InjectRepository(CryptoLoanOfferEntity)
    private readonly loanOfferRepo: Repository<CryptoLoanOfferEntity>,
    private readonly nftfiApiService: NftFiApiService,
    private readonly configService: ConfigService,
    private readonly openSeaService: OpenSeaService,
    private readonly coinlayerService: CoinlayerService,
  ) {}

  @CronWithErrorHandling({
    cronTime: '0 * * * *', // Run every hour at the start of the hour
    taskName: 'Update Bid Offers for All Collections',
  })
  async updateBidOffersForAllCollections() {
    const numLendingEligibleCollections = this.configService.get(
      'NUM_LENDING_ELIGIBLE_NFT_COLLECTIONS',
    );
    const numCollectionsToUpdate = numLendingEligibleCollections * 3;

    this.logger.log('Updating bid offers for all collections');

    const collections = await this.nftCollectionRepo.find({
      where: {
        blackListed: false,
      },
      order: {
        loanCount: 'DESC',
        name: 'ASC',
      },
      take: numCollectionsToUpdate,
    });
    this.logger.log(`Found ${collections.length} collections to update`);

    const updatePromises = collections.map(async (collection) => {
      try {
        const success =
          await this.openSeaService.updateCollectionBidOffers(collection);
        if (success) {
          await this.updateAverageApr(collection);
        }

        collection.enabled = success && collection.averageApr != null;
        return collection;
      } catch (error) {
        captureException({ error });
        return null;
      }
    });

    const results = await Promise.allSettled(updatePromises);

    const updatedCollections = results
      .filter(
        (result): result is PromiseFulfilledResult<NftCollectionEntity> =>
          result.status === 'fulfilled' && result.value != null,
      )
      .map((result) => result.value as NftCollectionEntity);

    if (updatedCollections.length > 0) {
      await this.nftCollectionRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const eligibleCollections = updatedCollections.slice(
            0,
            numLendingEligibleCollections,
          );

          // Set eligible collections to enabled
          eligibleCollections.forEach(
            (collection) => (collection.enabled = true),
          );

          // Set all other collections to disabled
          await transactionalEntityManager.update(
            NftCollectionEntity,
            { id: Not(In(eligibleCollections.map((c) => c.id))) },
            { enabled: false },
          );

          // Save the updated collections
          await transactionalEntityManager.save(
            NftCollectionEntity,
            eligibleCollections,
          );

          this.logger.log(
            `Updated ${updatedCollections.length} collections with new bid offers. Enabled ${eligibleCollections.length} collections.`,
          );
        },
      );
    }
    this.logger.log('Updated bid offers for all collections');
  }

  @CronWithErrorHandling({
    cronTime: '*/10 * * * *',
    taskName: 'Make Loan Offers',
  })
  async makeLoanOffers() {
    this.logger.log('Updating loan status');

    const activeUsers = await this.userStateRepo.find({
      where: {
        active: true,
      },
    });
    this.logger.log(`Found ${activeUsers.length} active users`);

    const loanEligibleCollections = await this.getLoanEligibleCollections();
    this.logger.log(
      `Found ${loanEligibleCollections.length} loan eligible collections`,
    );

    await Promise.all(
      activeUsers.map(async (userState) => {
        try {
          this.logger.log(`Syncing loan offers for userState ${userState.id}`);
          const numActiveOffers = await this.syncLoanOffers(userState);
          this.logger.log(
            `Synced ${numActiveOffers} active loan offers for userState ${userState.id}`,
          );

          if (numActiveOffers >= 1 || !userState.active) {
            this.logger.log(
              `Skipping making loan offers for userState ${userState.id}`,
            );
            return;
          }

          await Promise.all(
            loanEligibleCollections.map((collection) =>
              this.makeLoanOffersForCollection(collection, userState),
            ),
          );
          this.logger.log(
            `Dispatched loan offers for ${loanEligibleCollections.length} collections`,
          );
        } catch (error) {
          const exception = new CustomException('Failed to make loan offers', {
            error,
            userStateId: userState.id,
          });
          captureException({ error: exception });
        }
      }),
    );
  }

  async getTokenBalances(userId: string): Promise<Record<CryptoToken, string>> {
    const userState = await this.userStateRepo.findOneOrFail({
      where: { userId },
    });

    const walletAddress = userState.walletAddress;

    return {
      [CryptoToken.WETH]: await this.getTokenBalance(
        CryptoToken.WETH,
        walletAddress,
      ).toString(),
      [CryptoToken.DAI]: await this.getTokenBalance(
        CryptoToken.DAI,
        walletAddress,
      ).toString(),
      [CryptoToken.USDC]: await this.getTokenBalance(
        CryptoToken.USDC,
        walletAddress,
      ).toString(),
    };
  }

  private async makeLoanOffersForCollection(
    collection: NftCollectionEntity,
    userState: CryptoLendingUserStateEntity,
  ): Promise<void> {
    const collectionEthBidPrice = collection.avgTopFiveBids;
    const walletAddress = userState.walletAddress;
    const exchangeRates = this.coinlayerService.getExchangeRates();

    const ltvDurations: Array<{
      ltv: keyof CryptoLendingUserStateEntity;
      days: number;
    }> = [
      { ltv: 'oneWeekLTV', days: 7 },
      { ltv: 'twoWeeksLTV', days: 14 },
      { ltv: 'oneMonthLTV', days: 30 },
      { ltv: 'twoMonthsLTV', days: 60 },
      { ltv: 'threeMonthsLTV', days: 90 },
    ];

    for (const token of Object.values(CryptoToken)) {
      const balance = await this.getTokenBalance(token, walletAddress);
      if (balance.eq(0)) continue;

      const collectionBidPriceInToken = new Big(collectionEthBidPrice).mul(
        exchangeRates[token],
      );

      Promise.all(
        ltvDurations.map(async ({ ltv, days }) => {
          const ltvValue = userState[ltv] as number | null;
          if (!ltvValue) return;

          const requiredLtvAmount = collectionBidPriceInToken.mul(
            ltvValue / 100,
          );
          if (balance.lt(requiredLtvAmount)) return;

          await this.makeLoanOfferForCollection({
            collection,
            userState,
            token,
            requiredLtvAmount,
            durationInDays: days,
          });
        }),
      );
    }
  }

  private async makeLoanOfferForCollection({
    collection,
    userState,
    token,
    requiredLtvAmount,
    durationInDays,
  }: {
    collection: NftCollectionEntity;
    userState: CryptoLendingUserStateEntity;
    token: CryptoToken;
    requiredLtvAmount: Big;
    durationInDays: number;
  }) {
    try {
      const principal = realToScientific(requiredLtvAmount, token).toNumber();

      await this.nftfiApiService.makeLoanOffer({
        walletPrivateKey: userState.walletPrivateKey,
        collectionAddress: collection.contractAddress!,
        currencyAddress: CryptoTokenAddress[token],
        principal,
        apr: collection.averageApr.toNumber(),
        durationInDays,
        originationFee: 0,
        interestProrated: true,
      });
      this.logger.log(
        `Made loan offer for collection ${collection.id} with token ${token} for userState ${userState.id} for ${durationInDays} days`,
      );
    } catch (error) {
      const exception = new CustomException(
        'Failed to make loan offer for collection',
        {
          error,
          collection,
          userState,
          token,
          requiredLtvAmount,
          durationInDays,
        },
      );
      captureException({ error: exception, logger: this.logger });
    }
  }

  private async getLoanEligibleCollections() {
    return await this.nftCollectionRepo.find({
      where: { enabled: true },
    });
  }

  private async syncLoanOffers(userState: CryptoLendingUserStateEntity) {
    const activeOffers = await this.nftfiApiService.getOffersForWallet(
      userState.walletPrivateKey,
    );

    const nftCollectionMap = new Map<string, NftCollectionEntity>();

    const loanOfferEntities = await Promise.all(
      activeOffers.map(async (offer) => {
        if (!nftCollectionMap.has(offer.nft.address)) {
          const nftCollection = await this.nftCollectionRepo.findOneOrFail({
            where: { contractAddress: offer.nft.address },
          });
          nftCollectionMap.set(offer.nft.address, nftCollection);
        }

        const token = this.getTokenFromAddress(offer.terms.loan.currency);

        return {
          nftfiOfferId: offer.id,
          dateOffered: new Date(offer.date.offered),
          nftCollectionId: nftCollectionMap.get(offer.nft.address)!.id,
          userStateId: userState.id,
          loanCurrency: token,
          loanDuration: new Big(offer.terms.loan.duration.toString()),
          loanRepayment: scientificToReal(offer.terms.loan.repayment, token),
          loanPrincipal: scientificToReal(offer.terms.loan.principal, token),
          loanApr: new Big(offer.terms.loan.apr.toString()),
          loanExpiry: new Date(offer.terms.loan.expiry * 1000),
          loanInterestProrated: offer.terms.loan.interest.prorated,
          loanOrigination: scientificToReal(
            offer.terms.loan.origination,
            token,
          ),
          loanEffectiveApr: new Big(offer.terms.loan.effectiveApr),
          isActive: true,
        };
      }),
    );

    await this.loanOfferRepo.upsert(loanOfferEntities, {
      conflictPaths: ['nftfiOfferId'],
      skipUpdateIfNoValuesChanged: true,
    });

    await this.loanOfferRepo.update(
      {
        userStateId: userState.id,
        nftfiOfferId: Not(In(activeOffers.map((offer) => offer.id))),
        isActive: true,
      },
      { isActive: false },
    );

    return activeOffers.length;
  }

  private getTokenFromAddress(address: string): CryptoToken {
    const normalizedAddress = address.toLowerCase();
    for (const [token, tokenAddress] of Object.entries(CryptoTokenAddress)) {
      if (tokenAddress.toLowerCase() === normalizedAddress) {
        return token as CryptoToken;
      }
    }
    throw new Error('Invalid currency token address');
  }

  private async updateAverageApr(collection: NftCollectionEntity) {
    const offers = await this.nftfiApiService.getAllOffersForCollection(
      collection.contractAddress!,
    );

    if (offers.length === 0) {
      collection.averageApr = null;
      return;
    }

    const totalApr = offers.reduce((acc, offer) => {
      return acc.plus(offer.terms.loan.apr);
    }, new Big(0));
    const averageApr = totalApr.div(offers.length);
    collection.averageApr = averageApr;
  }

  private async getTokenBalance(
    token: CryptoToken,
    walletAddress: string,
  ): Promise<Big> {
    const providerUrl = this.configService.get('PROVIDER_URL');
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const contract = new ethers.Contract(
      CryptoTokenAddress[token],
      ['function balanceOf(address) view returns (uint256)'],
      provider,
    );
    const balance = await contract.balanceOf(walletAddress);
    return new Big(ethers.formatUnits(balance, CryptoTokenDecimals[token]));
  }
}
