import { Injectable, Logger } from '@nestjs/common';
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
  private readonly tradingClient: AxiosInstance;
  private readonly dataClient: AxiosInstance;
  private tradingCst: string | null = null;
  private tradingSecurityToken: string | null = null;
  private dataCst: string | null = null;
  private dataSecurityToken: string | null = null;
  private readonly logger = new Logger(IgApiService.name);

  constructor(private readonly configService: ConfigService) {
    // Initialize trading client
    const tradingApiKey = configService.get('IG_DEMO_API_KEY');
    const tradingBaseURL = configService.get('IG_DEMO_API_BASE_URL');
    this.tradingClient = this.createApiClient(tradingApiKey, tradingBaseURL);

    // Initialize data client
    const dataApiKey = configService.get('IG_DEMO_API_KEY');
    const dataBaseURL = configService.get('IG_DEMO_API_BASE_URL');
    this.dataClient = this.createApiClient(dataApiKey, dataBaseURL);

    // Set up auth token refresh for both clients
    setInterval(() => this.loginBoth(), 5 * 60 * 60 * 1000); // 5 hours
    this.loginBoth();
  }

  private createApiClient(apiKey: string, baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      headers: {
        'X-IG-API-KEY': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json; charset=UTF-8',
        Version: '2',
      },
    });

    return client;
  }

  async loginBoth() {
    await Promise.all([this.login('trading'), this.login('data')]);
  }

  private async makeIgRequest<T>({
    client,
    method,
    endpoint,
    data,
    headers = {},
  }: {
    client: 'trading' | 'data';
    method: 'get' | 'post' | 'put';
    endpoint: string;
    data?: any;
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

  private async login(type: 'trading' | 'data') {
    try {
      const username = this.configService.get(
        type === 'trading'
          ? 'IG_DEMO_LOGIN_USERNAME'
          : 'IG_DEMO_LOGIN_USERNAME',
      );
      const password = this.configService.get(
        type === 'trading'
          ? 'IG_DEMO_LOGIN_PASSWORD'
          : 'IG_DEMO_LOGIN_PASSWORD',
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
        if (!this.tradingCst || !this.tradingSecurityToken) {
          throw new CustomException(
            'Trading API authentication failed - tokens not received',
          );
        }
      } else {
        this.dataCst = response.headers['cst'];
        this.dataSecurityToken = response.headers['x-security-token'];
        if (!this.dataCst || !this.dataSecurityToken) {
          throw new CustomException(
            'Data API authentication failed - tokens not received',
          );
        }
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
      client: 'trading',
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
      this.logger.log('Fetching account info for risk calculation');
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
      this.logger.log('Account balance retrieved:', {
        balance: balance.toString(),
      });

      const riskAmount = balance.times(riskPercentage);
      this.logger.log('Risk amount calculated:', {
        riskAmount: riskAmount.toString(),
        riskPercentage: riskPercentage.toString(),
      });

      const { positionSize } = await this.calculatePositionSize({
        epic,
        riskAmount,
        currentPrice,
        stopLossPrice,
      });

      this.logger.log('Position size calculated:', {
        positionSize: positionSize.toString(),
        epic,
        currentPrice: currentPrice.toString(),
        stopLossPrice: stopLossPrice.toString(),
      });

      const dealReference = await this.placeBracketOrder({
        epic,
        direction,
        size: positionSize,
        stopLossPrice,
        takeProfitPrice,
      });

      this.logger.log('Bracket order placed successfully:', {
        dealReference,
        epic,
        direction,
        size: positionSize.toString(),
      });

      return dealReference;
    } catch (error) {
      this.logger.error('Failed to place risk-based bracket order:', {
        error,
        epic,
        direction,
        riskPercentage: riskPercentage.toString(),
      });
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
    stopLossPrice,
    takeProfitPrice,
  }: {
    epic: IgEpic;
    direction: PositionDirection;
    size: Big;
    stopLossPrice: Big;
    takeProfitPrice?: Big;
  }): Promise<string> {
    this.logger.log('Getting market details:', { epic });
    const {
      data: {
        instrument: { currencies },
        snapshot: { marketStatus },
      },
    } = await this.getMarketDetails(epic);

    this.logger.log('Market details retrieved:', {
      epic,
      marketStatus,
      currencies: currencies.map((c) => c.code),
    });

    if (marketStatus !== MarketStatus.TRADEABLE) {
      this.logger.warn('Market is not tradeable:', { epic, marketStatus });
      throw new CustomException('Market is not currently tradeable', {
        epic,
        marketStatus,
      });
    }

    const currencyCode = currencies[0].code;

    if (!TradableCurrencies.includes(currencyCode)) {
      this.logger.warn('Currency is not tradable:', { epic, currencyCode });
      throw new CustomException(`Currency is not tradable`, {
        epic,
        currencyCode,
      });
    }

    this.logger.log('Placing order with parameters:', {
      epic,
      direction,
      size: size.toString(),
      stopLossPrice: stopLossPrice.toString(),
      takeProfitPrice: takeProfitPrice?.toString(),
      currencyCode,
    });

    const { data } = await this.makeIgRequest({
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

    this.logger.log('Order placed successfully:', { dealReference: data });
    return data as string;
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
}
