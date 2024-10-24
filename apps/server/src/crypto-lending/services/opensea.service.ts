import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { OpenSeaAPIService } from './opensea-api.service';
import { ListCollectionOffersResponse, OpenSeaSDK } from 'opensea-js';
import Big from 'big.js';
import { CustomException } from '~/commons/errors/custom-exception';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { retry } from '~/commons/error-handlers/retry';

@Injectable()
export class OpenSeaService {
  private readonly logger = new Logger(OpenSeaService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    private readonly openSeaApi: OpenSeaAPIService,
  ) {}

  async updateCollectionContractAddresses(): Promise<void> {
    this.logger.log('Updating contract address for all collections');

    // Set all collections without an openSeaSlug to blacklisted
    await this.nftCollectionRepo
      .createQueryBuilder()
      .update(NftCollectionEntity)
      .set({ blackListed: true })
      .where('openSeaSlug IS NULL')
      .execute();

    this.logger.log(
      'Set all collections without an openSeaSlug to blacklisted',
    );

    const collections = await this.nftCollectionRepo.find({
      where: {
        openSeaSlug: Not(IsNull()),
        contractAddress: IsNull(),
        blackListed: IsNull(),
      },
      order: { loanCount: 'DESC' },
    });
    this.logger.log(`Found ${collections.length} collections to update`);

    const updatedCollections: NftCollectionEntity[] = [];
    const updatePromises = collections.map(async (collection) => {
      const collectionInfo = await this.getCollectionInfo(
        collection.openSeaSlug!,
      );

      if (collectionInfo.contracts.length === 1) {
        collection.blackListed = false;
        collection.contractAddress = collectionInfo.contracts[0].address;
        updatedCollections.push(collection);
      } else {
        collection.blackListed = true;
        updatedCollections.push(collection);
      }
    });

    await Promise.all(updatePromises);

    if (updatedCollections.length > 0) {
      await this.nftCollectionRepo.save(updatedCollections);
    }
    this.logger.log('Updated contract address for all collections');
  }

  private async getCollectionInfo(openSeaSlug: string) {
    return await this.openSeaApi.run(async (sdk: OpenSeaSDK) => {
      const collection = await sdk.api.getCollection(openSeaSlug);
      return collection;
    });
  }

  async updateCollectionBidOffers(
    collection: NftCollectionEntity,
  ): Promise<boolean> {
    try {
      const offers = await this.getTopFiveOffers(collection.openSeaSlug!);

      if (offers.length < 5) {
        return false;
      }

      const avgPrice = this.calculateAveragePrice(offers);
      const bestBid = offers[0].price;

      collection.bestBid = bestBid;
      collection.avgTopFiveBids = avgPrice;

      return true;
    } catch (error) {
      const customException = new CustomException(
        'Failed to update collection',
        {
          error,
          collectionId: collection.id,
        },
      );
      throw customException;
    }
  }

  private async getTopFiveOffers(
    openSeaSlug: string,
  ): Promise<Array<{ price: Big }>> {
    try {
      const response = await retry(
        () =>
          this.openSeaApi.run(async (sdk: OpenSeaSDK) => {
            return await sdk.api.getCollectionOffers(openSeaSlug);
          }),
        this.logger,
      );

      return this.extractTopFiveOffers(response);
    } catch (error) {
      const exception = new CustomException(
        'Failed to get collection offers after multiple retries',
        {
          error,
          openSeaSlug,
        },
      );
      captureException({ error: exception });
      return [];
    }
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
