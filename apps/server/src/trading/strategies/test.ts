import { z } from 'zod';

export enum TradeAction {
  Long = 'long',
  Short = 'short',
  None = 'none',
}
export enum NearFuturePricePatterns {
  TrendContinuation = 'trend-continuation',
  TradingRange = 'trading-range',
  ExtremeImbalanceMeanReversal = 'extreme-imbalance-mean-reversal',
}

const activeTradeSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction).refine((val) => val !== 'none'),
    stopLoss: z.string().regex(/^\d*\.?\d+$/, 'Must be a valid price string'),
    takeProfit: z.string().regex(/^\d*\.?\d+$/, 'Must be a valid price string'),
  }),
  stepAnalysis: z.array(z.string()),
});

const noTradeSchema = z.object({
  tradeDecision: z.object({
    action: z.nativeEnum(TradeAction).refine((val) => val === 'none'),
  }),
  stepAnalysis: z.array(z.string()),
});

export const tradeSignalResponseSchema = z.union([
  activeTradeSchema,
  noTradeSchema,
]);
