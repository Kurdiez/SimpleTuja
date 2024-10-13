import { Controller, Post, HttpCode } from '@nestjs/common';
import { OpenSeaService } from '~/crypto-lending/services/opensea.service';

@Controller('admin/nft-loans')
export class UpdateBidOffersForAllNFTCollectionsController {
  constructor(private readonly openSeaService: OpenSeaService) {}

  @Post('update-bid-offers')
  @HttpCode(200)
  async updateBidOffersForAllCollections() {
    await this.openSeaService.updateBidOffersForAllCollections();
  }
}
