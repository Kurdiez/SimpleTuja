import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { OpenSeaAPIService } from './opensea-api.service';
import { ListCollectionOffersResponse, OpenSeaSDK } from 'opensea-js';
import Big from 'big.js';
import { CustomException } from '~/commons/errors/custom-exception';
import { captureException } from '~/commons/error-handlers/capture-exception';

@Injectable()
export class OpenSeaService {
  private readonly logger = new Logger(OpenSeaService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    private readonly openSeaApi: OpenSeaAPIService,
  ) {}

  async updateBidOffersForAllCollections(): Promise<void> {
    this.logger.log('Updating bid offers for all collections');
    await this.nftCollectionRepo.update({}, { enabled: false });
    this.logger.log('Disabled all collections');

    const collections = await this.nftCollectionRepo.find({
      where: {
        blackListed: false,
        openSeaSlug: Not(IsNull()),
      },
      order: { loanCount: 'DESC' },
      take: 100,
    });
    this.logger.log(`Found ${collections.length} collections to update`);

    const updatePromises = collections.map((collection) =>
      this.processCollection(collection),
    );

    const results = await Promise.allSettled(updatePromises);

    const updatedCollections = results
      .filter(
        (result): result is PromiseFulfilledResult<NftCollectionEntity> =>
          result.status === 'fulfilled' && result.value != null,
      )
      .map((result) => result.value);
    this.logger.log(`Found ${updatedCollections.length} updated collections`);

    if (updatedCollections.length > 0) {
      await this.nftCollectionRepo.save(updatedCollections);
      this.logger.log(`Updated ${updatedCollections.length} collections`);
    }
    this.logger.log('Updated bid offers for all collections');
  }

  private async processCollection(
    collection: NftCollectionEntity,
  ): Promise<NftCollectionEntity | null> {
    try {
      const offers = await this.getTopFiveOffers(collection.openSeaSlug!);

      if (offers.length < 5) {
        return null;
      }

      const avgPrice = this.calculateAveragePrice(offers);
      const bestBid = offers[0].price;

      collection.bestBid = bestBid;
      collection.avgTopFiveBids = avgPrice;
      collection.enabled = true;

      return collection;
    } catch (error) {
      const customException = new CustomException(
        'Failed to update collection',
        {
          error,
          collectionId: collection.id,
        },
      );
      captureException({ error: customException });
      return null;
    }
  }

  private async getTopFiveOffers(
    openSeaSlug: string,
  ): Promise<Array<{ price: Big }>> {
    const response = await this.openSeaApi.run(async (sdk: OpenSeaSDK) => {
      const offers = await sdk.api.getCollectionOffers(openSeaSlug);
      return offers;
    });

    return this.extractTopFiveOffers(response);
  }

  private extractTopFiveOffers(
    response: ListCollectionOffersResponse,
  ): Array<{ price: Big }> {
    const offers = response.offers;

    const sortedOffers = offers.sort((a: any, b: any) => {
      const aAmount = BigInt(a.price.value);
      const bAmount = BigInt(b.price.value);
      return bAmount > aAmount ? 1 : bAmount < aAmount ? -1 : 0;
    });

    return sortedOffers.slice(0, 5).map((offer: any) => ({
      price: this.weiToEth(offer.price.value),
    }));
  }

  private weiToEth(weiValue: string): Big {
    const wei = new Big(weiValue);
    return wei.div(new Big(10).pow(18));
  }

  private calculateAveragePrice(offers: Array<{ price: Big }>): Big {
    const sum = offers.reduce(
      (acc, offer) => acc.plus(offer.price),
      new Big(0),
    );
    return sum.div(offers.length);
  }
}
