import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/database/database.module';
import { GeminiAiService } from './services/gemini-ai.service';
import { IgApiService } from './services/ig-api.service';
import { N8NService } from './services/n8n.service';
import { PriceDataCollectorService } from './services/price-data/collector.service';
import { PriceDataQueryService } from './services/price-data/query.service';
import { PriceDataSubscriptionManagerService } from './services/price-data/subscription-manager.service';
import { DTIG_AI_STRATEGY } from './strategies/DTIG_AI.strategy';

@Module({
  imports: [DatabaseModule],
  providers: [
    IgApiService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,
    PriceDataQueryService,
    N8NService,
    GeminiAiService,

    // strategies
    DTIG_AI_STRATEGY,
  ],
  exports: [
    IgApiService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,

    // strategies
    DTIG_AI_STRATEGY,
  ],
})
export class TradingModule {}
