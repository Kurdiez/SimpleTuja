import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import {
  cryptoExchangeRatesDtoSchema,
  cryptoLendingDashboardDataDtoSchema,
  cryptoLendingUserStateDtoSchema,
  loanEligibleNftCollectionsDtoSchema,
  LoanSettingsUpdateDto,
  loanSettingsUpdateRequestSchema,
  UpdateActiveStatusDto,
  updateActiveStatusDtoSchema,
} from '@simpletuja/shared';
import { Response } from 'express';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { zodResTransform, ZodValidationPipe } from '~/commons/validations';
import { CoinlayerService } from '../services/coinlayer.service';
import { CryptoLendingService } from '../services/crypto-lending.service';
import { OnboardingService } from '../services/onboarding.service';

@Controller('crypto-lending')
export class CryptoLendingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly cryptoLendingService: CryptoLendingService,
    private readonly coinlayerService: CoinlayerService,
  ) {}

  @Post('get-crypto-user-state')
  async getProgress(
    @Req() { user }: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const userState = await this.onboardingService.getProgress(user.id);
    res.json(zodResTransform(userState, cryptoLendingUserStateDtoSchema));
  }

  @Post('open-account')
  async openAccount(@Req() { user }: AuthenticatedRequest) {
    return await this.onboardingService.openAccount(user.id);
  }

  @Post('update-loan-settings')
  async updateLoanSettings(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(loanSettingsUpdateRequestSchema))
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
    @Body(new ZodValidationPipe(updateActiveStatusDtoSchema))
    { active }: UpdateActiveStatusDto,
  ) {
    await this.cryptoLendingService.updateActiveStatus(req.user.id, active);
  }

  @Post('complete-onboarding-fund-account')
  async completeOnboardingFundAccount(@Req() req: AuthenticatedRequest) {
    await this.onboardingService.completeOnboardingFundAccount(req.user.id);
  }

  @Post('get-loan-eligible-nft-collections')
  async getLoanEligibleNftCollections() {
    const collections =
      await this.cryptoLendingService.getLoanEligibleNftCollections();
    return zodResTransform(collections, loanEligibleNftCollectionsDtoSchema);
  }

  @Post('get-crypto-exchange-rates')
  getCryptoExchangeRates() {
    const rates = this.coinlayerService.getExchangeRates();
    return zodResTransform(rates, cryptoExchangeRatesDtoSchema);
  }

  @Post('get-dashboard-data')
  async getDashboardData(@Req() req: AuthenticatedRequest) {
    const data = await this.cryptoLendingService.getDashboardData(req.user.id);
    return zodResTransform(data, cryptoLendingDashboardDataDtoSchema);
  }
}
