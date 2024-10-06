import { Module } from '@nestjs/common';
import { ConfigModule as NestjsConfigModule } from '@nestjs/config';
import { ConfigModule, configSchema } from './config';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdminGuard } from './admin/auth/admin.guard';
import { databaseConnections } from './database/connections';
import { DatabaseModule } from './database/database.module';
import { SentryInterceptor } from './commons/error-handlers/sentry-interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { NftLoansModule } from './nft-loans/nft-loans.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Import JwtAuthGuard

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
    NftLoansModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    { provide: APP_GUARD, useClass: AdminGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
