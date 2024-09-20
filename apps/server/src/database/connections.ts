import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'src/config';

export const DATABASE_CONNECTION = {
  DEFAULT: 'default',
  TASK_RUNNER: 'taskrunner',
};

export const createDBConnectionImport = (name: string) =>
  TypeOrmModule.forRootAsync({
    name,
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/db/**/*{.ts,.js}'],
      subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
      applicationName: name,
      synchronize: true,
    }),
    inject: [ConfigService],
  });

export const databaseConnections = [
  createDBConnectionImport(DATABASE_CONNECTION.DEFAULT),
  // createDBConnectionImport(DATABASE_CONNECTION.TASK_RUNNER),
];
