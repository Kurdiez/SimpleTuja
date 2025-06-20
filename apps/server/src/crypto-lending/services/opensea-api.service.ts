import { Injectable, Logger } from '@nestjs/common';
import { JsonRpcProvider } from '@opensea/seaport-js/node_modules/ethers';
import { Chain, OpenSeaSDK } from 'opensea-js';
import { ConfigService } from '~/config';

@Injectable()
export class OpenSeaAPIService {
  private readonly logger = new Logger(OpenSeaAPIService.name);
  private readonly openSeaSDK: OpenSeaSDK;
  private readonly queue: (() => Promise<void>)[] = [];
  private isProcessing = false;
  private lastTaskTimestamp = 0;
  private readonly MIN_TIME_BETWEEN_CALLS = 100; // milliseconds

  constructor(private readonly configService: ConfigService) {
    // Initialize provider using ethers from OpenSea's dependencies
    const provider = new JsonRpcProvider(
      `https://mainnet.infura.io/v3/${this.configService.get('INFURA_PROJECT_ID')}`,
    );

    // Initialize OpenSeaSDK
    this.openSeaSDK = new OpenSeaSDK(provider, {
      chain: Chain.Mainnet,
      apiKey: this.configService.get('OPENSEA_API_KEY'),
    });
  }

  async run<T>(fn: (sdk: OpenSeaSDK) => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        try {
          const result = await fn(this.openSeaSDK);
          resolve(result);
        } catch (error) {
          this.logger.error(error);
          reject(error);
        }
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        const timeSinceLastTask = Date.now() - this.lastTaskTimestamp;
        if (timeSinceLastTask < this.MIN_TIME_BETWEEN_CALLS) {
          await this.delay(this.MIN_TIME_BETWEEN_CALLS - timeSinceLastTask);
        }

        await task();
        this.lastTaskTimestamp = Date.now();
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
