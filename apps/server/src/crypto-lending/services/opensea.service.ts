import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import Big from 'big.js';
import { ListCollectionOffersResponse, OpenSeaSDK } from 'opensea-js';
import { IsNull, Not, Repository } from 'typeorm';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { retry } from '~/commons/error-handlers/retry';
import { CustomException } from '~/commons/errors/custom-exception';
import { ConfigService } from '~/config';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { OpenSeaAPIService } from './opensea-api.service';

@Injectable()
export class OpenSeaService {
  private readonly logger = new Logger(OpenSeaService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    private readonly openSeaApi: OpenSeaAPIService,
    private readonly configService: ConfigService,
  ) {}

  async updateCollectionInfo(): Promise<void> {
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
        collection.imageUrl = collectionInfo.imageUrl;
        updatedCollections.push(collection);
      } else {
        collection.blackListed = true;
        updatedCollections.push(collection);
      }

      this.logger.log(
        `Progress: ${updatedCollections.length}/${collections.length} collections processed`,
      );
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

  async getCollectionOffers(collectionId: string) {
    const nftCollection = await this.nftCollectionRepo.findOneOrFail({
      where: { id: collectionId },
    });

    const slug = nftCollection.openSeaSlug;
    const apiKey = this.configService.get('OPENSEA_API_KEY');

    const response = await axios.get(
      `https://api.opensea.io/api/v2/offers/collection/${slug}`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    const offers = response.data.offers;

    // sort the offers by price in descending order
    // new Big(b.price.value) and compare
    offers.sort((a, b) => {
      const aAmount = new Big(a.price.value);
      const bAmount = new Big(b.price.value);
      return bAmount.minus(aAmount).toNumber();
    });

    return offers;
  }

  async getCollectionStats(collectionId: string) {
    const nftCollection = await this.nftCollectionRepo.findOneOrFail({
      where: { id: collectionId },
    });

    const slug = nftCollection.openSeaSlug;
    const apiKey = this.configService.get('OPENSEA_API_KEY');

    const response = await axios.get(
      `https://api.opensea.io/api/v2/collections/${slug}/stats`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    return response.data;
  }

  async getTopFiveOffers(openSeaSlug: string): Promise<Array<{ price: Big }>> {
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
      try {
        const nftCollectionAddress =
          a['criteria']['contract']['address'].toLowerCase();

        let aOfferAmount: Big;
        try {
          const aPriceValue = a.price?.value || '0';
          aOfferAmount = new Big(aPriceValue);
        } catch {
          aOfferAmount = new Big(0);
        }

        let bOfferAmount: Big;
        try {
          const bPriceValue = b.price?.value || '0';
          bOfferAmount = new Big(bPriceValue);
        } catch {
          bOfferAmount = new Big(0);
        }

        const aConsiderations =
          a['protocol_data']['parameters']['consideration'];
        const aNftConsideration = aConsiderations.find(
          (c) => c.token.toLowerCase() === nftCollectionAddress,
        );
        const aQuantity = new Big(aNftConsideration['endAmount'] || '1');
        const aPricePerNft = aOfferAmount.div(aQuantity);

        const bConsiderations =
          b['protocol_data']['parameters']['consideration'];
        const bNftConsideration = bConsiderations.find(
          (c) => c.token.toLowerCase() === nftCollectionAddress,
        );
        const bQuantity = new Big(bNftConsideration['endAmount'] || '1');
        const bPricePerNft = bOfferAmount.div(bQuantity);

        return bPricePerNft.minus(aPricePerNft).toNumber();
      } catch {
        return 0;
      }
    });

    return sortedOffers.slice(0, 5).map((offer: any) => {
      try {
        const nftCollectionAddress =
          offer['criteria']['contract']['address'].toLowerCase();
        const offerAmount = new Big(offer.price?.value || '0');
        const considerations =
          offer['protocol_data']['parameters']['consideration'];
        const nftConsideration = considerations.find(
          (c) => c.token.toLowerCase() === nftCollectionAddress,
        );
        const quantity = new Big(nftConsideration['endAmount'] || '1');
        const pricePerNft = offerAmount.div(quantity);
        const ethPrice = this.weiToEth(pricePerNft.toString());

        return {
          price: ethPrice,
        };
      } catch {
        return { price: new Big(0) };
      }
    });
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
