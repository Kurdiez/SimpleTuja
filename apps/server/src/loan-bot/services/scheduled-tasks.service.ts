import { Injectable, Logger } from '@nestjs/common';
import { CronWithErrorHandling } from 'src/commons/error-handlers/scheduled-tasks-errors';
import { LoanOfferService } from './loan-offers.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);
  private isMakingLoanOffers: boolean;

  constructor(private readonly loanOfferService: LoanOfferService) {}

  @CronWithErrorHandling({
    cronTime: '0 * * * *',
    taskName: 'makeLoanOffers',
  })
  async makeLoanOffers() {
    if (this.isMakingLoanOffers) return;

    this.isMakingLoanOffers = true;
    this.logger.log('Start - run scheduled task to make loan offers');

    await this.loanOfferService.makeCollectionLoanOffersForAllCollections();

    this.isMakingLoanOffers = false;
    this.logger.log('End - completed scheduled task to make loan offers');
  }
}
