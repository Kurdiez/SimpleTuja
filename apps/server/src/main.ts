import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from './config';

async function bootstrap() {
  const configModuleContext = await NestFactory.createApplicationContext(
    ConfigModule,
    { logger: ['log', 'error', 'warn'] },
  );
  const configService = configModuleContext.get(ConfigService);

  Sentry.init({
    dsn: configService.get('SENTRY_DSN'),
    environment: configService.get('ENVIRONMENT'),
    integrations: [nodeProfilingIntegration()],

    debug: true,
    attachStacktrace: true,
    autoSessionTracking: true,
    release: process.env.npm_package_version,

    // Existing options
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: configService.get('APP_URL'),
    credentials: true,
  });

  await app.listen(configService.get('PORT'), '::');
}

bootstrap();
