import { Controller, Post } from '@nestjs/common';
import { TradingPositionService } from '~/trading/services/trading-position.service';

@Controller('admin/test-trading-position')
export class TestTradingPositionController {
  constructor(
    private readonly tradingPositionService: TradingPositionService,
  ) {}

  @Post('update-positions')
  async updatePositions() {
    return this.tradingPositionService.updatePositions();
  }
}
