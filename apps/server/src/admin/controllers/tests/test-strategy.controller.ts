import { Controller, Get } from '@nestjs/common';
import { DTIG_AI_STRATEGY } from '~/trading/strategies/DTIG_AI.strategy';
import { IgEpic, TimeResolution } from '~/trading/utils/const';

@Controller('admin/test-strategy')
export class TestStrategyController {
  constructor(private readonly dtigAiStrategy: DTIG_AI_STRATEGY) {}

  @Get('gemini-ai')
  async executeStrategy() {
    await this.dtigAiStrategy.onPriceUpdate({
      epic: IgEpic.EURUSD,
      timeResolution: TimeResolution.MINUTE_15,
      time: new Date(),
    });
  }
}
