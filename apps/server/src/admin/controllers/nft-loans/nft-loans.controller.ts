import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '~/commons/validations';
import { CoinlayerService } from '~/crypto-lending/services/coinlayer.service';
import { LoanService } from '~/crypto-lending/services/loan.service';
import { NftFiApiService } from '~/crypto-lending/services/nftfi-api.service';
import {
  ApproveTokenMaxAllowanceDto,
  approveTokenMaxAllowanceDtoSchema,
  GetTokenAllowanceDto,
  getTokenAllowanceDtoSchema,
  GetTokenBalanceDto,
  getTokenBalanceDtoSchema,
  UserIdDto,
  userIdDtoSchema,
} from '../schema';
import { InvestmentWalletService } from '~/crypto-lending/services/investment-wallet.service';

@Controller('admin/nft-loans')
export class NftLoansController {
  constructor(
    private readonly coinlayerService: CoinlayerService,
    private readonly loanService: LoanService,
    private readonly nftFiApiService: NftFiApiService,
    private readonly investmentWalletService: InvestmentWalletService,
  ) {}

  @Post('get-active-offers')
  async getActiveOffers(
    @Body(new ZodValidationPipe(userIdDtoSchema))
    { userId }: UserIdDto,
  ) {
    return await this.nftFiApiService.getOffersForUser(userId);
  }

  @Post('update-bid-offers')
  async updateBidOffersForAllCollections() {
    await this.loanService.updateBidOffersForAllCollections();
  }

  @Post('refresh-crypto-exchange-rates')
  async refreshCryptoExchangeRates() {
    await this.coinlayerService.updateCryptoExchangeRates();
  }

  @Post('make-loan-offers')
  async makeLoanOffers() {
    await this.loanService.makeLoanOffers();
  }

  @Post('get-token-balances')
  async getTokenBalances(
    @Body(new ZodValidationPipe(userIdDtoSchema))
    { userId }: UserIdDto,
  ) {
    return await this.investmentWalletService.getTokenBalances(userId);
  }

  @Post('get-token-allowance')
  async getTokenAllowance(
    @Body(new ZodValidationPipe(getTokenAllowanceDtoSchema))
    { userId, token }: GetTokenAllowanceDto,
  ) {
    const allowance = await this.nftFiApiService.getTokenAllowanceForUser(
      userId,
      token,
    );
    return allowance.toString();
  }

  @Post('approve-token-max-allowance')
  async approveTokenMaxAllowance(
    @Body(new ZodValidationPipe(approveTokenMaxAllowanceDtoSchema))
    { userId, token }: ApproveTokenMaxAllowanceDto,
  ) {
    return await this.nftFiApiService.approveTokenMaxAllowanceForUser(
      userId,
      token,
    );
  }

  @Post('get-token-balance')
  async getTokenBalance(
    @Body(new ZodValidationPipe(getTokenBalanceDtoSchema))
    { userId, token }: GetTokenBalanceDto,
  ) {
    return await this.investmentWalletService.getTokenBalance(userId, token);
  }
}
