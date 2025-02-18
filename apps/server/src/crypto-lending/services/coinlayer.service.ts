import { Injectable, OnModuleInit } from '@nestjs/common';
import { CryptoToken } from '@simpletuja/shared';
import axios from 'axios';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';
import { ConfigService } from '~/config';

@Injectable()
export class CoinlayerService implements OnModuleInit {
  private exchangeRates: Record<CryptoToken, number> = {
    [CryptoToken.ETH]: 1,
    [CryptoToken.WETH]: 1,
    [CryptoToken.DAI]: 2678.2,
    [CryptoToken.USDC]: 2678.2,
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.updateCryptoExchangeRates();
  }

  @CronWithErrorHandling({
    cronTime: '0 0 * * *',
    taskName: 'Update Crypto Exchange Rates',
  })
  async updateCryptoExchangeRates(): Promise<void> {
    // Only update rates in production because it uses up the API quota
    if (this.configService.get('ENVIRONMENT') !== 'production') {
      return;
    }

    const maxRetries = 5;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const coinlayerApiKey = this.configService.get('COINLAYER_API_KEY');
        const url = `http://api.coinlayer.com/live?access_key=${coinlayerApiKey}&symbols=ETH`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.success) {
          const ETH_USD = data.rates.ETH;
          this.exchangeRates = {
            [CryptoToken.ETH]: 1,
            [CryptoToken.WETH]: 1,
            [CryptoToken.DAI]: ETH_USD,
            [CryptoToken.USDC]: ETH_USD,
          };
          return; // Success - exit the retry loop
        }
        throw new Error('Failed to fetch exchange rates from Coinlayer');
      } catch (error) {
        if (attempt === maxRetries - 1) {
          // If this was the last attempt, rethrow the error
          throw new Error(
            `Failed to update exchange rates after ${maxRetries} attempts: ${error.message}`,
          );
        }
        // Wait with exponential backoff before next retry
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  getExchangeRates(): Record<CryptoToken, number> {
    return { ...this.exchangeRates };
  }
}
