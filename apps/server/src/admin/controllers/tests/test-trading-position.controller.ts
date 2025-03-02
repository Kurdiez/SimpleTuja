import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Big from 'big.js';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import { TradingPositionService } from '~/trading/services/trading-position.service';
import {
  IgEpic,
  PositionDirection,
  TradingPositionStatus,
  TradingStrategy,
} from '~/trading/utils/const';

@Controller('admin/test-trading-position')
export class TestTradingPositionController {
  constructor(
    private readonly tradingPositionService: TradingPositionService,
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepo: Repository<TradingPositionEntity>,
  ) {}

  @Post('update-positions')
  async updatePositions() {
    return this.tradingPositionService.updatePositions();
  }

  @Post('update-performance-report')
  async updatePerformanceReport() {
    // Create 20 mock positions with even distribution of profits and losses
    const mockPositions: Partial<TradingPositionEntity>[] = [];
    const basePrice = new Big('1.03735');

    for (let i = 0; i < 20; i++) {
      const direction =
        i % 2 === 0 ? PositionDirection.SELL : PositionDirection.BUY;
      const isProfit = i < 10; // First 10 positions are profitable
      const entryPrice = basePrice;

      // For sell positions: profit when exit < entry, loss when exit > entry
      // For buy positions: profit when exit > entry, loss when exit < entry
      let exitPrice;
      if (direction === PositionDirection.SELL) {
        exitPrice = isProfit ? entryPrice.minus(0.002) : entryPrice.plus(0.002);
      } else {
        exitPrice = isProfit ? entryPrice.plus(0.002) : entryPrice.minus(0.002);
      }

      const stopLossPrice =
        direction === PositionDirection.SELL
          ? entryPrice.plus(0.00397)
          : entryPrice.minus(0.00397);

      const takeProfitPrice =
        direction === PositionDirection.SELL
          ? entryPrice.minus(0.00075)
          : entryPrice.plus(0.00075);

      const position: Partial<TradingPositionEntity> = {
        id: uuidv4(),
        status: TradingPositionStatus.CLOSED,
        igPositionOpenDealReference: `MOCKREF${i + 1}`,
        igPositionOpenDealId: `MOCKDEAL${i + 1}`,
        strategy: TradingStrategy.DTIG_AI,
        epic: IgEpic.EURUSD,
        direction,
        size: new Big('2'),
        entryPrice,
        exitPrice,
        stopLossPrice,
        takeProfitPrice,
        metadata: {
          signal: {
            stepAnalysis: {
              1: 'The longer term timeframe (1H) analysis...',
              2: 'Trading range analysis...',
              3: 'Mean reversion analysis...',
              4: 'Trading strategy selection...',
              5: 'Price levels identification...',
              6: 'Short term timeframe analysis...',
              7: 'Trade decision calculation...',
              8: 'Risk/reward assessment...',
            },
            tradeDecision: {
              action: direction.toLowerCase(),
              stopLoss: stopLossPrice.toString(),
              takeProfit: takeProfitPrice.toString(),
            },
          },
        },
        createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000), // Spread over last 20 days
        exitedAt: new Date(Date.now() - (19 - i) * 24 * 60 * 60 * 1000), // Exit one day after creation
      };

      mockPositions.push(position);
    }

    // Save mock positions to database
    await Promise.all(
      mockPositions.map((position) => this.tradingPositionRepo.save(position)),
    );

    return this.tradingPositionService.updatePerformanceReport(
      mockPositions as TradingPositionEntity[],
    );
  }
}
