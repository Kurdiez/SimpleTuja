import { PromptTemplate } from '@langchain/core/prompts';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Big } from 'big.js';
import {
  BollingerBands,
  EMA,
  MACD,
  RSI,
  Stochastic,
} from 'technicalindicators';
import { Repository } from 'typeorm';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { CustomException } from '~/commons/errors/custom-exception';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import {
  TradeAction,
  TradeSignalResponse,
  tradeSignalResponseSchema,
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

// Dual_Timeframe_Indicators_Gemini_AI_Strategy (DTIG_AI_STRATEGY)
@Injectable()
export class DTIG_AI_STRATEGY implements OnModuleInit, IDataSubscriber {
  private readonly logger = new Logger(DTIG_AI_STRATEGY.name);
  private readonly epicsToTrade: IgEpic[];
  private subscriptions: DataSubscription[];
  private readonly DefaultRiskPercentage = 0.03; // 3% risk per trade
  private readonly promptTemplate: PromptTemplate;
  private readonly INDICATOR_PARAMS = {
    hourly: {
      ema: {
        fast: 8,
        medium: 21,
        slow: 50,
      },
      rsi: {
        period: 14,
      },
      ichimoku: {
        conversionPeriod: 9,
        basePeriod: 26,
        leadingSpanBPeriod: 52,
        laggingSpanPeriod: 26,
      },
    },
    minute15: {
      stochRsi: {
        rsiPeriod: 14,
        stochasticPeriod: 14,
        dPeriod: 3,
      },
      bollingerBands: {
        period: 20,
        stdDev: 2,
      },
      macd: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      },
    },
  };

  constructor(
    private readonly priceDataSubscriptionManager: PriceDataSubscriptionManagerService,
    private readonly priceDataQueryService: PriceDataQueryService,
    private readonly geminiAiService: GeminiAiService,
    private readonly igApiService: IgApiService,
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepository: Repository<TradingPositionEntity>,
  ) {
    this.epicsToTrade = [IgEpic.EURUSD];
    this.promptTemplate = PromptTemplate.fromTemplate(`
      Who you are:
      - You are a swing trader who should hold position on average 1-2 days.
      - You analyze two timeframes, one longer and one shorter, with multiple indicators for multiple confirmations.
      
      Here are the analysis steps you should follow.

      Analysis Steps:
      1. The goal of longer term analysis is to find out if there is a setup for a trade. First analyze whether the longer term timeframe is trending. Use the 3 provided indicators to analyze, state your conclusion in the form of confidence score from 0 - 10 with the reasoning.
      2. Analyze whether the longer term timeframe is trading in a trading range. Use the 3 provided indicators to analyze, state your conclusion in the form of confidence score from 0 - 10 with the reasoning.
      3. Analyze whether the longer term timeframe is in an extreme imbalance and about to do mean reversion. Use the 3 provided indicators to analyze, state your conclusion in the form of confidence score from 0 - 10 with the reasoning.
      4. State which of the 3 analysis you are choosing to trade. The confidence score has to be at least 7 and the chosen analysis has to have the highest confidence score. If there is no clear winner, you should return "none" as the trade action to not trade.
      5. State what are the immediate significant price levels from the current market price in the longer term prices which can act as the stop loss and take profit prices.
      6. The goal of shorter term analysis is to find out whether the entry setup exists and a position should be opened now. Use the overall price prediction from longer timeframe analysis and the 3 indicators provided for the shorter timeframe to confirm an entry setup. State your findings.
      7. Only if the confidence score from step 6 is at least 7, then you should state the trade decision with the stop loss and take profit prices based on the significant price levels from step 5.
      8. Based on the entry price, stop loss and take profit prices, calculate the reward / risk ratio.If the reward / risk ratio is greater or equal to 3, then this is a good setup that a trade should be take place. State your findings.

      Here are the inputs you should be receiving to perform the analysis:

      The trading epic (asset): {epic}
      
      Two timeframe price data by time resolutions, price data sorted in chronological order:
      {prices}

      Shorter term indicators, their parameter values and their computed values in chronological order:
      {indicators}

      Performance Report:
      - Comprehensive historical trading performance report for this epic done by you in the past. It summarizes your past performances for you to consider.
      - Includes overall summary of past individual trade logs that has all the contextual data like prices, indicator values used, P&L, thought process behind decision making and any other useful information for each time period 1 month, 3months, 6 months, 1 year.
      - Includes individual trade logs of 20 most recent trades for {epic} that the signal generator, order executioner and risk manager agents have left behind and their thought process per trade.
      
      Performance Report content:
      {performanceReport}

      Your output JSON:
      - The output should be exactly the way described in the zod schema
      - tradeSignalResponseSchema from below is the zod schema in Typescript for you to use for generating output.
      - action should be one of these values: long, short, none
      - nearFuturePricePatterns should be one of these values: trend-continuation, trading-range, extreme-imbalance-mean-reversal
      - nearFutureDirectionPrediction should be one of these values: up, down, sideways
      - always include the stepAnalysis as an array of strings in the output, each string is the answer to the questions in the analysis steps above
      
      Expected JSON Output zod Schema:
      import {{ z }} from 'zod';

      export enum TradeAction {{
        Long = 'long',
        Short = 'short',
        None = 'none',
      }}
      export enum NearFuturePricePatterns {{
        TrendContinuation = 'trend-continuation',
        TradingRange = 'trading-range',
        ExtremeImbalanceMeanReversal = 'extreme-imbalance-mean-reversal',
      }}

      const activeTradeSchema = z.object({{
        tradeDecision: z.object({{
          action: z.nativeEnum(TradeAction).refine((val) => val !== 'none'),
          stopLoss: z.string().regex(/^\\d*\\.?\\d+$/, 'Must be a valid price string'),
          takeProfit: z.string().regex(/^\\d*\\.?\\d+$/, 'Must be a valid price string'),
        }}),
        stepAnalysis: z.array(z.string()),
      }});

      const noTradeSchema = z.object({{
        tradeDecision: z.object({{
          action: z.nativeEnum(TradeAction).refine((val) => val === 'none'),
        }}),
        stepAnalysis: z.array(z.string()),
      }});

      export const tradeSignalResponseSchema = z.union([
        activeTradeSchema,
        noTradeSchema,
      ]);
    `);
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

      const hourPrices = this.getAveragePrices(
        signalGeneratorContextData.prices[TimeResolution.HOUR],
      );
      const min15Prices = this.getAveragePrices(
        signalGeneratorContextData.prices[TimeResolution.MINUTE_15],
      );

      const hourIndicators = this.computeHourlyIndicators(hourPrices);
      const min15Indicators = this.compute15MinIndicators(min15Prices);

      const indicators = {
        [TimeResolution.HOUR]: this.formatHourlyIndicators(hourIndicators),
        [TimeResolution.MINUTE_15]: this.format15MinIndicators(min15Indicators),
      };

      const formattedPrompt = await this.promptTemplate.format({
        epic: signalGeneratorContextData.epic,
        prices: signalGeneratorContextData.prices,
        indicators,
        performanceReport:
          signalGeneratorContextData.performanceReport ||
          'No performance report available',
      });

      signal = await this.geminiAiService.generateSignal(
        formattedPrompt,
        tradeSignalResponseSchema,
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
          80,
        ),
      ),
    );

    const prices = await Promise.all(pricePromises);

    const pricesByResolution = this.subscriptions.reduce(
      (acc, sub, index) => ({
        ...acc,
        [sub.timeResolution]: prices[index]
          .map((price) => price.snapshot)
          .reverse(),
      }),
      {},
    );

    return {
      epic: getIgEpicKey(event.epic),
      prices: pricesByResolution,
      indicators: {},
      performanceReport: null,
    };
  }

  private getAveragePrices(snapshots: any[]): number[] {
    return snapshots.map((snapshot) =>
      snapshot.closePrice.bid.plus(snapshot.closePrice.ask).div(2).toNumber(),
    );
  }

  private computeHourlyIndicators(prices: number[]) {
    const emaFast = EMA.calculate({
      period: this.INDICATOR_PARAMS.hourly.ema.fast,
      values: prices,
    });
    const emaMedium = EMA.calculate({
      period: this.INDICATOR_PARAMS.hourly.ema.medium,
      values: prices,
    });
    const emaSlow = EMA.calculate({
      period: this.INDICATOR_PARAMS.hourly.ema.slow,
      values: prices,
    });

    const rsi = RSI.calculate({
      period: this.INDICATOR_PARAMS.hourly.rsi.period,
      values: prices,
    });

    const ichimoku = {
      conversionLine: this.calculateIchimokuLine(
        prices,
        this.INDICATOR_PARAMS.hourly.ichimoku.conversionPeriod,
      ),
      baseLine: this.calculateIchimokuLine(
        prices,
        this.INDICATOR_PARAMS.hourly.ichimoku.basePeriod,
      ),
      leadingSpanB: this.calculateIchimokuLine(
        prices,
        this.INDICATOR_PARAMS.hourly.ichimoku.leadingSpanBPeriod,
      ),
      laggingSpan: prices.slice(
        -this.INDICATOR_PARAMS.hourly.ichimoku.laggingSpanPeriod,
      ),
      leadingSpanA: [] as number[],
    };

    // Calculate Leading Span A
    ichimoku.leadingSpanA = ichimoku.conversionLine.map(
      (val, i) => (val + ichimoku.baseLine[i]) / 2,
    );

    return {
      emaFast,
      emaMedium,
      emaSlow,
      rsi,
      ichimoku,
    };
  }

  private compute15MinIndicators(prices: number[]) {
    return {
      stochRsi: this.calculateStochRSI(
        prices,
        this.INDICATOR_PARAMS.minute15.stochRsi,
      ),
      bollingerBands: BollingerBands.calculate({
        ...this.INDICATOR_PARAMS.minute15.bollingerBands,
        values: prices,
      }),
      macd: MACD.calculate({
        ...this.INDICATOR_PARAMS.minute15.macd,
        values: prices,
      }),
    };
  }

  private formatHourlyIndicators(hourIndicators: any) {
    return [
      {
        name: 'EMA Triple Cross',
        params: this.INDICATOR_PARAMS.hourly.ema,
        values: {
          fast: hourIndicators.emaFast,
          medium: hourIndicators.emaMedium,
          slow: hourIndicators.emaSlow,
        },
      },
      {
        name: 'RSI',
        params: this.INDICATOR_PARAMS.hourly.rsi,
        values: hourIndicators.rsi,
      },
      {
        name: 'Ichimoku Cloud',
        params: this.INDICATOR_PARAMS.hourly.ichimoku,
        values: hourIndicators.ichimoku,
      },
    ];
  }

  private format15MinIndicators(min15Indicators: any) {
    return [
      {
        name: 'Stochastic RSI',
        params: this.INDICATOR_PARAMS.minute15.stochRsi,
        values: min15Indicators.stochRsi,
      },
      {
        name: 'Bollinger Bands',
        params: this.INDICATOR_PARAMS.minute15.bollingerBands,
        values: min15Indicators.bollingerBands,
      },
      {
        name: 'MACD',
        params: this.INDICATOR_PARAMS.minute15.macd,
        values: min15Indicators.macd,
      },
    ];
  }

  private calculateIchimokuLine(prices: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const periodPrices = prices.slice(i - period + 1, i + 1);
      const high = Math.max(...periodPrices);
      const low = Math.min(...periodPrices);
      result.push((high + low) / 2);
    }
    return result;
  }

  private calculateStochRSI(
    prices: number[],
    { rsiPeriod = 14, stochasticPeriod = 14, dPeriod = 3 },
  ) {
    // Calculate RSI first
    const rsiValues = RSI.calculate({
      values: prices,
      period: rsiPeriod,
    });

    // Calculate Stochastic of RSI
    return Stochastic.calculate({
      high: rsiValues,
      low: rsiValues,
      close: rsiValues,
      period: stochasticPeriod,
      signalPeriod: dPeriod,
    });
  }
}
