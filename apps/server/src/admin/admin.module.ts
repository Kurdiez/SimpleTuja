import { Module } from '@nestjs/common';
import { TestController } from './controllers/test.controller';
import { DataSeedController } from './controllers/data-seed/data-seed.controller';
import { DataSeedService } from './services/data-seed.service';
import { DatabaseModule } from '~/database/database.module';
import { NftLoansModule } from '~/nft-loans/nft-loans.module';

@Module({
  imports: [DatabaseModule, NftLoansModule],
  providers: [DataSeedService],
  controllers: [TestController, DataSeedController],
})
export class AdminModule {}
