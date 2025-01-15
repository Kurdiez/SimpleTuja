import { IgEpic } from './const';

interface TradingHours {
  daysOfWeek: number[];
  from: {
    hour: number;
    timezone: string;
  };
  to: {
    hour: number;
    timezone: string;
  };
}

interface TradingInfo {
  tradingHours: TradingHours;
}

const categories = {
  fx: new Set([IgEpic.EURUSD]),
};

export const getTradingInfo = (epic: IgEpic): TradingInfo => {
  if (categories.fx.has(epic)) {
    return {
      tradingHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        from: {
          hour: 9,
          timezone: 'Australia/Sydney',
        },
        to: {
          hour: 17,
          timezone: 'America/New_York',
        },
      },
    };
  }
  throw new Error(`No trading info found for epic: ${epic}`);
};
