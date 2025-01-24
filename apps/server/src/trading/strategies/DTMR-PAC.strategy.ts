import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Observable, from, lastValueFrom, map, mergeMap } from 'rxjs';
import { IgEpic } from '../utils/const';

// Dual-TimeFrame Mean Reversion with Price Action Confirmation
@Injectable()
export class DTMR_PAC_Strategy {
  private readonly epicsToTrade: IgEpic[];

  constructor() {
    this.epicsToTrade = [IgEpic.EURUSD];
  }

  @Cron(CronExpression.EVERY_HOUR)
  async trade() {
    await lastValueFrom(
      from(this.epicsToTrade).pipe(
        mergeMap((epic) => this.executeEpicStrategy(epic)),
      ),
    );
  }

  private executeEpicStrategy(epic: IgEpic): Observable<any> {
    return from([epic]).pipe(
      // Fetch 4H data
      map((epic) => ({ epic, data4h: [] })),

      // Analyze 4H data for imbalances
      map((context) => ({ ...context, imbalanceDetected: false })),

      // If imbalance detected, fetch 1H data
      map((context) => ({ ...context, data1h: [] })),

      // Look for price action confirmation
      map((context) => ({ ...context, priceActionConfirmed: false })),

      // Generate trade signal if conditions met
      map((context) => ({ ...context, signal: null })),
    );
  }
}
