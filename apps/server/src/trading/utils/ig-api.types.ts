import {
  IgEpic,
  MarketStatus,
  PositionDirection,
  TradingCurrency,
} from './const';

export interface IgOpenPosition {
  contractSize: number;
  createdDate: string;
  createdDateUTC: string;
  dealId: string;
  dealReference: string;
  size: number;
  direction: PositionDirection;
  limitLevel: number | null;
  level: number;
  currency: TradingCurrency;
  controlledRisk: boolean;
  stopLevel: number | null;
  trailingStep: number | null;
  trailingStopDistance: number | null;
  limitedRiskPremium: number | null;
}

export interface IgMarketInfo {
  instrumentName: string;
  expiry: string;
  epic: IgEpic;
  instrumentType: string;
  lotSize: number;
  high: number;
  low: number;
  percentageChange: number;
  netChange: number;
  bid: number;
  offer: number;
  updateTime: string;
  updateTimeUTC: string;
  delayTime: number;
  streamingPricesAvailable: boolean;
  marketStatus: MarketStatus;
  scalingFactor: number;
}

export interface IgOpenPositionsResponse {
  positions: Array<{
    position: IgOpenPosition;
    market: IgMarketInfo;
  }>;
}

export interface IgPositionDetailsResponse {
  position: {
    dealId: string;
    openLevel: number;
    stopLevel: number | null;
    limitLevel: number | null;
  };
}
