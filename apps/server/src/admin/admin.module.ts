import { Module } from '@nestjs/common';
import { CryptoLendingModule } from '~/crypto-lending/crypto-lending.module';
import { DatabaseModule } from '~/database/database.module';
import { NotificationsModule } from '~/notifications/notifications.module';
import { TradingModule } from '~/trading/trading.module';
import { MonitorController } from './controllers/monitor.controller';
import { DataSeedController } from './controllers/nft-loans/data-seed/data-seed.controller';
import { NftLoansController } from './controllers/nft-loans/nft-loans.controller';
import { TestBrevoController } from './controllers/tests/test-brevo.controller';
import { TestIgController } from './controllers/tests/test-ig.controller';
import { TestNftFiController } from './controllers/tests/test-nftfi.controller';
import { TestOpenSeaController } from './controllers/tests/test-opensea.controller';
import { TestStrategyController } from './controllers/tests/test-strategy.controller';
import { DataSeedService } from './services/data-seed.service';

@Module({
  imports: [
    DatabaseModule,
    CryptoLendingModule,
    NotificationsModule,
    TradingModule,
  ],
  providers: [DataSeedService],
  controllers: [
    TestNftFiController,
    TestOpenSeaController,
    DataSeedController,
    NftLoansController,
    MonitorController,
    TestBrevoController,
    TestIgController,
    TestStrategyController,
  ],
})
export class AdminModule {}
