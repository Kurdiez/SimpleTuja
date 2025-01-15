import { Body, Controller, Param, Post } from '@nestjs/common';
import Big from 'big.js';
import { IgApiService } from '~/trading/services/ig-api.service';
import {
  IgEpic,
  PositionDirection,
  TimeResolution,
} from '~/trading/utils/const';

@Controller('admin/test-ig')
export class TestIgController {
  constructor(private readonly igApi: IgApiService) {}

  @Post('login')
  async login() {
    await this.igApi.login();
  }

  @Post('get-market-details/:epic')
  async getMarketDetails(@Param('epic') epic: IgEpic) {
    return await this.igApi.getMarketDetails(epic);
  }

  @Post('calculate-position-size')
  async calculatePositionSize(
    @Body()
    body: {
      epic: IgEpic;
      riskAmount: string;
      currentPrice: string;
      stopLossPrice: string;
    },
  ) {
    return await this.igApi.calculatePositionSize({
      epic: body.epic,
      riskAmount: new Big(body.riskAmount),
      currentPrice: new Big(body.currentPrice),
      stopLossPrice: new Big(body.stopLossPrice),
    });
  }

  @Post('market-navigation/:nodeId?')
  async getMarketNavigation(@Param('nodeId') nodeId?: string) {
    return await this.igApi.getMarketNavigation(nodeId);
  }

  @Post('historical-prices')
  async getHistoricalPrices(
    @Body()
    body: {
      epic: IgEpic;
      resolution: TimeResolution;
      numPoints: number;
    },
  ) {
    return await this.igApi.getHistoricalPrices(body);
  }

  @Post('place-bracket-order-with-risk')
  async placeBracketOrderWithRisk(
    @Body()
    body: {
      epic: IgEpic;
      direction: PositionDirection;
      riskPercentage: string;
      currentPrice: string;
      stopLossPrice: string;
      takeProfitPrice?: string;
    },
  ) {
    return await this.igApi.placeBracketOrderWithRisk({
      epic: body.epic,
      direction: body.direction,
      riskPercentage: new Big(body.riskPercentage),
      currentPrice: new Big(body.currentPrice),
      stopLossPrice: new Big(body.stopLossPrice),
      takeProfitPrice: body.takeProfitPrice
        ? new Big(body.takeProfitPrice)
        : undefined,
    });
  }

  @Post('confirm-deal/:dealReference')
  async confirmDealStatus(@Param('dealReference') dealReference: string) {
    return await this.igApi.confirmDealStatus(dealReference);
  }
}
