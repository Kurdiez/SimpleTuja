import { Controller, Post, HttpCode } from '@nestjs/common';
import { CoinlayerService } from '~/crypto-lending/services/coinlayer.service';
import { OpenSeaService } from '~/crypto-lending/services/opensea.service';

@Controller('admin/nft-loans')
export class NftLoansController {
  constructor(
    private readonly openSeaService: OpenSeaService,
    private readonly coinlayerService: CoinlayerService,
  ) {}

  @Post('update-bid-offers')
  @HttpCode(200)
  async updateBidOffersForAllCollections() {
    await this.openSeaService.updateBidOffersForAllCollections();
  }

  @Post('refresh-crypto-exchange-rates')
  @HttpCode(200)
  async refreshCryptoExchangeRates() {
    await this.coinlayerService.updateCryptoExchangeRates();
  }
}
