import { Module } from '@nestjs/common';
import { ConfigModule as NestjsConfigModule } from '@nestjs/config';
import { ConfigModule, configSchema } from './config';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdminGuard } from './admin/auth/admin.guard';
import { LoanBotModule } from './loan-bot/loan-bot.module';
import { databaseConnections } from './database/connections';
import { DatabaseModule } from './database/database.module';
import { SentryInterceptor } from './commons/error-handlers/sentry-interceptor';

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
    LoanBotModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    { provide: APP_GUARD, useClass: AdminGuard },
  ],
})
export class AppModule {}
