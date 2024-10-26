import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '~/commons/validations';
import { CoinlayerService } from '~/crypto-lending/services/coinlayer.service';
import { LoanService } from '~/crypto-lending/services/loan.service';
import { NftFiApiService } from '~/crypto-lending/services/nftfi-api.service';
import { UserIdDto, userIdDtoSchema } from '../schema';

@Controller('admin/nft-loans')
export class NftLoansController {
  constructor(
    private readonly coinlayerService: CoinlayerService,
    private readonly loanService: LoanService,
    private readonly nftFiApiService: NftFiApiService,
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
    return await this.loanService.getTokenBalances(userId);
  }
}
