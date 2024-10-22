import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import {
  LoanEligibleNftCollectionsDto,
  LoanSettingsUpdateDto,
} from '@simpletuja/shared';
import { OnboardingService } from './onboarding.service';
import { CustomException } from '~/commons/errors/custom-exception';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';

@Injectable()
export class CryptoLendingService {
  private readonly logger = new Logger(CryptoLendingService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly cryptoLendingUserStateRepo: Repository<CryptoLendingUserStateEntity>,
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
}
