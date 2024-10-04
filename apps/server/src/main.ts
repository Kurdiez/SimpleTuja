import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from './config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

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
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(configService.get('PORT'), '::');
}
bootstrap();
