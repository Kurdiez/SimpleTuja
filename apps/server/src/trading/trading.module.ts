import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/database/database.module';
import { IgApiService } from './services/ig-api.service';
import { PriceCollectorService } from './services/price-collector.service';
import { PriceDataSubscriptionManagerService } from './services/price-data-subscription-manager.service';
import { DTMR_PAC_Strategy } from './strategies/DTMR-PAC.strategy';

@Module({
  imports: [DatabaseModule],
  providers: [
    IgApiService,
    PriceCollectorService,
    PriceDataSubscriptionManagerService,

    // strategies
    DTMR_PAC_Strategy,
  ],
  exports: [
    IgApiService,
    PriceCollectorService,
    PriceDataSubscriptionManagerService,
  ],
})
export class TradingModule {}
