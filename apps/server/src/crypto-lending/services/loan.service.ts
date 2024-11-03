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
import { actualToWei, weiToActual } from '../utils';
import { InvestmentWalletService } from './investment-wallet.service';
import {
  NftFiLoanSortBy,
  NftFiLoanSortDirection,
  NftFiLoanStatus,
} from '../types/nftfi-types';
import { CryptoLoanEntity } from '~/database/entities/crypto-loan.entity';

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
    @InjectRepository(CryptoLoanEntity)
    private readonly loanRepo: Repository<CryptoLoanEntity>,
    private readonly nftfiApiService: NftFiApiService,
    private readonly configService: ConfigService,
    private readonly openSeaService: OpenSeaService,
    private readonly coinlayerService: CoinlayerService,
    private readonly investmentWalletService: InvestmentWalletService,
  ) {}

  @CronWithErrorHandling({
    cronTime: '0 * * * *',
    taskName: 'Sync NFT collections',
  })
  async syncNftCollections() {
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
          const eligibleCollections = updatedCollections
            .filter((c) => c.enabled)
            .slice(0, numLendingEligibleCollections);

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
    cronTime: '30 * * * *',
    taskName: 'Sync loans',
  })
  async syncLoans() {
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
        await this.makeLoanOffersForUser(userState, loanEligibleCollections);
        await this.syncCurrentlyActiveLoans(userState);
        // await this.takeDashboardSnapshot(userState);
      }),
    );
  }

  async makeLoanOffersForUser(
    userState: CryptoLendingUserStateEntity,
    loanEligibleCollections: NftCollectionEntity[],
  ) {
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
  }

  async getLoanEligibleCollections() {
    return await this.nftCollectionRepo.find({
      where: { enabled: true },
    });
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

    for (const token of Object.values(CryptoToken).filter(
      (t) => t !== CryptoToken.ETH,
    )) {
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
      const principal = actualToWei(requiredLtvAmount, token).toNumber();

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
          loanRepayment: weiToActual(offer.terms.loan.repayment, token),
          loanPrincipal: weiToActual(offer.terms.loan.principal, token),
          loanApr: new Big(offer.terms.loan.apr.toString()),
          loanExpiry: new Date(offer.terms.loan.expiry * 1000),
          loanInterestProrated: offer.terms.loan.interest.prorated,
          loanOrigination: weiToActual(offer.terms.loan.origination, token),
          loanEffectiveApr: new Big(offer.terms.loan.effectiveApr),
          isActive: true,
          errorMessage: offer.errors ? JSON.stringify(offer.errors) : null,
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

  private async syncCurrentlyActiveLoans(
    userState: CryptoLendingUserStateEntity,
  ) {
    this.logger.log(`Syncing active loans for userState ${userState.id}`);

    const currentActiveLoans = await this.loanRepo.find({
      where: {
        userStateId: userState.id,
        status: NftFiLoanStatus.Active,
      },
      order: {
        dueAt: 'DESC',
      },
    });

    this.logger.log(
      `Found ${currentActiveLoans.length} currently active loans in DB`,
    );

    const currentActiveLoansMap = new Map(
      currentActiveLoans.map((loan) => [loan.nftfiLoanId, loan]),
    );

    const nftCollectionMap = new Map<string, NftCollectionEntity>();

    // Sync Active Loans
    await this.fetchAndProcessLoans(
      userState,
      NftFiLoanStatus.Active,
      currentActiveLoans,
      currentActiveLoansMap,
      nftCollectionMap,
    );

    // Sync Defaulted Loans
    await this.fetchAndProcessLoans(
      userState,
      NftFiLoanStatus.Defaulted,
      currentActiveLoans,
      currentActiveLoansMap,
      nftCollectionMap,
    );

    // Sync Repaid Loans
    await this.fetchAndProcessLoans(
      userState,
      NftFiLoanStatus.Repaid,
      currentActiveLoans,
      currentActiveLoansMap,
      nftCollectionMap,
    );

    this.logger.log(`Finished syncing loans for userState ${userState.id}`);
  }

  private async fetchAndProcessLoans(
    userState: CryptoLendingUserStateEntity,
    status: NftFiLoanStatus,
    currentActiveLoans: CryptoLoanEntity[],
    currentActiveLoansMap: Map<string, CryptoLoanEntity>,
    nftCollectionMap: Map<string, NftCollectionEntity>,
  ) {
    let page = 1;
    const pageSize = 10;
    const earliestActiveLoanDueDate =
      currentActiveLoans[currentActiveLoans.length - 1]?.dueAt;
    const loansToCreate: Partial<CryptoLoanEntity>[] = [];
    const loansToUpdate: { id: string; updates: Partial<CryptoLoanEntity> }[] =
      [];

    while (true) {
      this.logger.log(`Fetching page ${page} of ${status} loans from NFTfi`);

      const sortOption = {
        by: NftFiLoanSortBy.DueDate,
        direction: NftFiLoanSortDirection.Desc,
      };
      const response =
        await this.nftfiApiService.getLentLoansForWalletPaginated(
          userState.walletPrivateKey,
          status,
          page,
          pageSize,
          sortOption,
        );

      const fetchedLoans = response.data.results;
      if (fetchedLoans.length === 0) {
        this.logger.log('No more loans found from NFTfi');
        break;
      }

      this.logger.log(`Processing ${fetchedLoans.length} loans from NFTfi`);

      const lastFetchedLoan = fetchedLoans[fetchedLoans.length - 1];
      const lastFetchedLoanDueDate = new Date(lastFetchedLoan.date.due);

      for (const loan of fetchedLoans) {
        const loanDueDate = new Date(loan.date.due);
        if (loanDueDate < earliestActiveLoanDueDate) {
          this.logger.log(
            'Reached loans earlier than earliest active loan, breaking',
          );
          break;
        }

        const existingLoan = currentActiveLoansMap.get(loan.id.toString());
        const nftAddress = loan.nft.address.toLowerCase();

        if (status === NftFiLoanStatus.Active && !existingLoan) {
          let nftCollection = nftCollectionMap.get(nftAddress);
          if (!nftCollection) {
            nftCollection = await this.nftCollectionRepo.findOne({
              where: { contractAddress: nftAddress },
            });
            if (!nftCollection) {
              this.logger.warn(
                `NFT Collection not found for address ${nftAddress}`,
              );
              continue;
            }
            nftCollectionMap.set(nftAddress, nftCollection);
          }

          const token = this.getTokenFromAddress(loan.terms.loan.currency);

          loansToCreate.push({
            nftfiLoanId: loan.id.toString(),
            userStateId: userState.id,
            status: NftFiLoanStatus.Active,
            startedAt: new Date(loan.date.started),
            repaidAt: null,
            dueAt: loanDueDate,
            nftCollectionId: nftCollection.id,
            nftTokenId: loan.nft.id,
            nftImageUrl: loan.nft.image.uri,
            borrowerWalletAddress: loan.borrower.address,
            loanDuration: loan.terms.loan.duration,
            loanRepayment: weiToActual(loan.terms.loan.repayment, token),
            loanPrincipal: weiToActual(loan.terms.loan.principal, token),
            loanApr: new Big(loan.terms.loan.apr),
            token,
            nftfiContractName: loan.nftfi.contract.name,
          });
        } else if (existingLoan) {
          if (status === NftFiLoanStatus.Defaulted) {
            loansToUpdate.push({
              id: existingLoan.id,
              updates: { status: NftFiLoanStatus.Defaulted },
            });
          } else if (status === NftFiLoanStatus.Repaid) {
            loansToUpdate.push({
              id: existingLoan.id,
              updates: {
                status: NftFiLoanStatus.Repaid,
                repaidAt: new Date(loan.date.repaid),
              },
            });
          }
        }
      }

      if (fetchedLoans.length < pageSize) {
        this.logger.log('Received less loans than page size, breaking');
        break;
      }
      if (lastFetchedLoanDueDate < earliestActiveLoanDueDate) {
        this.logger.log(
          'Last fetched loan is earlier than earliest active loan, breaking',
        );
        break;
      }
      page++;
    }

    this.logger.log(
      `Found ${loansToCreate.length} loans to create and ${loansToUpdate.length} loans to update`,
    );

    await Promise.all([
      loansToCreate.length > 0 && this.loanRepo.save(loansToCreate),
      ...loansToUpdate.map(({ id, updates }) =>
        this.loanRepo.update({ id }, updates),
      ),
    ]);
  }

  private async takeDashboardSnapshot(userState: CryptoLendingUserStateEntity) {
    const tokenBalances = await this.investmentWalletService.getTokenBalances(
      userState.userId,
    );
    // const
  }
}
