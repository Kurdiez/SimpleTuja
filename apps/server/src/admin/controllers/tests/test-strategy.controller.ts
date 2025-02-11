import { Controller, Get } from '@nestjs/common';
import { Gemini_AI_Strategy } from '~/trading/strategies/gemini-ai.strategy';
import { IgEpic, TimeResolution } from '~/trading/utils/const';

@Controller('admin/test-strategy')
export class TestStrategyController {
  constructor(private readonly geminiAiStrategy: Gemini_AI_Strategy) {}

  @Get('gemini-ai')
  async executeStrategy() {
    await this.geminiAiStrategy.onPriceUpdate({
      epic: IgEpic.EURUSD,
      timeResolution: TimeResolution.MINUTE_15,
      time: new Date(),
    });
  }
}
