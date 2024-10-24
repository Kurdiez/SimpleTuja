import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '~/config';
import NFTfi from '@nftfi/js';
import { NftFiLoanOffer } from '../types/nftfi-types';

@Injectable()
export class NftFiApiService {
  private readonly logger = new Logger(NftFiApiService.name);

  constructor(private readonly configService: ConfigService) {}

  async getOffersForWallet(
    walletPrivateKey: string,
  ): Promise<NftFiLoanOffer[]> {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);
    const offers = await nftfiClient.offers.get();
    return offers as NftFiLoanOffer[];
  }

  async getAllOffersForCollection(collectionAddress: string) {
    const nftfiClient = await this.getNftFiClient();
    const offers = await nftfiClient.offers.get({
      filters: {
        nft: {
          address: collectionAddress,
        },
      },
    });
    return offers as NftFiLoanOffer[];
  }

  private async getNftFiClient(walletPrivateKey?: string) {
    const nftfiApiKey = this.configService.get('NFTFI_API_KEY');
    const providerUrl = this.configService.get('PROVIDER_URL');
    return await NFTfi.init({
      config: {
        api: { key: nftfiApiKey },
      },
      ethereum: {
        account: { privateKey: walletPrivateKey },
        provider: { url: providerUrl },
      },
    });
  }
}
