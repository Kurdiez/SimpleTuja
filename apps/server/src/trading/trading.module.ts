import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/database/database.module';
import { GeminiAiService } from './services/gemini-ai.service';
import { IgApiService } from './services/ig-api.service';
import { N8NService } from './services/n8n.service';
import { PriceDataCollectorService } from './services/price-data/collector.service';
import { PriceDataQueryService } from './services/price-data/query.service';
import { PriceDataSubscriptionManagerService } from './services/price-data/subscription-manager.service';
import { Gemini_AI_Strategy } from './strategies/gemini-ai.strategy';

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
    Gemini_AI_Strategy,
  ],
  exports: [
    IgApiService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,

    // strategies
    Gemini_AI_Strategy,
  ],
})
export class TradingModule {}
