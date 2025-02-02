import { Injectable } from '@nestjs/common';
import { IgEpic, TimeResolution } from '../utils/const';
import {
  DataSubscription,
  IDataSubscriber,
  PriceUpdateEvent,
} from '../utils/types';

@Injectable()
export class PriceDataSubscriptionManagerService {
  private subscriptions = new Map<string, Set<IDataSubscriber>>();

  getSubscriptionKey(subscription: DataSubscription): string {
    return `${subscription.epic}:${subscription.timeResolution}`;
  }

  subscribe(
    subscriber: IDataSubscriber,
    subscriptions: DataSubscription[],
  ): void {
    subscriptions.forEach((subscription) => {
      const key = this.getSubscriptionKey(subscription);
      if (!this.subscriptions.has(key)) {
        this.subscriptions.set(key, new Set());
      }
      this.subscriptions.get(key)!.add(subscriber);
    });
  }

  getAllSubscriptions(): DataSubscription[] {
    return Array.from(this.subscriptions.keys()).map((key) => {
      const [epic, timeResolution] = key.split(':');
      return {
        epic: epic as IgEpic,
        timeResolution: timeResolution as TimeResolution,
      };
    });
  }

  async notifySubscribers(event: PriceUpdateEvent): Promise<void> {
    const key = `${event.epic}:${event.timeFrame}`;
    const subscribers = this.subscriptions.get(key);

    if (subscribers) {
      await Promise.all(
        Array.from(subscribers).map((subscriber) =>
          subscriber.onPriceUpdate(event),
        ),
      );
    }
  }

  getSubscriptionsByResolution(): Map<TimeResolution, Set<IgEpic>> {
    const subscriptionsByResolution = new Map<TimeResolution, Set<IgEpic>>();

    for (const subscription of this.getAllSubscriptions()) {
      if (!subscriptionsByResolution.has(subscription.timeResolution)) {
        subscriptionsByResolution.set(subscription.timeResolution, new Set());
      }
      subscriptionsByResolution
        .get(subscription.timeResolution)
        ?.add(subscription.epic);
    }

    return subscriptionsByResolution;
  }
}
