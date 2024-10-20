import { Module } from '@nestjs/common';
import { TestNftFiController } from './controllers/tests/test-nftfi.controller';
import { DataSeedController } from './controllers/nft-loans/data-seed/data-seed.controller';
import { DataSeedService } from './services/data-seed.service';
import { DatabaseModule } from '~/database/database.module';
import { TestOpenSeaController } from './controllers/tests/test-opensea.controller';
import { NftLoansController } from './controllers/nft-loans/update-bid-offers-for-all-NFT-collections.controller';
import { MonitorController } from './controllers/monitor.controller';
import { CryptoLendingModule } from '~/crypto-lending/crypto-lending.module';

@Module({
  imports: [DatabaseModule, CryptoLendingModule],
  providers: [DataSeedService],
  controllers: [
    TestNftFiController,
    TestOpenSeaController,
    DataSeedController,
    NftLoansController,
    MonitorController,
  ],
})
export class AdminModule {}
