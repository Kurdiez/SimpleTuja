import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { CustomException } from '~/commons/errors/custom-exception';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { NftFiApiService } from './nftfi-api.service';
import { CryptoToken } from '@simpletuja/shared';
import { LoanService } from './loan.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly cryptoLendingUserStateRepo: Repository<CryptoLendingUserStateEntity>,
    private readonly nftfiApiService: NftFiApiService,
    private readonly loanService: LoanService,
  ) {}

  async getProgress(
    userId: string,
  ): Promise<CryptoLendingUserStateEntity | null> {
    return await this.cryptoLendingUserStateRepo.findOne({ where: { userId } });
  }

  async openAccount(userId: string) {
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

      return userState.walletAddress;
    } catch (error) {
      this.logger.error(`Error opening account for user ${userId}:`, error);
      throw new CustomException('Failed to open crypto investment account');
    }
  }

  async completeOnboardingFundAccount(userId: string): Promise<void> {
    this.logger.log(`Completing onboarding for user ${userId}`);
    await this.cryptoLendingUserStateRepo.update(
      { userId },
      { hasFundedTheAccount: true },
    );

    const tokens = Object.values(CryptoToken).filter(
      (token) => token !== CryptoToken.ETH,
    );
    for (const token of tokens) {
      this.logger.log(
        `Checking token allowance for user ${userId} and token ${token}`,
      );
      const allowance = await this.nftfiApiService.getTokenAllowanceForUser(
        userId,
        token,
      );
      this.logger.log(
        `Allowance for user ${userId} and token ${token}: ${allowance}`,
      );
      if (allowance.eq(0)) {
        this.logger.log(
          `Approving token max allowance for user ${userId} and token ${token}`,
        );
        await this.nftfiApiService.approveTokenMaxAllowanceForUser(
          userId,
          token,
        );
        this.logger.log(
          `Token max allowance approved for user ${userId} and token ${token}`,
        );
      }
    }

    this.logger.log(`Making loan offers for user ${userId}`);
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });
    const loanEligibleCollections =
      await this.loanService.getLoanEligibleCollections();
    await this.loanService.makeLoanOffersForUser(
      userState,
      loanEligibleCollections,
    );
    this.logger.log(`Loan offers made for user ${userId}`);

    await this.cryptoLendingUserStateRepo.update(
      { userId },
      { hasAllTokenAllowancesApproved: true, active: true },
    );
    this.logger.log(`All token allowances approved for user ${userId}`);
  }
}
