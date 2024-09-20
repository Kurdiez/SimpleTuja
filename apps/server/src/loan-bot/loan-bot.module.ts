import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './services/scheduled-tasks.service';
import { LoanOfferService } from './services/loan-offers.service';

@Module({
  imports: [],
  exports: [],
  controllers: [],
  providers: [ScheduledTasksService, LoanOfferService],
})
export class LoanBotModule {}
