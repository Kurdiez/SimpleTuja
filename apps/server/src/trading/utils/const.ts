export enum TradingCurrency {
  USD = 'USD',
}

export enum IgEpic {
  EURUSD = 'CS.D.EURUSD.CFD.IP',
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
