import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import Big from 'big.js';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { CustomException } from '~/commons/errors/custom-exception';
import { retry } from '~/commons/utils/retry';
import { ConfigService } from '~/config';
import {
  IgEpic,
  MarketStatus,
  PositionDirection,
  TimeResolution,
  TradingCurrency,
} from '../utils/const';

const TradableCurrencies = [TradingCurrency.USD];

@Injectable()
export class IgApiService {
  private readonly apiClient: AxiosInstance;
  private cst: string | null = null;
  private securityToken: string | null = null;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = configService.get('IG_API_KEY');
    this.baseURL = configService.get('IG_API_BASE_URL');

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-IG-API-KEY': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json; charset=UTF-8',
        Version: '2',
      },
    });

    // Only keep request interceptor to add auth headers when available
    this.apiClient.interceptors.request.use((config) => {
      if (this.cst) {
        config.headers['CST'] = this.cst;
      }
      if (this.securityToken) {
        config.headers['X-SECURITY-TOKEN'] = this.securityToken;
      }
      return config;
    });

    // IG tokens expire in two ways:
    // 1. After 6 hour of inactivity
    // 2. After 24 hours no matter what
    // Refreshing every 5 hour guarantees we will always be logged in
    setInterval(
      () => {
        this.login();
      },
      5 * 60 * 60 * 1000,
    ); // 5 hours in milliseconds
    this.login();
  }

  private async makeIgRequest<T>({
    method,
    endpoint,
    data,
    headers = {},
  }: {
    method: 'get' | 'post' | 'put';
    endpoint: string;
    data?: any;
    headers?: Record<string, string>;
  }): Promise<{ data: T; headers: Record<string, any> }> {
    try {
      const response = await retry(async () => {
        const result = await this.apiClient.request({
          method,
          url: endpoint,
          data,
          headers,
        });
        return result;
      });
      return {
        data: response.data,
        headers: response.headers as Record<string, any>,
      };
    } catch (error) {
      throw new CustomException(`IG API request failed: ${endpoint}`, {
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
      });
    }
  }

  async login() {
    try {
      const username = this.configService.get('IG_LOGIN_USERNAME');
      const password = this.configService.get('IG_LOGIN_PASSWORD');

      const response = await this.makeIgRequest({
        method: 'post',
        endpoint: '/session',
        data: {
          identifier: username,
          password: password,
          encryptedPassword: false,
        },
      });

      // Headers are still in the axios response
      this.cst = response.headers['cst'];
      this.securityToken = response.headers['x-security-token'];

      if (!this.cst || !this.securityToken) {
        throw new CustomException(
          'Authentication failed - tokens not received',
        );
      }
    } catch (error) {
      captureException({ error });
    }
  }

  async getMarketDetails(epic: IgEpic): Promise<{
    data: {
      instrument: {
        valueOfOnePip: string;
        lotSize: number;
        currencies: { code: TradingCurrency }[];
      };
      snapshot: {
        marketStatus: string;
      };
    };
    headers: Record<string, any>;
  }> {
    return this.makeIgRequest({
      method: 'get',
      endpoint: `/markets/${epic}`,
    });
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
    try {
      const { data: marketDetails } = await this.getMarketDetails(epic);

      const valueOfOnePip = Number(marketDetails.instrument.valueOfOnePip);
      const lotSize = Number(marketDetails.instrument.lotSize);

      if (isNaN(valueOfOnePip) || isNaN(lotSize)) {
        throw new CustomException('Invalid number conversion', {
          valueOfOnePip,
          lotSize,
          marketDetails: marketDetails.instrument,
        });
      }

      const valueOfOnePipBig = new Big(valueOfOnePip);
      const lotSizeBig = new Big(lotSize);

      // Calculate price difference between entry and stop loss
      const priceDifference = currentPrice.minus(stopLossPrice).abs();

      // Calculate position size based on risk amount
      const positionSize = riskAmount.div(
        priceDifference.times(valueOfOnePipBig),
      );

      // Round down to the nearest lot size
      const roundedSize = positionSize
        .div(lotSizeBig)
        .round(0, Big.roundDown)
        .times(lotSizeBig);

      // Ensure the position size is not smaller than the lot size
      const finalSize = roundedSize.gt(lotSizeBig) ? roundedSize : lotSizeBig;

      // Calculate potential loss
      const potentialLoss = finalSize
        .times(priceDifference)
        .times(valueOfOnePipBig);

      return {
        positionSize: finalSize,
        potentialLoss,
      };
    } catch (error) {
      throw new CustomException('Failed to calculate position size', {
        error,
        epic,
        riskAmount,
        currentPrice,
        stopLossPrice,
      });
    }
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
  }) {
    try {
      const { data: accountInfo } = await this.makeIgRequest<{
        accounts: Array<{
          balance: {
            balance: number;
          };
        }>;
      }>({
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

      return await this.placeBracketOrder({
        epic,
        direction,
        size: positionSize.toNumber(),
        stopLossLevel: stopLossPrice.toNumber(),
        takeProfitLevel: takeProfitPrice?.toNumber(),
      });
    } catch (error) {
      captureException({ error });
      throw new CustomException('Failed to place risk-based bracket order', {
        error,
        epic,
        direction,
        riskPercentage: riskPercentage.toString(),
      });
    }
  }

  async placeBracketOrder({
    epic,
    direction,
    size,
    stopLossLevel,
    takeProfitLevel,
  }: {
    epic: IgEpic;
    direction: PositionDirection;
    size: number;
    stopLossLevel: number;
    takeProfitLevel?: number;
  }) {
    const {
      data: {
        instrument: { currencies },
        snapshot: { marketStatus },
      },
    } = await this.getMarketDetails(epic);

    if (marketStatus !== MarketStatus.TRADEABLE) {
      throw new CustomException('Market is not currently tradeable', {
        epic,
        marketStatus,
      });
    }

    const currencyCode = currencies[0].code;

    if (!TradableCurrencies.includes(currencyCode)) {
      throw new CustomException(`Currency is not tradable`, {
        epic,
        currencyCode,
      });
    }

    return await this.makeIgRequest({
      method: 'post',
      endpoint: '/positions/otc',
      data: {
        epic,
        expiry: '-',
        direction,
        size,
        orderType: 'MARKET',
        guaranteedStop: false,
        stopLevel: stopLossLevel,
        limitLevel: takeProfitLevel,
        forceOpen: true,
        currencyCode,
      },
    });
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
    const { data } = await this.makeIgRequest<{
      prices: {
        snapshotTime: string;
        openPrice: { bid: number; ask: number; lastTraded: number };
        closePrice: { bid: number; ask: number; lastTraded: number };
        highPrice: { bid: number; ask: number; lastTraded: number };
        lowPrice: { bid: number; ask: number; lastTraded: number };
        lastTradedVolume: number;
      }[];
    }>({
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
}
