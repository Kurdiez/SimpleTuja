import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Big } from 'big.js';
import { Repository } from 'typeorm';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { CustomException } from '~/commons/errors/custom-exception';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import {
  TradeAction,
  TradeSignalResponse,
} from '../ai-response-schema/generate-signal';
import { GeminiAiService } from '../services/gemini-ai.service';
import { IgApiService } from '../services/ig-api.service';
import { PriceDataQueryService } from '../services/price-data/query.service';
import { PriceDataSubscriptionManagerService } from '../services/price-data/subscription-manager.service';
import {
  getIgEpicKey,
  IgEpic,
  PositionDirection,
  TimeResolution,
  TradingStrategy,
} from '../utils/const';
import {
  DataSubscription,
  IDataSubscriber,
  PriceUpdateEvent,
} from '../utils/types';

@Injectable()
export class Gemini_AI_Strategy implements OnModuleInit, IDataSubscriber {
  private readonly logger = new Logger(Gemini_AI_Strategy.name);
  private readonly epicsToTrade: IgEpic[];
  private subscriptions: DataSubscription[];
  private readonly DefaultRiskPercentage = 0.03; // 3% risk per trade

  constructor(
    private readonly priceDataSubscriptionManager: PriceDataSubscriptionManagerService,
    private readonly priceDataQueryService: PriceDataQueryService,
    private readonly geminiAiService: GeminiAiService,
    private readonly igApiService: IgApiService,
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepository: Repository<TradingPositionEntity>,
  ) {
    this.epicsToTrade = [IgEpic.EURUSD];
  }

  onModuleInit() {
    this.subscriptions = this.epicsToTrade.flatMap((epic) => [
      { epic, timeResolution: TimeResolution.MINUTE_15 },
      { epic, timeResolution: TimeResolution.HOUR },
    ]);

    this.priceDataSubscriptionManager.subscribe(this, this.subscriptions);
  }

  async onPriceUpdate(event: PriceUpdateEvent) {
    if (event.timeResolution === TimeResolution.MINUTE_15) {
      await this.handle15MinUpdate(event);
    }
  }

  async handle15MinUpdate(event: PriceUpdateEvent) {
    let signal: TradeSignalResponse;
    try {
      const signalGeneratorContextData =
        await this.prepSignalGeneratorContextData(event);

      signal = await this.geminiAiService.generateSignal(
        signalGeneratorContextData,
      );

      this.logger.log(
        'Received Gemini signal result:',
        JSON.stringify(signal, null, 2),
      );

      if (signal.tradeDecision.action === TradeAction.NONE) {
        return;
      }

      const direction =
        signal.tradeDecision.action === TradeAction.LONG
          ? PositionDirection.BUY
          : PositionDirection.SELL;

      const currentPrice = new Big(event.snapshot.closePrice.ask);
      const stopLossPrice = new Big(signal.tradeDecision.stopLoss);
      const takeProfitPrice = new Big(signal.tradeDecision.takeProfit);

      const dealReferenceId = await this.igApiService.placeBracketOrderWithRisk(
        {
          epic: event.epic,
          direction,
          riskPercentage: new Big(this.DefaultRiskPercentage),
          currentPrice,
          stopLossPrice,
          takeProfitPrice,
        },
      );

      await this.tradingPositionRepository.save({
        brokerDealId: dealReferenceId,
        strategy: TradingStrategy.N8N_AI,
        epic: event.epic,
        direction,
        metadata: {
          signal,
        },
      });
    } catch (error) {
      const exception = new CustomException(
        'Gemini AI Strategy failed to handle 15 min update',
        {
          error,
          epic: event.epic,
          signal,
        },
      );
      captureException({ error: exception });
    }
  }

  private async prepSignalGeneratorContextData(event: PriceUpdateEvent) {
    const pricePromises = this.epicsToTrade.flatMap((epic) =>
      this.subscriptions.map((sub) =>
        this.priceDataQueryService.getRecentPrices(
          epic,
          sub.timeResolution,
          210,
        ),
      ),
    );

    const prices = await Promise.all(pricePromises);

    const pricesByResolution = this.subscriptions.reduce(
      (acc, sub, index) => ({
        ...acc,
        [sub.timeResolution]: prices[index].map((price) => price.snapshot),
      }),
      {},
    );

    return {
      epic: getIgEpicKey(event.epic),
      prices: pricesByResolution,
      performanceReport: null,
    };
  }
}
