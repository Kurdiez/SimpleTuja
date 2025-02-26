import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosInstance } from 'axios';
import Big from 'big.js';
import { Not, Repository } from 'typeorm';
import { CustomException } from '~/commons/errors/custom-exception';
import { retry } from '~/commons/utils/retry';
import { ConfigService } from '~/config';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import {
  IgEpic,
  MarketStatus,
  PositionDirection,
  TimeResolution,
  TradingCurrency,
  TradingPositionStatus,
} from '../utils/const';
import {
  IgOpenPositionsResponse,
  IgPositionDetailsResponse,
} from '../utils/ig-api.types';

const TradableCurrencies = [TradingCurrency.USD];

@Injectable()
export class IgApiService {
  private readonly tradingClient: AxiosInstance;
  private readonly dataClient: AxiosInstance;
  private tradingCst: string | null = null;
  private tradingSecurityToken: string | null = null;
  private dataCst: string | null = null;
  private dataSecurityToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepo: Repository<TradingPositionEntity>,
  ) {
    const tradingApiKey = configService.get('IG_DEMO_API_KEY');
    const tradingBaseURL = configService.get('IG_DEMO_API_BASE_URL');
    this.tradingClient = this.createApiClient(tradingApiKey, tradingBaseURL);

    const dataApiKey = configService.get('IG_DEMO_API_KEY');
    const dataBaseURL = configService.get('IG_DEMO_API_BASE_URL');
    this.dataClient = this.createApiClient(dataApiKey, dataBaseURL);

    setInterval(() => this.loginBoth(), 5 * 60 * 60 * 1000);
    this.loginBoth();
  }

  private createApiClient(apiKey: string, baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      headers: {
        'X-IG-API-KEY': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json; charset=UTF-8',
        Version: '2',
      },
    });
  }

  private async makeIgRequest<T>({
    client,
    method,
    endpoint,
    data,
    params,
    headers = {},
  }: {
    client: 'trading' | 'data';
    method: 'get' | 'post' | 'put';
    endpoint: string;
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  }): Promise<{ data: T; headers: Record<string, any> }> {
    const apiClient =
      client === 'trading' ? this.tradingClient : this.dataClient;
    const cst = client === 'trading' ? this.tradingCst : this.dataCst;
    const securityToken =
      client === 'trading' ? this.tradingSecurityToken : this.dataSecurityToken;

    const requestHeaders = {
      ...headers,
      ...(cst && { CST: cst }),
      ...(securityToken && { 'X-SECURITY-TOKEN': securityToken }),
    };

    try {
      const response = await retry(async () => {
        return await apiClient.request({
          method,
          url: endpoint,
          data,
          params,
          headers: requestHeaders,
        });
      });

      return {
        data: response.data,
        headers: response.headers as Record<string, any>,
      };
    } catch (error) {
      throw new CustomException(
        `IG ${client} API request failed: ${endpoint}`,
        {
          error,
          endpoint,
          method,
          errorDetails: {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
            headers: error?.response?.headers,
          },
        },
      );
    }
  }

  async loginBoth() {
    await Promise.all([this.login('trading'), this.login('data')]);
  }

  private async login(type: 'trading' | 'data') {
    const username = this.configService.get(
      type === 'trading' ? 'IG_DEMO_LOGIN_USERNAME' : 'IG_DEMO_LOGIN_USERNAME',
    );
    const password = this.configService.get(
      type === 'trading' ? 'IG_DEMO_LOGIN_PASSWORD' : 'IG_DEMO_LOGIN_PASSWORD',
    );

    const response = await this.makeIgRequest({
      client: type,
      method: 'post',
      endpoint: '/session',
      data: {
        identifier: username,
        password: password,
        encryptedPassword: false,
      },
    });

    if (type === 'trading') {
      this.tradingCst = response.headers['cst'];
      this.tradingSecurityToken = response.headers['x-security-token'];
    } else {
      this.dataCst = response.headers['cst'];
      this.dataSecurityToken = response.headers['x-security-token'];
    }
  }

  async getMarketDetails(epic: IgEpic): Promise<{
    data: {
      instrument: {
        valueOfOnePip: string;
        lotSize: number;
        currencies: { code: TradingCurrency }[];
        contractSize: string;
        onePipMeans: string;
        type: string;
        marginDepositBands: Array<{
          min: number;
          max: number | null;
          margin: number;
        }>;
      };
      snapshot: {
        marketStatus: string;
      };
      dealingRules: {
        minDealSize: {
          unit: string;
          value: number;
        };
      };
    };
    headers: Record<string, any>;
  }> {
    return this.makeIgRequest({
      client: 'trading',
      method: 'get',
      endpoint: `/markets/${epic}`,
    });
  }

  private calculateMarginRequirement({
    size,
    currentPrice,
    marketDetails,
  }: {
    size: Big;
    currentPrice: Big;
    marketDetails: {
      instrument: {
        contractSize: string;
        lotSize: number;
        marginDepositBands: Array<{
          min: number;
          max: number | null;
          margin: number;
        }>;
      };
    };
  }): { marginRequirement: Big; positionValue: Big } {
    const lotSize = Number(marketDetails.instrument.lotSize);
    const positionValue = size
      .times(Number(marketDetails.instrument.contractSize))
      .times(currentPrice);

    const marginBand = marketDetails.instrument.marginDepositBands.find(
      (band) => {
        const positionSizeInLots = size.div(lotSize).toNumber();
        return (
          positionSizeInLots >= band.min &&
          (band.max === null || positionSizeInLots <= band.max)
        );
      },
    );

    const marginPercentage = new Big(marginBand.margin).div(100);
    const marginRequirement = positionValue.times(marginPercentage);

    return { marginRequirement, positionValue };
  }

  async calculatePositionSize({
    epic,
    riskAmount,
    currentPrice,
    stopLossPrice,
  }: {
    epic: IgEpic;
    riskAmount: Big;
    currentPrice: Big;
    stopLossPrice: Big;
  }) {
    const { data: marketDetails } = await this.getMarketDetails(epic);
    const lotSize = Number(marketDetails.instrument.lotSize);
    const instrumentType = marketDetails.instrument.type;
    const minDealSize = new Big(marketDetails.dealingRules.minDealSize.value);

    if (isNaN(lotSize)) {
      throw new CustomException('Invalid lot size', {
        lotSize,
        marketDetails: marketDetails.instrument,
      });
    }

    if (instrumentType !== 'CURRENCIES') {
      throw new CustomException('Unsupported instrument type', {
        instrumentType,
        marketDetails: marketDetails.instrument,
      });
    }

    const priceDifference = currentPrice.minus(stopLossPrice).abs();
    const contractSize = Number(marketDetails.instrument.contractSize);

    // Calculate required position size to achieve desired risk amount
    let positionSize = riskAmount.div(
      new Big(contractSize).times(priceDifference).times(currentPrice),
    );

    // Round down to nearest multiple of minDealSize
    positionSize = positionSize
      .div(minDealSize)
      .round(0, Big.roundDown)
      .times(minDealSize);

    // Ensure minimum size
    positionSize = positionSize.lt(minDealSize) ? minDealSize : positionSize;

    // Calculate actual potential loss
    const potentialLoss = positionSize
      .times(contractSize)
      .times(priceDifference)
      .times(currentPrice);

    // Calculate margin requirement
    const { marginRequirement } = this.calculateMarginRequirement({
      size: positionSize,
      currentPrice,
      marketDetails,
    });

    return {
      positionSize,
      potentialLoss,
      marginRequirement,
    };
  }

  async placeBracketOrderWithRisk({
    epic,
    direction,
    riskPercentage,
    currentPrice,
    stopLossPrice,
    takeProfitPrice,
  }: {
    epic: IgEpic;
    direction: PositionDirection;
    riskPercentage: Big;
    currentPrice: Big;
    stopLossPrice: Big;
    takeProfitPrice?: Big;
  }): Promise<string | null> {
    const { data: accountInfo } = await this.makeIgRequest<{
      accounts: Array<{
        balance: {
          balance: number;
        };
      }>;
    }>({
      client: 'trading',
      method: 'get',
      endpoint: '/accounts',
      headers: {
        Version: '1',
      },
    });

    const balance = new Big(accountInfo.accounts[0].balance.balance);
    const riskAmount = balance.times(riskPercentage);

    const { positionSize } = await this.calculatePositionSize({
      epic,
      riskAmount,
      currentPrice,
      stopLossPrice,
    });

    const dealReference = await this.placeBracketOrder({
      epic,
      direction,
      size: positionSize,
      stopLossPrice,
      takeProfitPrice,
      currentPrice,
    });

    return dealReference;
  }

  private async hasOpenPosition(epic: IgEpic): Promise<boolean> {
    const openPosition = await this.tradingPositionRepo.findOne({
      where: {
        epic,
        status: Not(TradingPositionStatus.CLOSED),
      },
    });

    return !!openPosition;
  }

  async placeBracketOrder({
    epic,
    direction,
    size,
    stopLossPrice,
    takeProfitPrice,
    currentPrice,
  }: {
    epic: IgEpic;
    direction: PositionDirection;
    size: Big;
    stopLossPrice: Big;
    takeProfitPrice?: Big;
    currentPrice: Big;
  }): Promise<string | null> {
    // Check for existing open position
    const hasOpen = await this.hasOpenPosition(epic);
    if (hasOpen) {
      return null;
    }

    // Get account information first
    const { data: accountInfo } = await this.makeIgRequest<{
      accounts: Array<{
        balance: {
          balance: number;
          available: number;
        };
      }>;
    }>({
      client: 'trading',
      method: 'get',
      endpoint: '/accounts',
      headers: {
        Version: '1',
      },
    });

    const balance = new Big(accountInfo.accounts[0].balance.balance);
    const availableFunds = new Big(accountInfo.accounts[0].balance.available);

    if (availableFunds.lt(balance.times(0.2))) {
      return null;
    }

    const { data: marketDetails } = await this.getMarketDetails(epic);

    if (marketDetails.snapshot.marketStatus !== MarketStatus.TRADEABLE) {
      return null;
    }

    const currencyCode = marketDetails.instrument.currencies[0].code;
    if (!TradableCurrencies.includes(currencyCode)) {
      return null;
    }

    const { marginRequirement } = this.calculateMarginRequirement({
      size,
      currentPrice,
      marketDetails,
    });

    if (availableFunds.lt(marginRequirement)) {
      return null;
    }

    const {
      data: { dealReference },
    } = await this.makeIgRequest<{ dealReference: string }>({
      client: 'trading',
      method: 'post',
      endpoint: '/positions/otc',
      data: {
        epic,
        expiry: '-',
        direction,
        size: size.toNumber(),
        orderType: 'MARKET',
        guaranteedStop: false,
        stopLevel: stopLossPrice.toNumber(),
        limitLevel: takeProfitPrice?.toNumber(),
        forceOpen: true,
        currencyCode,
      },
    });

    return dealReference as string;
  }

  async updatePositionLevels({
    dealId,
    stopLevel,
    limitLevel,
  }: {
    dealId: string;
    stopLevel?: number | null;
    limitLevel?: number | null;
  }) {
    const payload: Record<string, number | null> = {};
    if (stopLevel !== undefined) payload.stopLevel = stopLevel;
    if (limitLevel !== undefined) payload.limitLevel = limitLevel;

    return await this.makeIgRequest({
      client: 'trading',
      method: 'put',
      endpoint: `/positions/otc/${dealId}`,
      data: payload,
    });
  }

  async getMarketNavigation(nodeId?: string) {
    const endpoint = nodeId
      ? `/marketnavigation/${nodeId}`
      : '/marketnavigation';
    return await this.makeIgRequest({
      client: 'trading',
      method: 'get',
      endpoint,
      headers: {
        Version: '1', // Override the default Version for this specific endpoint
      },
    });
  }

  async getHistoricalPrices({
    epic,
    resolution,
    numPoints,
  }: {
    epic: IgEpic;
    resolution: TimeResolution;
    numPoints: number;
  }): Promise<
    {
      snapshotTime: string;
      openPrice: { bid: number; ask: number; lastTraded: number };
      closePrice: { bid: number; ask: number; lastTraded: number };
      highPrice: { bid: number; ask: number; lastTraded: number };
      lowPrice: { bid: number; ask: number; lastTraded: number };
      lastTradedVolume: number;
    }[]
  > {
    const { data } = await this.makeIgRequest<{ prices: any[] }>({
      client: 'data',
      method: 'get',
      endpoint: `/prices/${epic}/${resolution}/${numPoints}`,
    });
    return data.prices;
  }

  async confirmDealStatus(dealReference: string) {
    const { data } = await this.makeIgRequest<{
      dealId: string;
      dealStatus: 'ACCEPTED' | 'REJECTED';
      reason?: string;
    }>({
      client: 'trading',
      method: 'get',
      endpoint: `/confirms/${dealReference}`,
      headers: {
        Version: '1',
      },
    });

    if (data.dealStatus === 'REJECTED') {
      throw new CustomException('Deal was rejected', {
        dealReference,
        reason: data.reason,
      });
    }

    return data;
  }

  async getLivePositionDetails(dealId: string) {
    const { data } = await this.makeIgRequest<IgPositionDetailsResponse>({
      client: 'trading',
      method: 'get',
      endpoint: `/positions/${dealId}`,
    });

    return data.position;
  }

  async getAllOpenPositions() {
    const { data } = await this.makeIgRequest<IgOpenPositionsResponse>({
      client: 'trading',
      method: 'get',
      endpoint: '/positions',
    });

    return data;
  }

  async getClosedPositionsActivity(params: {
    from?: string;
    positionOpenDealIds: string[];
  }): Promise<
    Record<
      string,
      {
        date: string;
        epic: string;
        dealId: string;
        details: {
          actions: Array<{
            actionType: string;
            level: number;
            size: number;
            direction: 'BUY' | 'SELL';
            dealReference: string;
            marketName: string;
            affectedDealId?: string;
          }>;
        };
      }
    >
  > {
    // Default from to 24 hours ago if not provided
    const fromDate =
      params.from ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data } = await this.makeIgRequest<{
      activities: Array<{
        date: string;
        epic: string;
        dealId: string;
        details: {
          actions: Array<{
            actionType: string;
            affectedDealId?: string;
            level: number;
            size: number;
            direction: 'BUY' | 'SELL';
            dealReference: string;
            marketName: string;
          }>;
        };
      }>;
    }>({
      client: 'trading',
      method: 'get',
      endpoint: '/history/activity',
      headers: {
        Version: '3',
      },
      params: {
        detailed: true,
        filter: 'type==POSITION',
        from: fromDate,
      },
    });

    // Filter activities that closed any of the provided position open deal IDs
    const closedPositions = data.activities.filter((activity) =>
      activity.details.actions.some(
        (action) =>
          (action.actionType === 'POSITION_CLOSED' ||
            action.actionType === 'POSITION_PARTIALLY_CLOSED') &&
          action.affectedDealId &&
          params.positionOpenDealIds.includes(action.affectedDealId),
      ),
    );

    // Create a map of positionOpenDealId to activity
    const result: Record<string, (typeof closedPositions)[0]> = {};
    closedPositions.forEach((activity) => {
      const action = activity.details.actions.find(
        (a) =>
          (a.actionType === 'POSITION_CLOSED' ||
            a.actionType === 'POSITION_PARTIALLY_CLOSED') &&
          a.affectedDealId &&
          params.positionOpenDealIds.includes(a.affectedDealId),
      );
      if (action?.affectedDealId) {
        result[action.affectedDealId] = activity;
      }
    });

    return result;
  }

  async getClosedPositionByOpenDealId(positionOpenDealId: string) {
    // Get date from 90 days ago as default lookback period
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultFromDate.getDate() - 90);
    const fromDate = defaultFromDate.toISOString().split('T')[0];

    const { data } = await this.makeIgRequest<{
      activities: Array<{
        date: string;
        epic: string;
        dealId: string;
        description: string;
        details: {
          dealReference: string;
          actions: Array<{
            actionType: string;
            affectedDealId?: string;
            level: number;
            size: number;
            direction: 'BUY' | 'SELL';
            dealReference: string;
            marketName: string;
            currency: string;
            stopLevel?: number;
            limitLevel?: number;
          }>;
          marketName: string;
          currency: string;
          size: number;
          direction: 'BUY' | 'SELL';
          level: number;
          stopLevel?: number;
          limitLevel?: number;
        };
      }>;
    }>({
      client: 'trading',
      method: 'get',
      endpoint: '/history/activity',
      headers: {
        Version: '3',
      },
      params: {
        detailed: true,
        filter: 'type==POSITION',
        from: fromDate,
      },
    });

    // Find position that matches the positionOpenDealId in the actions array
    const matchingPosition = data.activities.find((activity) =>
      activity.details.actions.some(
        (action) =>
          action.actionType === 'POSITION_CLOSED' &&
          action.affectedDealId === positionOpenDealId,
      ),
    );

    if (!matchingPosition) {
      throw new CustomException('Closed position not found', {
        positionOpenDealId,
      });
    }

    return matchingPosition;
  }
}
