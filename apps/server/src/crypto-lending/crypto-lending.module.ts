import { Module } from '@nestjs/common';
import { OpenSeaService } from './services/opensea.service';
import { OpenSeaAPIService } from './services/opensea-api.service';
import { CryptoLendingController } from './controllers/crypto-lending.controller';
import { OnboardingService } from './services/onboarding.service';
import { CryptoLendingService } from './services/crypto-lending.service';
import { DatabaseModule } from '~/database/database.module';
import { CoinlayerService } from './services/coinlayer.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    OnboardingService,
    OpenSeaAPIService,
    OpenSeaService,
    CryptoLendingService,
    CoinlayerService,
  ],
  exports: [
    OpenSeaAPIService,
    OpenSeaService,
    CryptoLendingService,
    CoinlayerService,
  ],
  controllers: [CryptoLendingController],
})
export class CryptoLendingModule {}
