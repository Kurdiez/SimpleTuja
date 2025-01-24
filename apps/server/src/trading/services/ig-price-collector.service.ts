import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  isWithinInterval,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Repository } from 'typeorm';
import { Cron } from '~/commons/decorators';
import { CustomException } from '~/commons/errors/custom-exception';
import { IgEpicPriceEntity } from '~/database/entities/trading/ig-epic-price.entity';
import { IgApiService } from '~/trading/services/ig-api.service';
import {
  getTradingInfo,
  TradingHoursType,
} from '~/trading/utils/epic-trading-info';
import { IgEpic, TimeResolution } from '../utils/const';

const PriceSnapshotRetryIntervals = {
  OneMinute: 1000 * 60,
  TwoMinutes: 1000 * 60 * 2,
  FiveMinutes: 1000 * 60 * 5,
  TenMinutes: 1000 * 60 * 10,
};

@Injectable()
export class IgPriceCollectorService {
  constructor(
    @InjectRepository(IgEpicPriceEntity)
    private readonly igPriceRepo: Repository<IgEpicPriceEntity>,
    private readonly igApiService: IgApiService,
  ) {}

  @Cron('0 * * * *')
  async collectHourlyPriceSnapshot(): Promise<void> {
    await Promise.all(
      Object.values(IgEpic).map((epic) =>
        this.collectPriceSnapshot(epic, TimeResolution.HOUR),
      ),
    );
  }

  @Cron('0 */4 * * *')
  async collect4HourPriceSnapshot(): Promise<void> {
    await Promise.all(
      Object.values(IgEpic).map((epic) =>
        this.collectPriceSnapshot(epic, TimeResolution.HOUR_4),
      ),
    );
  }

  isTradingHour(epic: IgEpic, date: Date): boolean {
    const tradingInfo = getTradingInfo(epic);
    const tradingHours = tradingInfo.tradingHours;

    if (tradingHours.type === TradingHoursType.Weekly) {
      // Convert input date to market open timezone for open check
      const marketOpenZoneTime = toZonedTime(date, tradingHours.from.timezone);
      const openDayOfWeek = marketOpenZoneTime.getDay();

      // Convert input date to market close timezone for close check
      const marketCloseZoneTime = toZonedTime(date, tradingHours.to.timezone);
      const closeDayOfWeek = marketCloseZoneTime.getDay();

      // Set market open/close times in respective timezones
      const marketOpenTime = new Date(marketOpenZoneTime);
      marketOpenTime.setHours(tradingHours.from.hour, 0, 0, 0);

      const marketCloseTime = new Date(marketCloseZoneTime);
      marketCloseTime.setHours(tradingHours.to.hour, 0, 0, 0);

      // Check if it's a trading day (Monday-Friday)
      const isWeekendOpen = openDayOfWeek === 0 || openDayOfWeek === 6;
      const isWeekendClose = closeDayOfWeek === 0 || closeDayOfWeek === 6;

      // Check if before market open in opening timezone
      const isBeforeOpen =
        marketOpenZoneTime.getTime() < marketOpenTime.getTime();

      // Check if at or after market close in closing timezone
      const isAfterClose =
        marketCloseZoneTime.getTime() >= marketCloseTime.getTime();

      // Market is open if:
      // - It's not weekend in open timezone AND we're not before market open time
      // OR
      // - It's not weekend in close timezone AND we're not after market close time
      return (
        (!isWeekendOpen && !isBeforeOpen) || (!isWeekendClose && !isAfterClose)
      );
    } else {
      // Daily trading type implementation
      const dateInTz = toZonedTime(date, tradingHours.timezone);
      const dayOfWeek = dateInTz.getDay();

      // Check if it's weekend (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
      }

      // Create market open time in the specified timezone
      const marketOpenTime = new Date(dateInTz);
      marketOpenTime.setHours(tradingHours.from, 0, 0, 0);

      // Create market close time in the specified timezone
      const marketCloseTime = new Date(dateInTz);
      marketCloseTime.setHours(tradingHours.to, 0, 0, 0);

      // Check if current time is within market hours
      return isWithinInterval(dateInTz, {
        start: marketOpenTime,
        end: marketCloseTime,
      });
    }
  }

  private async collectPriceSnapshot(
    epic: IgEpic,
    resolution: TimeResolution,
  ): Promise<void> {
    const tradingInfo = getTradingInfo(epic);
    const now = new Date();

    if (!this.isTradingHour(epic, now)) {
      return;
    }

    const targetDate = toZonedTime(
      setMilliseconds(setSeconds(setMinutes(now, 0), 0), 0),
      tradingInfo.dataTimezone,
    );

    for (const interval of Object.values(PriceSnapshotRetryIntervals)) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      try {
        const prices = await this.igApiService.getHistoricalPrices({
          epic,
          resolution,
          numPoints: 1,
        });

        if (prices.length === 0) {
          continue;
        }

        const snapshotTime = new Date(prices[0].snapshotTime);
        const snapshotTimeUtc = fromZonedTime(
          snapshotTime,
          tradingInfo.dataTimezone,
        );

        if (snapshotTime.getTime() === targetDate.getTime()) {
          await this.igPriceRepo.save({
            epic,
            timeFrame: resolution,
            time: snapshotTimeUtc,
            snapshot: prices[0],
          });
          return;
        }
      } catch (error) {
        const exception = new CustomException(
          'Failed to fetch price for epic',
          {
            error,
            epic,
          },
        );
        throw exception;
      }
    }

    throw new CustomException(`Failed to obtain price snapshot for epic`, {
      epic,
      targetDate,
    });
  }
}
