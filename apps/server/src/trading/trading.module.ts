import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/database/database.module';
import { IgApiService } from './services/ig-api.service';
import { N8NService } from './services/n8n.service';
import { PriceDataCollectorService } from './services/price-data/collector.service';
import { PriceDataQueryService } from './services/price-data/query.service';
import { PriceDataSubscriptionManagerService } from './services/price-data/subscription-manager.service';
import { N8N_AI_Strategy } from './strategies/n8n-ai.strategy';
@Module({
  imports: [DatabaseModule],
  providers: [
    IgApiService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,
    PriceDataQueryService,
    N8NService,

    // strategies
    N8N_AI_Strategy,
  ],
  exports: [
    IgApiService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,

    // strategies
    N8N_AI_Strategy,
  ],
})
export class TradingModule {}
