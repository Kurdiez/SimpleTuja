import { Module } from '@nestjs/common';
import { OpenSeaService } from './services/opensea.service';
import { OpenSeaAPIService } from './services/opensea-api.service';
import { CryptoLendingController } from './controllers/crypto-lending.controller';
import { OnboardingService } from './services/onboarding.service';
import { CryptoLendingService } from './services/crypto-lending.service';
import { DatabaseModule } from '~/database/database.module';
import { CoinlayerService } from './services/coinlayer.service';
import { LoanService } from './services/loan.service';
import { NftFiApiService } from './services/nftfi-api.service';
import { InvestmentWalletService } from './services/investment-wallet.service';
import { InvestmentWalletController } from './controllers/investment-wallet.controller';

@Module({
  imports: [DatabaseModule],
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
