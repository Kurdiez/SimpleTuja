import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '../../commons/decorators';
import { PriceDataSubscriptionManagerService } from '../services/price-data-subscription-manager.service';
import { IgEpic, TimeResolution } from '../utils/const';
import {
  DataSubscription,
  IDataSubscriber,
  PriceUpdateEvent,
} from '../utils/types';

// Dual-TimeFrame Mean Reversion with Price Action Confirmation
@Injectable()
export class DTMR_PAC_Strategy implements OnModuleInit, IDataSubscriber {
  private readonly logger = new Logger(DTMR_PAC_Strategy.name);

  private readonly epicsToTrade: IgEpic[];
  private imbalanceData: Map<IgEpic, { direction: 'buy' | 'sell' | null }> =
    new Map();

  constructor(
    private readonly priceDataSubscriptionManager: PriceDataSubscriptionManagerService,
  ) {
    this.epicsToTrade = [IgEpic.EURUSD];
  }

  onModuleInit() {
    const subscriptions: DataSubscription[] = this.epicsToTrade.flatMap(
      (epic) => [
        { epic, timeResolution: TimeResolution.MINUTE_15 },
        { epic, timeResolution: TimeResolution.HOUR },
      ],
    );

    this.priceDataSubscriptionManager.subscribe(this, subscriptions);
  }

  async onPriceUpdate(event: PriceUpdateEvent): Promise<void> {
    if (event.timeFrame === TimeResolution.HOUR) {
      await this.handleHourlyUpdate(event);
    } else if (event.timeFrame === TimeResolution.MINUTE_15) {
      await this.handle15MinUpdate(event);
    }
  }

  private async handle15MinUpdate(event: PriceUpdateEvent): Promise<void> {
    this.logger.log('DTMR-PAC: 15 min update received: ', event);
  }

  private async handleHourlyUpdate(event: PriceUpdateEvent): Promise<void> {
    this.logger.log('DTMR-PAC: Hourly update received: ', event);
    // Implement hourly strategy logic using event.snapshot
    // const imbalanceDirection =
    //   this.imbalanceData.get(event.epic)?.direction || null;
    // Your strategy logic here
  }

  @Cron('0 * * * *') // Every hour
  async executeStrategy() {
    // const currentHour = new Date().getHours();
    // // Check if it's time for 4-hour analysis (0, 4, 8, 12, 16, 20)
    // if (currentHour % 4 === 0) {
    //   await Promise.all(
    //     this.epicsToTrade.map((epic) => this.analyzeFourHourImbalances(epic)),
    //   );
    // }
    // // Check for entry signals every hour
    // await Promise.all(
    //   this.epicsToTrade.map((epic) => this.executeEpicStrategy(epic)),
    // );
  }

  // private async analyzeFourHourImbalances(epic: IgEpic): Promise<void> {
  //   // Fetch 4H data
  //   const data4h = []; // TODO: Implement data fetching

  //   // Analyze 4H data for imbalances and store result
  //   // TODO: Implement actual imbalance detection logic
  //   const imbalanceDirection = null; // Will be 'buy' or 'sell' based on analysis
  //   this.imbalanceData.set(epic, { direction: imbalanceDirection });
  // }

  // private async executeEpicStrategy(epic: IgEpic): Promise<void> {
  //   // Get stored imbalance data
  //   const imbalanceDirection = this.imbalanceData.get(epic)?.direction || null;

  //   // Only proceed if we have an imbalance direction
  //   const data1h = []; // TODO: Implement 1h data fetching

  //   // Look for price action confirmation
  //   const priceActionConfirmed = false; // TODO: Implement confirmation logic

  //   // Generate trade signal if conditions met
  //   const signal = null; // TODO: Implement signal generation
  // }
}
