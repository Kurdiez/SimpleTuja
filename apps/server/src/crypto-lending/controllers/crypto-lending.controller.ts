import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { OnboardingService } from '../services/onboarding.service';
import { zodResTransform, ZodValidationPipe } from '~/commons/validations';
import {
  CompleteOnboardingFuncAccountDto,
  CompleteOnboardingFuncAccountDtoSchema,
  CryptoExchangeRatesDtoSchema,
  CryptoLendingUserStateDtoSchema,
  LoanEligibleNftCollectionsDtoSchema,
  LoanSettingsUpdateDto,
  LoanSettingsUpdateRequestSchema,
  UpdateActiveStatusDto,
  UpdateActiveStatusDtoSchema,
} from '@simpletuja/shared';
import { Response } from 'express';
import { CryptoLendingService } from '../services/crypto-lending.service';
import { CoinlayerService } from '../services/coinlayer.service';

@Controller('crypto-lending')
export class CryptoLendingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly cryptoLendingService: CryptoLendingService,
    private readonly coinlayerService: CoinlayerService,
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
    await this.cryptoLendingService.updateLoanSettings(
      userId,
      loanSettingsUpdateDto,
    );
  }

  @Post('update-active-status')
  async updateActiveStatus(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(UpdateActiveStatusDtoSchema))
    { active }: UpdateActiveStatusDto,
  ) {
    await this.cryptoLendingService.updateActiveStatus(req.user.id, active);
  }

  @Post('complete-onboarding-fund-account')
  async completeOnboardingFundAccount(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CompleteOnboardingFuncAccountDtoSchema))
    { startLendingRightAway }: CompleteOnboardingFuncAccountDto,
  ) {
    await this.onboardingService.completeOnboardingFundAccount(
      req.user.id,
      startLendingRightAway,
    );
  }

  @Post('get-loan-eligible-nft-collections')
  async getLoanEligibleNftCollections() {
    const collections =
      await this.cryptoLendingService.getLoanEligibleNftCollections();
    return zodResTransform(collections, LoanEligibleNftCollectionsDtoSchema);
  }

  @Post('get-crypto-exchange-rates')
  getCryptoExchangeRates() {
    const rates = this.coinlayerService.getExchangeRates();
    return zodResTransform(rates, CryptoExchangeRatesDtoSchema);
  }
}
