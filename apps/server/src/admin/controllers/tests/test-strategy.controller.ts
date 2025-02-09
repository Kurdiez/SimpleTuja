import { Controller, Get } from '@nestjs/common';
import { N8N_AI_Strategy } from '~/trading/strategies/n8n-ai.strategy';
import { IgEpic, TimeResolution } from '~/trading/utils/const';

@Controller('admin/test-strategy')
export class TestStrategyController {
  constructor(private readonly n8nAiStrategy: N8N_AI_Strategy) {}

  @Get('n8n-ai')
  async executeStrategy() {
    await this.n8nAiStrategy.onPriceUpdate({
      epic: IgEpic.EURUSD,
      timeResolution: TimeResolution.MINUTE_15,
      time: new Date(),
    });
  }
}
