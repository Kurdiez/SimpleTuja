import { IgEpic } from './const';

export enum TradingHoursType {
  Weekly = 'weekly',
  Daily = 'daily',
}

interface TimeConfig {
  hour: number;
  timezone: string;
}

interface WeeklyTradingHours {
  type: TradingHoursType.Weekly;
  from: TimeConfig;
  to: TimeConfig;
}

interface DailyTradingHours {
  type: TradingHoursType.Daily;
  timezone: string;
  from: number;
  to: number;
}

type TradingHours = WeeklyTradingHours | DailyTradingHours;

interface TradingInfo {
  tradingHours: TradingHours;
  dataTimezone: string;
}

const categories = {
  fx: new Set([IgEpic.EURUSD, IgEpic.AUDJPY, IgEpic.GBPCHF]),
  usShares: new Set([IgEpic.US_SHARE_AMBC]),
};

export const getTradingInfo = (epic: IgEpic): TradingInfo => {
  if (categories.fx.has(epic)) {
    return {
      tradingHours: {
        type: TradingHoursType.Weekly,
        from: {
          hour: 9,
          timezone: 'Australia/Sydney',
        },
        to: {
          hour: 17,
          timezone: 'America/New_York',
        },
      },
      dataTimezone: 'Asia/Dubai',
    };
  } else if (categories.usShares.has(epic)) {
    return {
      tradingHours: {
        type: TradingHoursType.Daily,
        timezone: 'America/New_York',
        from: 9,
        to: 16,
      },
      dataTimezone: 'Asia/Dubai',
    };
  }
  throw new Error(`No trading info found for epic: ${epic}`);
};
