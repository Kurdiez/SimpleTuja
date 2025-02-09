import Big from 'big.js';
import { IgEpic, TimeResolution } from './const';

export interface PriceQuote {
  bid: Big;
  ask: Big;
  lastTraded: Big | null;
}

export interface IgPriceSnapshot {
  snapshotTime: string;
  openPrice: PriceQuote;
  closePrice: PriceQuote;
  highPrice: PriceQuote;
  lowPrice: PriceQuote;
  lastTradedVolume: number | Big;
}

export interface DataSubscription {
  epic: IgEpic;
  timeResolution: TimeResolution;
}

export interface TradingStrategyParams {
  dataSubscriptions: DataSubscription[];
}

export interface PriceUpdateEvent {
  epic: IgEpic;
  timeResolution: TimeResolution;
  time: Date;
  snapshot?: IgPriceSnapshot;
}

export interface IDataSubscriber {
  onPriceUpdate(event: PriceUpdateEvent): Promise<void>;
}

export interface SignalGeneratorContextData {
  epic: string;
  prices: {
    [key in TimeResolution]?: IgPriceSnapshot[];
  };
  performanceReport: any | null;
}

export interface N8nSignalOutput {
  tradeAction: 'long' | 'short' | 'none';
  stopLoss?: string;
  takeProfit?: string;
  thoughtProcess?: string;
}

export interface N8nSignalResponse {
  output: N8nSignalOutput;
}
