import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DataSource,
  DataSourceOptions,
  EntityManager,
  Repository,
} from 'typeorm';
import { DatabaseModule } from '~/database/database.module';
import { entitiesToReigster } from '~/database/entities-registry';

const OriginalDate = global.Date;

export interface TestDbContext {
  queryRunner: any;
  dataSource: DataSource;
  manager: EntityManager;
}

export interface TestSetupOptions {
  providers?: any[];
  mockServices?: Record<string, any>;
}

function getDbConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.STJ_TEST_DB_HOST,
    port: parseInt(process.env.STJ_TEST_DB_PORT, 10),
    username: process.env.STJ_TEST_DB_USERNAME,
    password: process.env.STJ_TEST_DB_PASSWORD,
    database: process.env.STJ_TEST_DB_DATABASE,
    entities: entitiesToReigster,
  };
}

export async function setupTestDatabase(): Promise<DataSource> {
  const dataSource = new DataSource(getDbConfig());
  await dataSource.initialize();
  return dataSource;
}

export async function createTestingModule(
  dataSource: DataSource,
  options: TestSetupOptions = {},
): Promise<TestingModule> {
  const { providers = [], mockServices = {} } = options;

  return await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...getDbConfig(),
        autoLoadEntities: true,
      } as TypeOrmModuleOptions),
      DatabaseModule,
    ],
    providers: [
      {
        provide: DataSource,
        useValue: dataSource,
      },
      ...providers,
      ...Object.entries(mockServices).map(([key, value]) => ({
        provide: key,
        useValue: value,
      })),
    ],
  }).compile();
}

export async function createTestDbContext(
  dataSource: DataSource,
): Promise<TestDbContext> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction('SERIALIZABLE');

  return {
    queryRunner,
    dataSource,
    manager: queryRunner.manager,
  };
}

export async function cleanupAllTestResources(
  context: TestDbContext,
  module: TestingModule,
) {
  if (context.queryRunner) {
    await context.queryRunner.rollbackTransaction();
    await context.queryRunner.release();
  }
  context.dataSource.destroy();
  await module.close();
  global.Date = OriginalDate;
  jest.restoreAllMocks();
}

export function getTestRepository<T>(
  context: TestDbContext,
  entity: any,
): Repository<T> {
  return context.manager.getRepository(entity);
}

export function mockDate(mockDate: Date) {
  const MockDate = class extends Date {
    constructor(...args: [string | number | Date] | []) {
      if (args.length === 0) {
        super(mockDate);
      } else {
        super(...args);
      }
    }
  };
  global.Date = MockDate as DateConstructor;
}
