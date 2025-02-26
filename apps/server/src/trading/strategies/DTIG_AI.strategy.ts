import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Big } from 'big.js';
import { last } from 'lodash';
import {
  ATR,
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
  IgPriceSnapshot,
  PriceUpdateEvent,
} from '../utils/types';

// Dual_Timeframe_Indicators_Gemini_AI_Strategy (DTIG_AI_STRATEGY)
@Injectable()
export class DTIG_AI_STRATEGY implements OnModuleInit, IDataSubscriber {
  private readonly logger = new Logger(DTIG_AI_STRATEGY.name);
  private readonly epicsToTrade: IgEpic[];
  private subscriptions: DataSubscription[];
  private readonly DefaultRiskPercentage = 0.01; // 1% risk per trade
  private readonly promptTemplate: PromptTemplate;

  private readonly parser: StructuredOutputParser<any> =
    StructuredOutputParser.fromZodSchema(tradeSignalResponseSchema as any);

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
      atr: {
        period: 14,
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

    this.promptTemplate = new PromptTemplate({
      template: `
      Who you are:
      - You are a swing trader who should hold position on average 1-2 days.
      - You analyze two timeframes, one longer and one shorter, with multiple indicators for multiple confirmations.
      
      Here are the analysis steps you should follow.

      Analysis Steps:
      1. The goal of longer term analysis is to find out if there is a setup for a trade. First analyze whether the longer term timeframe is trending. Use the 4 provided indicators to analyze, state your conclusion in the form of confidence score from 0 - 10 with the reasoning.
      2. Analyze whether the longer term timeframe is trading in a trading range. Use the 4 provided indicators to analyze, state your conclusion in the form of confidence score from 0 - 10 with the reasoning.
      3. Analyze whether the longer term timeframe is in an extreme imbalance and about to do mean reversion. Use the 4 provided indicators to analyze, state your conclusion in the form of confidence score from 0 - 10 with the reasoning.
      4. State which of the 3 analysis you are choosing to trade. The confidence score has to be at least 7 and the chosen analysis has to have the highest confidence score. If there is no clear winner, you should return "none" as the trade action to not trade.
      5. State what are the immediate significant price levels from the current market price by looking at the longer term prices which can act as the stop loss and take profit prices. Assume the entry price is the current ask or bid depending on the direction of the trade.
      6. The goal of shorter term analysis is to find out whether the entry setup exists and a position should be opened now. Use the overall price prediction from longer timeframe analysis and the 3 indicators provided for the shorter timeframe to confirm an entry setup. State your findings.
      7. Only if the confidence score from step 6 is at least 7, then you should state the trade decision with the stop loss and take profit prices based on the provided current price, significant price levels from step 5 and the ATR indicator from longer timeframe indicators. Assume the entry price is the current ask or bid depending on the direction of the trade. We don't want the stop loss to be too small to be shaken out even without being able to test our directional prediction.
      8. Assume the entry price is the current ask or bid depending on the direction of the trade. Based on this entry price, stop loss and take profit prices, calculate the reward / risk ratio. If the reward / risk ratio is greater or equal to 3, then this is a good setup that a trade should be take place. State your findings.

      Here are the inputs you should be receiving to perform the analysis:

      The trading epic (asset): {epic}

      The current bid and ask prices: {currentPrice}
      
      Two timeframe price data by time resolutions, price data sorted in chronological order:
      {prices}

      Shorter term indicators, their parameter values and their computed values in chronological order:
      {indicators}

      Performance Report:
      - Comprehensive historical trading performance report for this epic done by you in the past. It summarizes your performance of recent 20 trades.
      - Includes overall summary of past individual trade logs that has all the contextual data like prices, indicator values used, P&L, thought process behind decision making and any other useful information for trade.
      - I want you to pay special attention to the reasoning from the past and incorporate what went well and what did not go well in your analysis for the new trade.
      
      Performance Report content:
      {performanceReport}

      Your output JSON:
      - The output should be exactly the way described below
      - action should be one of these values: long, short, none
      - always include the stepAnalysis where the key is the step number in string and the value is the answer to the questions in the analysis steps above

      Example Output:
      {{
        "tradeDecision": {{
          "action": "long",
          "stopLoss": "1.0790",
          "takeProfit": "1.0830"
        }},
        "stepAnalysis": {{
          "1": "State the analysis you have done and the outcome.",
          "2": "State the analysis you have done and the outcome.",
          "3": "State the analysis you have done and the outcome.",
          "4": "State the analysis you have done and the outcome.",
          "5": "State the analysis you have done and the outcome.",
          "6": "State the analysis you have done and the outcome.",
          "7": "State the analysis you have done and the outcome.",
          "8": "State the analysis you have done and the outcome."
        }}
      }}

      {format_instructions}
      `,
      inputVariables: [
        'epic',
        'currentPrice',
        'prices',
        'indicators',
        'performanceReport',
      ],
      partialVariables: {
        format_instructions: this.parser.getFormatInstructions(),
      },
    });
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
    let rawResponse: string; // Store raw response for debugging
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

      const lastPrice = last<IgPriceSnapshot>(
        signalGeneratorContextData.prices[TimeResolution.MINUTE_15],
      ).closePrice;

      const formattedPrompt = await this.promptTemplate.format({
        epic: signalGeneratorContextData.epic,
        prices: signalGeneratorContextData.prices,
        currentPrice: {
          bid: lastPrice.bid.toNumber(),
          ask: lastPrice.ask.toNumber(),
        },
        indicators,
        performanceReport:
          signalGeneratorContextData.performanceReport ||
          'No performance report available',
      });

      rawResponse =
        await this.geminiAiService.generateRawResponse(formattedPrompt);

      signal = await this.parser.parse(rawResponse);

      if (signal.tradeDecision.action === TradeAction.NONE) {
        this.logger.log('No trade signal generated - action is NONE');
        return;
      }

      this.logger.log('Trade signal generated:', {
        action: signal.tradeDecision.action,
        stopLoss: signal.tradeDecision.stopLoss,
        takeProfit: signal.tradeDecision.takeProfit,
      });

      const direction =
        signal.tradeDecision.action === TradeAction.LONG
          ? PositionDirection.BUY
          : PositionDirection.SELL;

      const currentPrice = new Big(event.snapshot.closePrice.ask);
      const stopLossPrice = new Big(signal.tradeDecision.stopLoss);
      const takeProfitPrice = new Big(signal.tradeDecision.takeProfit);

      this.logger.log('Calculated order parameters:', {
        direction,
        currentPrice: currentPrice.toString(),
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfitPrice.toString(),
        riskPercentage: this.DefaultRiskPercentage,
      });

      this.logger.log(
        `Placing ${direction} order for ${event.epic} with stop loss ${stopLossPrice} and take profit ${takeProfitPrice}`,
      );

      const dealReferenceId: string | null =
        await this.igApiService.placeBracketOrderWithRisk({
          epic: event.epic,
          direction,
          riskPercentage: new Big(this.DefaultRiskPercentage),
          currentPrice,
          stopLossPrice,
          takeProfitPrice,
        });

      if (dealReferenceId) {
        this.logger.log('Order placed successfully:', {
          dealReferenceId,
          epic: event.epic,
        });

        await this.tradingPositionRepository.save({
          brokerDealId: dealReferenceId,
          strategy: TradingStrategy.DTIG_AI,
          epic: event.epic,
          direction,
          metadata: {
            signal,
          },
        });

        this.logger.log('Trade position saved to database:', {
          dealReferenceId,
          epic: event.epic,
          strategy: TradingStrategy.DTIG_AI,
        });
      } else {
        this.logger.error(
          'Failed to place order - no deal reference ID received',
          {
            epic: event.epic,
            direction,
            currentPrice: currentPrice.toString(),
            stopLossPrice: stopLossPrice.toString(),
            takeProfitPrice: takeProfitPrice.toString(),
          },
        );
      }
    } catch (error) {
      console.error('Parsing Error:', error); // Log the full error
      const exception = new CustomException(
        'Gemini AI Strategy failed to handle 15 min update - PARSING ERROR',
        {
          error,
          epic: event.epic,
          rawResponse: rawResponse, // Include raw response in the exception
        },
      );
      captureException({ error: exception });
      // Consider adding a retry mechanism here
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

    const atr = ATR.calculate({
      high: prices,
      low: prices,
      close: prices,
      period: this.INDICATOR_PARAMS.hourly.atr.period,
    });

    return {
      emaFast,
      emaMedium,
      emaSlow,
      rsi,
      ichimoku,
      atr,
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
      {
        name: 'ATR',
        params: this.INDICATOR_PARAMS.hourly.atr,
        values: hourIndicators.atr,
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
