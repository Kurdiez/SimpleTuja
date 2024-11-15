import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import {
  cryptoExchangeRatesDtoSchema,
  cryptoLendingDashboardDataDtoSchema,
  cryptoLendingUserStateDtoSchema,
  GetLoanOffersRequest,
  getLoanOffersRequestSchema,
  GetLoanOffersResponse,
  getLoanOffersResponseSchema,
  GetLoansRequest,
  getLoansRequestSchema,
  GetLoansResponse,
  getLoansResponseSchema,
  loanEligibleNftCollectionsDtoSchema,
  LoanSettingsUpdateDto,
  loanSettingsUpdateRequestSchema,
  NftFiLoanStatus,
  UpdateActiveStatusDto,
  updateActiveStatusDtoSchema,
} from '@simpletuja/shared';
import { Response } from 'express';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { zodResTransform, ZodValidationPipe } from '~/commons/validations';
import { CryptoLoanOfferEntity } from '~/database/entities/crypto-loan-offer.entity';
import { CryptoLoanEntity } from '~/database/entities/crypto-loan.entity';
import { PaginatedRequest } from '~/database/types';
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

  @Post('get-loan-offers')
  async getLoanOffers(
    @Req() { user }: AuthenticatedRequest,
    @Body(new ZodValidationPipe(getLoanOffersRequestSchema))
    params: GetLoanOffersRequest,
  ): Promise<GetLoanOffersResponse> {
    const offers = await this.cryptoLendingService.getLoanOffers(
      user.id,
      params as unknown as PaginatedRequest<
        CryptoLoanOfferEntity,
        { isActive?: boolean }
      >,
    );

    const transformedOffers = {
      ...offers,
      items: offers.items.map((offer) => ({
        ...offer,
        loanDuration: offer.loanDuration.toNumber(),
        loanRepayment: offer.loanRepayment.toString(),
        loanPrincipal: offer.loanPrincipal.toString(),
        loanApr: offer.loanApr.toString(),
        loanOrigination: offer.loanOrigination.toString(),
        loanEffectiveApr: offer.loanEffectiveApr.toString(),
      })),
    };

    return zodResTransform(transformedOffers, getLoanOffersResponseSchema);
  }

  @Post('get-loans')
  async getLoans(
    @Req() { user }: AuthenticatedRequest,
    @Body(new ZodValidationPipe(getLoansRequestSchema))
    params: GetLoansRequest,
  ): Promise<GetLoansResponse> {
    const loans = await this.cryptoLendingService.getLoans(
      user.id,
      params as unknown as PaginatedRequest<
        CryptoLoanEntity,
        { status?: NftFiLoanStatus }
      >,
    );

    const transformedLoans = {
      ...loans,
      items: loans.items.map((loan) => ({
        ...loan,
        loanDuration: loan.loanDuration,
        loanRepayment: loan.loanRepayment.toString(),
        loanPrincipal: loan.loanPrincipal.toString(),
        loanApr: loan.loanApr.toString(),
      })),
    };

    return zodResTransform(transformedLoans, getLoansResponseSchema);
  }
}
