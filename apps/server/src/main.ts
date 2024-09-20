import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from './config';

async function bootstrap() {
  const configModuleContext = await NestFactory.createApplicationContext(
    ConfigModule,
    { logger: ['error', 'warn'] },
  );
  const configService = await configModuleContext.get(ConfigService);

  const app = await NestFactory.create(AppModule);
  await app.listen(configService.get('PORT'), '::');
}
bootstrap();
