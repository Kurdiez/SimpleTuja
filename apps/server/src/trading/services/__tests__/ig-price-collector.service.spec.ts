import { TestingModule } from '@nestjs/testing';
import { fromZonedTime } from 'date-fns-tz';
import { DataSource } from 'typeorm';
import {
  TestDbContext,
  cleanupAllTestResources,
  createTestDbContext,
  createTestingModule,
  setupTestDatabase,
} from '~/commons/test/utils/jest-test-utils';
import { IgEpicPriceEntity } from '~/database/entities/trading/ig-epic-price.entity';
import { IgEpic } from '~/trading/utils/const';
import { IgApiService } from '../ig-api.service';
import { IgPriceCollectorService } from '../ig-price-collector.service';

describe('IgPriceCollectorService', () => {
  let service: IgPriceCollectorService;
  // let igPriceRepo: Repository<IgEpicPriceEntity>;
  let dataSource: DataSource;
  let dbContext: TestDbContext;
  let testNestModule: TestingModule;

  beforeEach(async () => {
    dataSource = await setupTestDatabase();

    // Create mock services
    const igApiService = jest.createMockFromModule<IgApiService>(
      '~/trading/services/ig-api.service',
    );

    // Create test context
    dbContext = await createTestDbContext(dataSource);

    // Create test module with mocks
    testNestModule = await createTestingModule(dataSource, {
      providers: [
        {
          provide: IgPriceCollectorService,
          useFactory: () => {
            return new IgPriceCollectorService(
              dbContext.manager.getRepository(IgEpicPriceEntity),
              igApiService,
            );
          },
        },
      ],
    });

    // Get service and repositories
    service = testNestModule.get<IgPriceCollectorService>(
      IgPriceCollectorService,
    );
    // igPriceRepo = dbContext.manager.getRepository(IgEpicPriceEntity);
  });

  afterEach(async () => {
    await cleanupAllTestResources(dbContext, testNestModule);
  });

  describe('isTradingHour', () => {
    describe('Weekly Trading Hours', () => {
      it('should return true for FX when it is just barely after the Monday trading hours', () => {
        // Monday 9:00 AM Sydney time (market open) -> convert to UTC
        const testDate = fromZonedTime(
          '2024-01-15T09:00:00',
          'Australia/Sydney',
        );
        expect(service.isTradingHour(IgEpic.EURUSD, testDate)).toBe(true);
      });

      it('should return true for FX when it is just barely before the Friday closing hours', () => {
        // Friday 16:59 NY time (just before market close) -> convert to UTC
        const testDate = fromZonedTime(
          '2024-01-19T16:59:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.EURUSD, testDate)).toBe(true);
      });

      it('should return false for FX when it is just barely before the Monday trading hours', () => {
        // Monday 8:59 AM Sydney time (just before market open) -> convert to UTC
        const testDate = fromZonedTime(
          '2024-01-15T08:59:00',
          'Australia/Sydney',
        );
        expect(service.isTradingHour(IgEpic.EURUSD, testDate)).toBe(false);
      });

      it('should return false for FX when it is just barely after the Friday closing hours', () => {
        // Friday 17:01 NY time (just after market close) -> convert to UTC
        const testDate = fromZonedTime(
          '2024-01-19T17:01:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.EURUSD, testDate)).toBe(false);
      });

      it('should return true for FX when it is randomly between the Monday and Friday trading hours', () => {
        // Wednesday 15:30 NY time (middle of the week) -> convert to UTC
        const testDate = fromZonedTime(
          '2024-01-17T15:30:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.EURUSD, testDate)).toBe(true);
      });

      it('should return false for FX during weekends', () => {
        // Sunday 12:00 NY time -> convert to UTC
        const testDate = fromZonedTime(
          '2024-01-14T12:00:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.EURUSD, testDate)).toBe(false);
      });
    });

    describe('Daily Trading Hours', () => {
      it('should return true for US shares during regular trading hours', () => {
        // Tuesday 14:30 NY time (middle of trading day)
        const testDate = fromZonedTime(
          '2024-01-16T14:30:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          true,
        );
      });

      it('should return true for US shares just after market open', () => {
        // Tuesday 09:00 NY time (market open)
        const testDate = fromZonedTime(
          '2024-01-16T09:00:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          true,
        );
      });

      it('should return true for US shares just before market close', () => {
        // Tuesday 15:59 NY time (just before market close)
        const testDate = fromZonedTime(
          '2024-01-16T15:59:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          true,
        );
      });

      it('should return false for US shares before market open', () => {
        // Tuesday 08:59 NY time (just before market open)
        const testDate = fromZonedTime(
          '2024-01-16T08:59:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          false,
        );
      });

      it('should return false for US shares after market close', () => {
        // Tuesday 16:01 NY time (just after market close)
        const testDate = fromZonedTime(
          '2024-01-16T16:01:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          false,
        );
      });

      it('should return false for US shares during Saturday', () => {
        // Saturday 12:00 NY time
        const testDate = fromZonedTime(
          '2024-01-20T12:00:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          false,
        );
      });

      it('should return false for US shares during Sunday', () => {
        // Sunday 12:00 NY time
        const testDate = fromZonedTime(
          '2024-01-21T12:00:00',
          'America/New_York',
        );
        expect(service.isTradingHour(IgEpic.US_SHARE_AMBC, testDate)).toBe(
          false,
        );
      });
    });
  });
});
