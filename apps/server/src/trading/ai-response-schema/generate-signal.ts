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

export const tradeSignalResponseSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction),
    stopLoss: z
      .string()
      .regex(/^\d*\.?\d+$/, 'Must be a valid price string')
      .nullable(),
    takeProfit: z
      .string()
      .regex(/^\d*\.?\d+$/, 'Must be a valid price string')
      .nullable(),
  }),
  stepAnalysis: z.record(
    z.string().regex(/^[1-8]$/, 'Must be a string number between 1 and 8'),
    z.string(),
  ),
});

export type TradeSignalResponse = z.infer<typeof tradeSignalResponseSchema>;
