import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosInstance } from 'axios';
import Big from 'big.js';
import { Not, Repository } from 'typeorm';
import { captureException } from '~/commons/error-handlers/capture-exception';
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

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepo: Repository<TradingPositionEntity>,
  ) {
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
    try {
      this.logger.log('Starting position size calculation:', {
        epic,
        riskAmount: riskAmount.toString(),
        currentPrice: currentPrice.toString(),
        stopLossPrice: stopLossPrice.toString(),
      });

      const { data: marketDetails } = await this.getMarketDetails(epic);
      this.logger.log('Market details retrieved:', {
        lotSize: marketDetails.instrument.lotSize,
        instrumentType: marketDetails.instrument.type,
        valueOfOnePip: marketDetails.instrument.valueOfOnePip,
        contractSize: marketDetails.instrument.contractSize,
        onePipMeans: marketDetails.instrument.onePipMeans,
      });

      const lotSize = Number(marketDetails.instrument.lotSize);
      const instrumentType = marketDetails.instrument.type;

      if (isNaN(lotSize)) {
        this.logger.error('Invalid lot size detected:', {
          lotSize,
          marketDetails: marketDetails.instrument,
        });
        throw new CustomException('Invalid lot size', {
          lotSize,
          marketDetails: marketDetails.instrument,
        });
      }

      // Calculate absolute price difference
      const priceDifference = currentPrice.minus(stopLossPrice).abs();
      this.logger.log('Price difference calculated:', {
        priceDifference: priceDifference.toString(),
      });

      let positionSize: Big;
      let potentialLoss: Big;

      if (instrumentType === 'CURRENCIES') {
        this.logger.log('Calculating position size for CURRENCIES');
        const contractSize = Number(marketDetails.instrument.contractSize);

        // Calculate required position size to achieve desired risk amount
        positionSize = riskAmount.div(
          new Big(contractSize).times(priceDifference).times(currentPrice),
        );

        this.logger.log('Initial position size calculated:', {
          positionSize: positionSize.toString(),
          contractSize,
          priceDifference: priceDifference.toString(),
          expectedLoss: positionSize
            .times(contractSize)
            .times(priceDifference)
            .times(currentPrice)
            .toString(),
        });

        // Round to whole number
        positionSize = positionSize.round(0, Big.roundDown);

        // Ensure minimum size of 1
        positionSize = positionSize.lt(1) ? new Big(1) : positionSize;

        // Calculate actual potential loss
        potentialLoss = positionSize
          .times(contractSize)
          .times(priceDifference)
          .times(currentPrice);

        this.logger.log('Final position size calculated:', {
          finalSize: positionSize.toString(),
          expectedLoss: potentialLoss.toString(),
          targetRisk: riskAmount.toString(),
          difference: potentialLoss.minus(riskAmount).toString(),
        });
      } else {
        this.logger.warn('Unsupported instrument type:', { instrumentType });
        throw new CustomException('Unsupported instrument type', {
          instrumentType,
          marketDetails: marketDetails.instrument,
        });
      }

      // Replace margin calculation with shared method
      const { marginRequirement } = this.calculateMarginRequirement({
        size: positionSize,
        currentPrice,
        marketDetails,
      });

      this.logger.log('Margin requirement calculated:', {
        marginRequirement: marginRequirement.toString(),
      });

      this.logger.log('Position size calculation completed:', {
        positionSize: positionSize.toString(),
        potentialLoss: potentialLoss.toString(),
        marginRequirement: marginRequirement.toString(),
      });

      return {
        positionSize,
        potentialLoss,
        marginRequirement,
      };
    } catch (error) {
      this.logger.error('Failed to calculate position size:', {
        error,
        epic,
        riskAmount: riskAmount.toString(),
        currentPrice: currentPrice.toString(),
        stopLossPrice: stopLossPrice.toString(),
      });
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
  }): Promise<string | null> {
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

      const { positionSize, potentialLoss, marginRequirement } =
        await this.calculatePositionSize({
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
        potentialLoss: potentialLoss.toString(),
        marginRequirement: marginRequirement.toString(),
      });

      const dealReference: string | null = await this.placeBracketOrder({
        epic,
        direction,
        size: positionSize,
        stopLossPrice,
        takeProfitPrice,
        currentPrice,
      });

      if (!dealReference) {
        this.logger.log('Failed to place risk-based bracket order', {
          epic,
          direction,
          riskPercentage: riskPercentage.toString(),
        });
        return null;
      }

      this.logger.log('Bracket order placed successfully:', {
        dealReference,
        epic,
        direction,
        size: positionSize.toString(),
      });

      return dealReference;
    } catch (error) {
      throw new CustomException('Failed to place risk-based bracket order:', {
        error,
        epic,
        direction,
        riskPercentage: riskPercentage.toString(),
      });
    }
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
    this.logger.log('Getting market details:', { epic });

    try {
      // Check for existing open position
      const hasOpen = await this.hasOpenPosition(epic);
      if (hasOpen) {
        this.logger.log('Skipping order - position already open for epic:', {
          epic,
        });
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
        this.logger.log(
          'Insufficient available funds - must be > 20% of balance',
          {
            availableFunds: availableFunds.toString(),
            minimumRequired: balance.times(0.2).toString(),
            balance: balance.toString(),
          },
        );
        return null;
      }

      const { data: marketDetails } = await this.getMarketDetails(epic);

      if (marketDetails.snapshot.marketStatus !== MarketStatus.TRADEABLE) {
        this.logger.log('Market is not tradeable:', {
          epic,
          marketStatus: marketDetails.snapshot.marketStatus,
        });
        return null;
      }

      const currencyCode = marketDetails.instrument.currencies[0].code;
      if (!TradableCurrencies.includes(currencyCode)) {
        this.logger.log('Currency is not tradable:', { epic, currencyCode });
        return null;
      }

      const { marginRequirement } = this.calculateMarginRequirement({
        size,
        currentPrice,
        marketDetails,
      });

      if (availableFunds.lt(marginRequirement)) {
        this.logger.log('Insufficient available funds for margin requirement', {
          availableFunds: availableFunds.toString(),
          marginRequirement: marginRequirement.toString(),
        });
        return null;
      }

      this.logger.log('Placing order with parameters:', {
        epic,
        direction,
        size: size.toString(),
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfitPrice?.toString(),
        currencyCode,
      });

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

      this.logger.log('Order placed successfully:', dealReference);
      return dealReference as string;
    } catch (error) {
      throw new CustomException('Failed to place bracket order:', {
        error,
        epic,
        direction,
        size: size.toString(),
      });
    }
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

    console.log('Deal status:', data);

    if (data.dealStatus === 'REJECTED') {
      throw new CustomException('Deal was rejected', {
        dealReference,
        reason: data.reason,
      });
    }

    return data;
  }
}
