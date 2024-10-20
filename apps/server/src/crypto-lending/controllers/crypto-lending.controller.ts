import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { OnboardingService } from '../services/onboarding.service';
import { zodResTransform, ZodValidationPipe } from '~/commons/validations';
import {
  CryptoLendingUserStateDtoSchema,
  LoanEligibleNftCollectionsDtoSchema,
  LoanSettingsUpdateDto,
  LoanSettingsUpdateRequestSchema,
} from '@simpletuja/shared';
import { Response } from 'express';
import { CryptoLendingService } from '../services/crypto-lending.service';

@Controller('crypto-lending')
export class CryptoLendingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly cryptoLendingService: CryptoLendingService,
  ) {}

  @Post('get-onboarding-progress')
  async getProgress(
    @Req() { user }: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const userState = await this.onboardingService.getProgress(user.id);
    res.json(zodResTransform(userState, CryptoLendingUserStateDtoSchema));
  }

  @Post('open-account')
  async openAccount(@Req() { user }: AuthenticatedRequest) {
    await this.onboardingService.openAccount(user.id);
  }

  @Post('update-loan-settings')
  async updateLoanSettings(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(LoanSettingsUpdateRequestSchema))
    loanSettingsUpdateDto: LoanSettingsUpdateDto,
  ) {
    const userId = req.user.id;
    await this.onboardingService.updateLoanSettings(
      userId,
      loanSettingsUpdateDto,
    );
  }

  @Post('get-loan-eligible-nft-collections')
  async getLoanEligibleNftCollections() {
    const collections =
      await this.cryptoLendingService.getLoanEligibleNftCollections();
    return zodResTransform(collections, LoanEligibleNftCollectionsDtoSchema);
  }
}
