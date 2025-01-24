import Big from 'big.js';

export interface PriceQuote {
  bid: Big;
  ask: Big;
  lastTraded: Big | null;
}

export interface IGPriceSnapshot {
  snapshotTime: string;
  openPrice: PriceQuote;
  closePrice: PriceQuote;
  highPrice: PriceQuote;
  lowPrice: PriceQuote;
  lastTradedVolume: number | Big;
}
