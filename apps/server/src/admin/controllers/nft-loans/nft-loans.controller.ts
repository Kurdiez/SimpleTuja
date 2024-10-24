import { Controller, Post } from '@nestjs/common';
import { CoinlayerService } from '~/crypto-lending/services/coinlayer.service';
import { LoanService } from '~/crypto-lending/services/loan.service';
import { NftFiApiService } from '~/crypto-lending/services/nftfi-api.service';

@Controller('admin/nft-loans')
export class NftLoansController {
  constructor(
    private readonly coinlayerService: CoinlayerService,
    private readonly loanService: LoanService,
    private readonly nftFiApiService: NftFiApiService,
  ) {}

  @Post('get-my-offers')
  async getMyOffers() {
    return await this.nftFiApiService.getOffersForWallet('');
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
}
