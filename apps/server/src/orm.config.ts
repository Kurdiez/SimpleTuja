import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import { databaseConfigSchema } from './config';

const db = databaseConfigSchema.parse(process.env);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: db.DB_HOST,
  port: db.DB_PORT,
  username: db.DB_USERNAME,
  password: db.DB_PASSWORD,
  database: db.DB_DATABASE,

  entities: [__dirname + '/**/*.entity.ts'],
  migrations: [__dirname + '/database/migrations/db/**/*.ts'],

  synchronize: false,
});

export default AppDataSource;
