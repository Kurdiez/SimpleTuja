import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { CustomException } from '~/commons/errors/custom-exception';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { LoanSettingsUpdateDto } from '@simpletuja/shared';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly cryptoLendingUserStateRepo: Repository<CryptoLendingUserStateEntity>,
  ) {}

  async getProgress(
    userId: string,
  ): Promise<CryptoLendingUserStateEntity | null> {
    return await this.cryptoLendingUserStateRepo.findOne({ where: { userId } });
  }

  async openAccount(userId: string): Promise<void> {
    this.logger.log(`Opening account for user ${userId}`);

    let userState = await this.getProgress(userId);

    if (!userState) {
      userState = new CryptoLendingUserStateEntity();
      userState.userId = userId;
    } else if (userState.hasOpenedCryptoInvestmentAccount) {
      return;
    }

    try {
      // Create a new wallet
      const wallet = ethers.Wallet.createRandom();

      // Update the user state
      userState.walletPrivateKey = wallet.privateKey;
      userState.walletAddress = wallet.address;
      userState.hasOpenedCryptoInvestmentAccount = true;

      this.logger.log(
        `Wallet address ${userState.walletAddress} created for user ${userId}`,
      );

      // Save the updated or new user state
      await this.cryptoLendingUserStateRepo.save(userState);

      this.logger.log(`Account opened successfully for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error opening account for user ${userId}:`, error);
      throw new CustomException('Failed to open crypto investment account');
    }
  }

  async updateLoanSettings(
    userId: string,
    loanSettingsUpdateDto: LoanSettingsUpdateDto,
  ): Promise<void> {
    this.logger.log(`Updating loan settings for user ${userId}`);

    const userState = await this.getProgress(userId);

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
}
