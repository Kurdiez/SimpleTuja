import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { NftFiApiService } from './nftfi-api.service';
import { CustomException } from '~/commons/errors/custom-exception';
import { captureException } from '~/commons/error-handlers/capture-exception';
// import { NftFiLoanOffer } from '../types/nftfi-types';
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
    private readonly nftFiApiService: NftFiApiService,
    private readonly configService: ConfigService,
    private readonly openSeaService: OpenSeaService,
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
          collection.enabled = true;
          return collection;
        }
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

  // @CronWithErrorHandling({
  //   cronTime: '*/10 * * * *',
  //   taskName: 'Make Loan Offers',
  // })
  async makeLoanOffers() {
    this.logger.log('Updating loan status');

    const activeUsers = await this.userStateRepo.find({
      where: {
        active: true,
      },
    });

    await Promise.all(
      activeUsers.map(async (userState) => {
        try {
          await this.syncLoanOffers(userState);
          // const loanEligibleCollections =
          //   await this.getLoanEligibleCollections(userState);

          // get enabled collections
          // filter collections that meet LTV requirements
          // make loan offers
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

  // private async getLoanEligibleCollections(
  //   userState: CryptoLendingUserStateEntity,
  // ) {
  //   // const enabledCollections = await this.nftCollectionRepo.find({
  //   //   where: { enabled: true },
  //   // });

  //   return [];
  // }

  private async syncLoanOffers(userState: CryptoLendingUserStateEntity) {
    const activeOffers = await this.nftFiApiService.getOffersForWallet(
      userState.walletPrivateKey,
    );

    const nftCollectionMap = new Map<string, NftCollectionEntity>();

    const weiToToken = (wei: number, token: CryptoToken) =>
      new Big(wei).div(new Big(10).pow(CryptoTokenDecimals[token]));

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
          loanRepayment: weiToToken(offer.terms.loan.repayment, token),
          loanPrincipal: weiToToken(offer.terms.loan.principal, token),
          loanApr: new Big(offer.terms.loan.apr.toString()),
          loanExpiry: new Date(offer.terms.loan.expiry * 1000),
          loanInterestProrated: offer.terms.loan.interest.prorated,
          loanOrigination: weiToToken(offer.terms.loan.origination, token),
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
    const offers = await this.nftFiApiService.getAllOffersForCollection(
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
}
