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

const activeTradeSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction).refine((val) => val !== 'none'),
    stopLoss: z.string().regex(/^\d*\.?\d+$/, 'Must be a valid price string'),
    takeProfit: z.string().regex(/^\d*\.?\d+$/, 'Must be a valid price string'),
  }),
  stepAnalysis: z.record(
    z.string().regex(/^[1-8]$/, 'Must be a string number between 1 and 8'),
    z.string(),
  ),
});

const noTradeSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction).refine((val) => val === 'none'),
  }),
  stepAnalysis: z.record(
    z.string().regex(/^[1-8]$/, 'Must be a string number between 1 and 8'),
    z.string(),
  ),
});

export const tradeSignalResponseSchema = z.union([
  activeTradeSchema,
  noTradeSchema,
]);

export type ActiveTrade = z.infer<typeof activeTradeSchema>;
export type NoTrade = z.infer<typeof noTradeSchema>;
export type TradeSignalResponse = z.infer<typeof tradeSignalResponseSchema>;
