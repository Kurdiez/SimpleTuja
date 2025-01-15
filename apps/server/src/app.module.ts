import { Module } from '@nestjs/common';
import { ConfigModule as NestjsConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from '~/admin/admin.module';
import { AdminGuard } from '~/admin/auth/admin.guard';
import { AuthModule } from '~/auth/auth.module';
import { JwtAuthGuard } from '~/auth/guards/jwt-auth.guard';
import { SentryInterceptor } from '~/commons/error-handlers/sentry-interceptor';
import { ConfigModule, configSchema } from '~/config';
import { databaseConnections } from '~/database/connections';
import { DatabaseModule } from '~/database/database.module';
import { NotificationsModule } from '~/notifications/notifications.module';
import { AuthService } from './auth/service/auth.service';
import { CryptoLendingModule } from './crypto-lending/crypto-lending.module';
import { TradingModule } from './trading/trading.module';

@Module({
  imports: [
    NestjsConfigModule.forRoot({
      validate: (env) => configSchema.parse(env),
      expandVariables: false,
    }),
    ConfigModule,
    ...databaseConnections,
    DatabaseModule,
    AdminModule,
    ScheduleModule.forRoot(),
    CryptoLendingModule,
    AuthModule,
    NotificationsModule,
    TradingModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    { provide: APP_GUARD, useClass: AdminGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    AuthService,
  ],
})
export class AppModule {}
