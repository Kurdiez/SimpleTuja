import { Injectable } from '@nestjs/common';
import { OpenSeaService } from './opensea.service';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';

@Injectable()
export class ScheduledTasksService {
  constructor(private readonly openSeaService: OpenSeaService) {}

  @CronWithErrorHandling({
    cronTime: '0 * * * *', // Run every hour at the start of the hour
    taskName: 'Update Bid Offers for All Collections',
  })
  async updateBidOffersForAllCollections() {
    await this.openSeaService.updateBidOffersForAllCollections();
  }
}
