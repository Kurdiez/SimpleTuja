import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '~/database/database.module';
import { GeminiAiService } from './services/gemini-ai.service';
import { IgApiService } from './services/ig-api.service';
import { PriceDataCollectorService } from './services/price-data/collector.service';
import { PriceDataQueryService } from './services/price-data/query.service';
import { PriceDataSubscriptionManagerService } from './services/price-data/subscription-manager.service';
import { TradingPositionService } from './services/trading-position.service';
import { DTIG_AI_STRATEGY } from './strategies/DTIG_AI.strategy';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  providers: [
    IgApiService,
    TradingPositionService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,
    PriceDataQueryService,
    GeminiAiService,

    // strategies
    DTIG_AI_STRATEGY,
  ],
  exports: [
    IgApiService,
    TradingPositionService,
    PriceDataCollectorService,
    PriceDataSubscriptionManagerService,

    // strategies
    DTIG_AI_STRATEGY,
  ],
})
export class TradingModule {}
