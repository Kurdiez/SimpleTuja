import { z } from 'zod';

export enum TradeAction {
  LONG = 'long',
  SHORT = 'short',
  NONE = 'none',
}
export enum NearFuturePricePatterns {
  TREND_CONTINUATION = 'trend-continuation',
  TRADING_RANGE = 'trading-range',
  EXTREME_IMBALANCE_MEAN_REVERSAL = 'extreme-imbalance-mean-reversal',
}
const NearFutureDirectionPredictionEnum = z.enum(['up', 'down', 'sideways']);

const analysisSchema = z.object({
  longerTerm: z.object({
    technicalIndicators: z.string(),
    priceActions: z.string(),
    significantPriceLevels: z.string(),
    nearFuturePricePatterns: z.nativeEnum(NearFuturePricePatterns),
    nearFutureDirectionPrediction: NearFutureDirectionPredictionEnum,
  }),
  shorterTerm: z.object({
    technicalIndicators: z.string(),
    priceActions: z.string(),
    riskRewardRatio: z.number(),
  }),
});

const activeTradeSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction).refine((val) => val !== 'none'),
    stopLoss: z.string().regex(/^\d*\.?\d+$/, 'Must be a valid price string'),
    takeProfit: z.string().regex(/^\d*\.?\d+$/, 'Must be a valid price string'),
  }),
  analysis: analysisSchema,
});

const noTradeSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction).refine((val) => val === 'none'),
  }),
  analysis: analysisSchema.optional(),
});

export const tradeSignalResponseSchema = z.union([
  activeTradeSchema,
  noTradeSchema,
]);

export type NearFutureDirectionPrediction = z.infer<
  typeof NearFutureDirectionPredictionEnum
>;

export type Analysis = z.infer<typeof analysisSchema>;
export type ActiveTrade = z.infer<typeof activeTradeSchema>;
export type NoTrade = z.infer<typeof noTradeSchema>;
export type TradeSignalResponse = z.infer<typeof tradeSignalResponseSchema>;
