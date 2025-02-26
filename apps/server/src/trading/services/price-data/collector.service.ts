import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Big } from 'big.js';
import { isWithinInterval } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Repository } from 'typeorm';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';
import { CustomException } from '~/commons/errors/custom-exception';
import { IgEpicPriceEntity } from '~/database/entities/trading/ig-epic-price.entity';
import { IgApiService } from '~/trading/services/ig-api.service';
import {
  getTradingInfo,
  TradingHoursType,
} from '~/trading/utils/epic-trading-info';
import { IgEpic, TimeResolution } from '../../utils/const';
import { IgPriceSnapshot, PriceQuote } from '../../utils/types';
import { PriceDataSubscriptionManagerService } from './subscription-manager.service';

const PriceSnapshotRetryIntervals = {
  OneMinute: 1000 * 60,
  TwoMinutes: 1000 * 60 * 2,
  FiveMinutes: 1000 * 60 * 5,
  TenMinutes: 1000 * 60 * 10,
};

@Injectable()
export class PriceDataCollectorService implements OnModuleInit {
  constructor(
    @InjectRepository(IgEpicPriceEntity)
    private readonly igPriceRepo: Repository<IgEpicPriceEntity>,
    private readonly igApiService: IgApiService,
    private readonly subscriptionManager: PriceDataSubscriptionManagerService,
  ) {}

  onModuleInit() {
    // Initial setup if needed
  }

  @CronWithErrorHandling({
    cronTime: '* * * * *',
    taskName: 'CollectPriceSnapshots',
  })
  async collectPriceSnapshots(): Promise<void> {
    const now = new Date();
    const subscriptionsByResolution =
      this.subscriptionManager.getSubscriptionsByResolution();

    // Check if it's time to collect data for each resolution
    for (const [resolution, epics] of subscriptionsByResolution) {
      const shouldCollect = this.shouldCollectForResolution(resolution, now);
      if (shouldCollect) {
        await Promise.all(
          Array.from(epics).map((epic) =>
            this.collectPriceSnapshot(epic, resolution),
          ),
        );
      }
    }
  }

  private shouldCollectForResolution(
    resolution: TimeResolution,
    date: Date,
  ): boolean {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    switch (resolution) {
      case TimeResolution.SECOND:
        return true;
      case TimeResolution.MINUTE:
        return true;
      case TimeResolution.MINUTE_2:
        return minutes % 2 === 0;
      case TimeResolution.MINUTE_3:
        return minutes % 3 === 0;
      case TimeResolution.MINUTE_5:
        return minutes % 5 === 0;
      case TimeResolution.MINUTE_10:
        return minutes % 10 === 0;
      case TimeResolution.MINUTE_15:
        return minutes % 15 === 0;
      case TimeResolution.MINUTE_30:
        return minutes % 30 === 0;
      case TimeResolution.HOUR:
        return minutes === 0;
      case TimeResolution.HOUR_2:
        return minutes === 0 && hours % 2 === 0;
      case TimeResolution.HOUR_3:
        return minutes === 0 && hours % 3 === 0;
      case TimeResolution.HOUR_4:
        return minutes === 0 && hours % 4 === 0;
      case TimeResolution.DAY:
        return minutes === 0 && hours === 0;
      case TimeResolution.WEEK:
        return minutes === 0 && hours === 0 && dayOfWeek === 0;
      case TimeResolution.MONTH:
        return minutes === 0 && hours === 0 && dayOfMonth === 1;
      default:
        return false;
    }
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

    let targetDate = new Date(now);
    switch (resolution) {
      case TimeResolution.SECOND:
        targetDate.setMilliseconds(0);
        break;
      case TimeResolution.MINUTE:
        targetDate.setSeconds(0, 0);
        break;
      case TimeResolution.MINUTE_2:
        targetDate.setMinutes(Math.floor(now.getMinutes() / 2) * 2, 0, 0);
        break;
      case TimeResolution.MINUTE_3:
        targetDate.setMinutes(Math.floor(now.getMinutes() / 3) * 3, 0, 0);
        break;
      case TimeResolution.MINUTE_5:
        targetDate.setMinutes(Math.floor(now.getMinutes() / 5) * 5, 0, 0);
        break;
      case TimeResolution.MINUTE_10:
        targetDate.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0);
        break;
      case TimeResolution.MINUTE_15:
        targetDate.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);
        break;
      case TimeResolution.MINUTE_30:
        targetDate.setMinutes(Math.floor(now.getMinutes() / 30) * 30, 0, 0);
        break;
      case TimeResolution.HOUR:
        targetDate.setMinutes(0, 0, 0);
        break;
      case TimeResolution.HOUR_2:
        targetDate.setHours(Math.floor(now.getHours() / 2) * 2, 0, 0, 0);
        break;
      case TimeResolution.HOUR_3:
        targetDate.setHours(Math.floor(now.getHours() / 3) * 3, 0, 0, 0);
        break;
      case TimeResolution.HOUR_4:
        targetDate.setHours(Math.floor(now.getHours() / 4) * 4, 0, 0, 0);
        break;
      case TimeResolution.DAY:
        targetDate.setHours(0, 0, 0, 0);
        break;
      case TimeResolution.WEEK:
        // Set to start of the week (Sunday)
        const day = targetDate.getDay();
        targetDate.setDate(targetDate.getDate() - day);
        targetDate.setHours(0, 0, 0, 0);
        break;
      case TimeResolution.MONTH:
        // Set to start of the month
        targetDate.setDate(1);
        targetDate.setHours(0, 0, 0, 0);
        break;
      default:
        throw new CustomException('Unsupported time resolution', {
          resolution,
        });
    }

    targetDate = toZonedTime(targetDate, tradingInfo.dataTimezone);

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
          const convertedSnapshot = this.convertToBigPriceSnapshot(prices[0]);
          await this.igPriceRepo.save({
            epic,
            timeFrame: resolution,
            time: snapshotTimeUtc,
            snapshot: convertedSnapshot,
          });

          // Notify subscribers
          await this.subscriptionManager.notifySubscribers({
            epic,
            timeResolution: resolution,
            time: snapshotTimeUtc,
            snapshot: convertedSnapshot,
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

  private convertToBigPriceSnapshot(rawSnapshot: any): IgPriceSnapshot {
    const convertQuote = (quote: any): PriceQuote => ({
      bid: new Big(quote.bid),
      ask: new Big(quote.ask),
      lastTraded: quote.lastTraded ? new Big(quote.lastTraded) : null,
    });

    return {
      snapshotTime: rawSnapshot.snapshotTime,
      openPrice: convertQuote(rawSnapshot.openPrice),
      closePrice: convertQuote(rawSnapshot.closePrice),
      highPrice: convertQuote(rawSnapshot.highPrice),
      lowPrice: convertQuote(rawSnapshot.lowPrice),
      lastTradedVolume: new Big(rawSnapshot.lastTradedVolume),
    };
  }
}
