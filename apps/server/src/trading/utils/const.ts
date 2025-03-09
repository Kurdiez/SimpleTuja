export enum TradingCurrency {
  USD = 'USD',
}

export enum IgEpic {
  EURUSD = 'CS.D.EURUSD.CFD.IP',
  EURUSD_MINI = 'CS.D.EURUSD.MINI.IP',
  AUDJPY = 'CS.D.AUDJPY.CFD.IP',
  AUDJPY_MINI = 'CS.D.AUDJPY.MINI.IP',
  GBPCHF = 'CS.D.GBPCHF.CFD.IP',
  GBPCHF_MINI = 'CS.D.GBPCHF.MINI.IP',
  US_SHARE_AMBC = 'UA.D.AMBCUS.CASH.IP',
}

export function getIgEpicKey(value: string): keyof typeof IgEpic | undefined {
  const entries = Object.entries(IgEpic);
  const found = entries.find(([_, val]) => val === value);
  return found ? (found[0] as keyof typeof IgEpic) : undefined;
}

export enum TimeResolution {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  MINUTE_2 = 'MINUTE_2',
  MINUTE_3 = 'MINUTE_3',
  MINUTE_5 = 'MINUTE_5',
  MINUTE_10 = 'MINUTE_10',
  MINUTE_15 = 'MINUTE_15',
  MINUTE_30 = 'MINUTE_30',
  HOUR = 'HOUR',
  HOUR_2 = 'HOUR_2',
  HOUR_3 = 'HOUR_3',
  HOUR_4 = 'HOUR_4',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum PositionDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum MarketStatus {
  CLOSED = 'CLOSED',
  EDITS_ONLY = 'EDITS_ONLY',
  OFFLINE = 'OFFLINE',
  ON_AUCTION = 'ON_AUCTION',
  ON_AUCTION_NO_EDITS = 'ON_AUCTION_NO_EDITS',
  SUSPENDED = 'SUSPENDED',
  TRADEABLE = 'TRADEABLE',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  QUOTE = 'QUOTE',
}

export enum TradingStrategy {
  DTIG_AI = 'DTIG_AI',
}

export enum TradingPositionStatus {
  PENDING = 'PENDING',
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}

export const MIN_POSITIONS_FOR_REPORT = 20;
