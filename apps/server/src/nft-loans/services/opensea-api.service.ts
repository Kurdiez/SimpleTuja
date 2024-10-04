import { Injectable, Logger } from '@nestjs/common';
import { Chain, OpenSeaSDK } from 'opensea-js';
import { ethers } from 'ethers';
import { ConfigService } from '~/config';

@Injectable()
export class OpenSeaAPIService {
  private readonly logger = new Logger(OpenSeaAPIService.name);
  private readonly openSeaSDK: OpenSeaSDK;
  private readonly queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  constructor(private readonly configService: ConfigService) {
    // Initialize provider using ethers
    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io');

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
        await task();
        await this.delay(1000); // Delay for 1 second between task executions
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
