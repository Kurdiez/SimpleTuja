import { Module } from '@nestjs/common';
import { TestNftFiController } from './controllers/tests/test-nftfi.controller';
import { DataSeedController } from './controllers/nft-loans/data-seed/data-seed.controller';
import { DataSeedService } from './services/data-seed.service';
import { DatabaseModule } from '~/database/database.module';
import { NftLoansModule } from '~/nft-loans/nft-loans.module';
import { TestOpenSeaController } from './controllers/tests/test-opensea.controller';
import { UpdateBidOffersForAllNFTCollectionsController } from './controllers/nft-loans/update-bid-offers-for-all-NFT-collections.controller';
import { MonitorController } from './controllers/monitor.controller';

@Module({
  imports: [DatabaseModule, NftLoansModule],
  providers: [DataSeedService],
  controllers: [
    TestNftFiController,
    TestOpenSeaController,
    DataSeedController,
    UpdateBidOffersForAllNFTCollectionsController,
    MonitorController,
  ],
})
export class AdminModule {}
