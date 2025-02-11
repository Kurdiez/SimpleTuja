import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '~/config';
import {
  TradeSignalResponse,
  tradeSignalResponseSchema,
} from '../ai-response-schema/generate-signal';
import { SignalGeneratorContextData } from '../utils/types';

@Injectable()
export class GeminiAiService {
  private readonly model: ChatGoogleGenerativeAI;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get('GEMINI_AI_API_KEY'),
      modelName: 'gemini-2.0-flash',
    });
    this.logger = new Logger(GeminiAiService.name);
  }

  async generateSignal(
    signalGeneratorContextData: SignalGeneratorContextData,
  ): Promise<TradeSignalResponse> {
    const promptTemplate = PromptTemplate.fromTemplate(`
      The trading epic (asset): {epic}
      
      Price data by time resolutions, price data sorted most recent to oldest:
      {prices}
      
      Performance Report:
      - Comprehensive historical trading performance report for this epic done by you in the past. It summarizes your past performances for you to consider.
      - Includes overall summary of past individual trade logs that has all the contextual data like prices, indicator values used, P&L, thought process behind decision making and any other useful information for each time period 1 month, 3months, 6 months, 1 year.
      - Includes individual trade logs of 20 most recent trades for {epic} that the signal generator, order executioner and risk manager agents have left behind and their thought process per trade.
      
      Performance Report content:
      {performanceReport}

      Analysis Steps:
      I want you to go through the steps below, when any of the steps fail, you should immediately stop and return "none" as the action. All the detailed analysis and decisions should be provided in the output.
      1. The goal of longer term analysis is to find out if there is a setup for a trade. First analyze whether the price is trending. State what 3 indicators you would use to analyze whether the price is trending.
      2. State the results of analyzing 3 indicators. Count the number of data points and use the appropriate indicator parameter values accordingly. State the final confidence score from 0 - 10 on whether the price is trending.
      3. State what 3 indicators you would use to analyze the whether the price is in a trading range.
      4. State the results of analyzing 3 indicators. Count the number of data points and use the appropriate indicator parameter values accordingly. State the final confidence score from 0 - 10 on whether the price is in a trading range.
      5. State what 3 indicators you would use to analyze the whether the price is in an extreme imbalance mean reversal setup.
      6. State the results of analyzing 3 indicators. Count the number of data points and use the appropriate indicator parameter values accordingly. State the final confidence score from 0 - 10 on whether the price is in an extreme imbalance mean reversal setup.
      7. State which of the 3 analysis you are choosing to trade. The confidence score has to be at least 7 and the chosen analysis has to have the highest confidence score.
      8. State what are the immediate significant price levels from the current market price in the longer term prices which can act as the stop loss and take profit prices.
      9. The goal of shorter term analysis is to find out whether the entry setup exists and a position should be opened now. State what 3 indicators you would use to analyze the price action based on the longer term decision from step 7.
      10. State the results of analyzing 3 indicators. Count the number of data points and use the appropriate indicator parameter values accordingly. State the final confidence score from 0 - 10 on whether the price is in an entry setup.
      11. Only if the confidence score from step 10 is at least 7, then you should state the trade decision with the stop loss and take profit prices.
      12. Assuming the last known market price is the entry price, state the risk vs. reward ratio based on the stop loss, take profit and the entry price.
      13. If the risk vs. reward ratio is greater or equal to 1:3, then this is a good setup that a trade should be taken.
      
      IMPORTANT: Your output JSON must always include:
      1. A tradeDecision object with an action field
      2. A stepAnalysis array containing all analysis steps, even if the action is "none"
      3. If any analysis step fails, include the reason in the stepAnalysis array and set action to "none"

      Example output when no trade is recommended:
      {{
        "tradeDecision": {{
          "action": "none"
        }},
        "stepAnalysis": [
          "Step 1: Analysis of trend indicators...",
          "Step 2: Results show...",
          // ... all other steps with their results ...
        ]
      }}

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

    const formattedPrompt = await promptTemplate.format({
      epic: signalGeneratorContextData.epic,
      prices: signalGeneratorContextData.prices,
      performanceReport:
        signalGeneratorContextData.performanceReport ||
        'No performance report available',
    });

    const response = await this.model.invoke(formattedPrompt);
    const responseText = response.content.toString();
    const cleanedResponse = this.cleanJsonResponse(responseText);
    return tradeSignalResponseSchema.parse(cleanedResponse);
  }

  private cleanJsonResponse(response: string): any {
    // Remove markdown code block if present
    const cleanedString = response
      .replace(/```json\n/, '')
      .replace(/```\n?$/, '')
      .trim();

    try {
      return JSON.parse(cleanedString);
    } catch (error) {
      throw new Error(`Failed to parse Gemini AI response: ${error.message}`);
    }
  }
}
