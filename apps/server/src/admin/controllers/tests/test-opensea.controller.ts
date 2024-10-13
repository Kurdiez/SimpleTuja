import { Controller, Get } from '@nestjs/common';
import { OpenSeaSDK } from 'opensea-js';
import { OpenSeaAPIService } from '~/crypto-lending/services/opensea-api.service';
import Big from 'big.js';

@Controller('admin/test-opensea')
export class TestOpenSeaController {
  constructor(private readonly openSeaApi: OpenSeaAPIService) {}

  @Get()
  async getCollectionOffers(): Promise<void> {
    try {
      const result = await this.openSeaApi.run(async (sdk: OpenSeaSDK) => {
        const offers = await sdk.api.getCollectionOffers('pudgypenguins');
        return offers;
      });

      const top10Offers = this.getTop5Offers(result);

      console.log(
        'Top 10 Offers for Pudgy Penguins collection:',
        JSON.stringify(top10Offers, null, 2),
      );
    } catch (error) {
      console.error('Error fetching collection offers:', error);
    }
  }

  private getTop5Offers(data: any): any[] {
    const offers = data.offers;

    const sortedOffers = offers.sort((a: any, b: any) => {
      const aAmount = BigInt(a.price.value);
      const bAmount = BigInt(b.price.value);
      return bAmount > aAmount ? 1 : bAmount < aAmount ? -1 : 0;
    });

    return sortedOffers.slice(0, 5).map((offer: any) => ({
      order_hash: offer.order_hash,
      price: this.weiToEth(offer.price.value),
      offerer: offer.protocol_data.parameters.offerer,
    }));
  }

  private weiToEth(weiValue: string): string {
    const wei = new Big(weiValue);
    const eth = wei.div(new Big(10).pow(18));
    return eth.toFixed(6); // Display 6 decimal places
  }
}
