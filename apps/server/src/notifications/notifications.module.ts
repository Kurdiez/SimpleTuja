import { Module } from '@nestjs/common';
import { BrevoService } from './services/brevo.service';

@Module({
  imports: [],
  providers: [BrevoService],
  exports: [BrevoService],
})
export class NotificationsModule {}
