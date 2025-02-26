import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    await this.igApi.loginBoth();
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

  @Post('place-bracket-order')
  async placeBracketOrder(
    @Body()
    body: {
      epic: IgEpic;
      direction: PositionDirection;
      size: string;
      currentPrice: string;
      stopLossPrice: string;
      takeProfitPrice?: string;
    },
  ) {
    return await this.igApi.placeBracketOrder({
      epic: body.epic,
      direction: body.direction,
      size: new Big(body.size),
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

  @Post('get-all-open-positions')
  async getAllOpenPositions() {
    return await this.igApi.getAllOpenPositions();
  }

  @Get('get-live-position-details/:dealId')
  async getLivePositionDetails(@Param('dealId') dealId: string) {
    return await this.igApi.getLivePositionDetails(dealId);
  }

  @Post('get-closed-positions-activity')
  async getClosedPositionsActivity(
    @Body()
    body: {
      from?: string;
      positionOpenDealIds: string[];
    },
  ) {
    return await this.igApi.getClosedPositionsActivity(body);
  }

  @Post('get-closed-positions-with-details')
  async getClosedPositionsWithDetails(
    @Body()
    body: {
      from?: string;
      positionOpenDealIds: string[];
    },
  ) {
    const activities = await this.igApi.getClosedPositionsActivity(body);
    return Object.fromEntries(
      Object.entries(activities).map(([dealId, activity]) => [
        dealId,
        {
          ...activity,
          details: {
            ...activity.details,
            actions: activity.details.actions.map((action) => ({
              ...action,
            })),
          },
        },
      ]),
    );
  }

  @Get('get-closed-position/:dealId')
  async getClosedPosition(@Param('dealId') openDealId: string) {
    return await this.igApi.getClosedPositionByOpenDealId(openDealId);
  }
}
