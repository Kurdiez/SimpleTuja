import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/database/database.module';
import { IgApiService } from './services/ig-api.service';

@Module({
  imports: [DatabaseModule],
  providers: [IgApiService],
  exports: [IgApiService],
})
export class TradingModule {}
