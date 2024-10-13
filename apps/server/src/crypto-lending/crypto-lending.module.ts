import { Module } from '@nestjs/common';
import { OpenSeaService } from './services/opensea.service';
import { OpenSeaAPIService } from './services/opensea-api.service';
import { ScheduledTasksService } from './services/scheduled-tasks.service';
import { CryptoLendingController } from './controllers/crypto-lending.controller';
import { OnboardingService } from './services/onboarding.service';
import { DatabaseModule } from '~/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    OnboardingService,
    OpenSeaAPIService,
    OpenSeaService,
    ScheduledTasksService,
  ],
  exports: [OpenSeaAPIService, OpenSeaService],
  controllers: [CryptoLendingController],
})
export class CryptoLendingModule {}
