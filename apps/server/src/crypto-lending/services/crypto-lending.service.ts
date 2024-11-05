import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CryptoLendingDashboardDataDto,
  LoanEligibleNftCollectionsDto,
  LoanSettingsUpdateDto,
} from '@simpletuja/shared';
import { Repository } from 'typeorm';
import { CustomException } from '~/commons/errors/custom-exception';
import { CryptoDashboardSnapshotEntity } from '~/database/entities/crypto-dashboard-snapshot.entity';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { OnboardingService } from './onboarding.service';

@Injectable()
export class CryptoLendingService {
  private readonly logger = new Logger(CryptoLendingService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly cryptoLendingUserStateRepo: Repository<CryptoLendingUserStateEntity>,
    @InjectRepository(CryptoDashboardSnapshotEntity)
    private readonly cryptoDashboardSnapshotRepo: Repository<CryptoDashboardSnapshotEntity>,
    private readonly onboardingService: OnboardingService,
  ) {}

  async updateLoanSettings(
    userId: string,
    loanSettingsUpdateDto: LoanSettingsUpdateDto,
  ): Promise<void> {
    this.logger.log(`Updating loan settings for user ${userId}`);

    const userState = await this.onboardingService.getProgress(userId);

    if (!userState) {
      throw new CustomException('User state not found');
    }

    userState.oneWeekLTV = loanSettingsUpdateDto.oneWeekLTV;
    userState.twoWeeksLTV = loanSettingsUpdateDto.twoWeeksLTV;
    userState.oneMonthLTV = loanSettingsUpdateDto.oneMonthLTV;
    userState.twoMonthsLTV = loanSettingsUpdateDto.twoMonthsLTV;
    userState.threeMonthsLTV = loanSettingsUpdateDto.threeMonthsLTV;
    userState.foreclosureWalletAddress =
      loanSettingsUpdateDto.foreclosureWalletAddress;
    userState.hasCompletedLoanSettings = true;

    await this.cryptoLendingUserStateRepo.save(userState);

    this.logger.log(
      `Loan settings updated successfully for user ${userId}. ${JSON.stringify(
        loanSettingsUpdateDto,
      )}`,
    );
  }

  async getLoanEligibleNftCollections(): Promise<LoanEligibleNftCollectionsDto> {
    this.logger.log('Fetching loan eligible NFT collections');

    const eligibleCollections = await this.nftCollectionRepo.find({
      where: { enabled: true },
    });

    return eligibleCollections.map((collection) => ({
      ...collection,
      avgTopBids: collection.avgTopFiveBids.toNumber(),
    }));
  }

  async updateActiveStatus(userId: string, active: boolean) {
    await this.cryptoLendingUserStateRepo.update(userId, { active });
  }

  async getDashboardData(
    userId: string,
  ): Promise<CryptoLendingDashboardDataDto | null> {
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });

    const snapshot = await this.cryptoDashboardSnapshotRepo.findOne({
      where: { userStateId: userState.id },
    });

    if (!snapshot) {
      return null;
    }

    return {
      walletAddress: userState.walletAddress,
      ethBalance: snapshot.ethBalance.toString(),
      wethBalance: snapshot.wethBalance.toString(),
      daiBalance: snapshot.daiBalance.toString(),
      usdcBalance: snapshot.usdcBalance.toString(),
      activeOffers: snapshot.activeOffers,
      activeLoans: snapshot.activeLoans,
      repaidLoans: snapshot.repaidLoans,
      liquidatedLoans: snapshot.liquidatedLoans,
      wethActiveLoansPrincipal: snapshot.wethActiveLoansPrincipal.toString(),
      daiActiveLoansPrincipal: snapshot.daiActiveLoansPrincipal.toString(),
      usdcActiveLoansPrincipal: snapshot.usdcActiveLoansPrincipal.toString(),
      wethActiveLoansRepayment: snapshot.wethActiveLoansRepayment.toString(),
      daiActiveLoansRepayment: snapshot.daiActiveLoansRepayment.toString(),
      usdcActiveLoansRepayment: snapshot.usdcActiveLoansRepayment.toString(),
    };
  }
}
