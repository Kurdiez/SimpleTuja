import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/database/database.module';
import { NotificationsModule } from '~/notifications/notifications.module';
import { CryptoLendingController } from './controllers/crypto-lending.controller';
import { InvestmentWalletController } from './controllers/investment-wallet.controller';
import { CoinlayerService } from './services/coinlayer.service';
import { CryptoLendingService } from './services/crypto-lending.service';
import { InvestmentWalletService } from './services/investment-wallet.service';
import { LoanService } from './services/loan.service';
import { NftFiApiService } from './services/nftfi-api.service';
import { OnboardingService } from './services/onboarding.service';
import { OpenSeaAPIService } from './services/opensea-api.service';
import { OpenSeaService } from './services/opensea.service';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  providers: [
    OnboardingService,
    OpenSeaAPIService,
    OpenSeaService,
    CryptoLendingService,
    CoinlayerService,
    LoanService,
    NftFiApiService,
    InvestmentWalletService,
  ],
  exports: [
    OpenSeaAPIService,
    OpenSeaService,
    CryptoLendingService,
    CoinlayerService,
    LoanService,
    NftFiApiService,
    InvestmentWalletService,
  ],
  controllers: [CryptoLendingController, InvestmentWalletController],
})
export class CryptoLendingModule {}
