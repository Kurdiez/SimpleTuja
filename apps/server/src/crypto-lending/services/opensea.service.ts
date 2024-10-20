import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { OpenSeaAPIService } from './opensea-api.service';
import { ListCollectionOffersResponse, OpenSeaSDK } from 'opensea-js';
import Big from 'big.js';
import { CustomException } from '~/commons/errors/custom-exception';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { ConfigService } from '~/config';

@Injectable()
export class OpenSeaService {
  private readonly logger = new Logger(OpenSeaService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    private readonly openSeaApi: OpenSeaAPIService,
    private readonly configService: ConfigService,
  ) {}

  async updateBidOffersForAllCollections(): Promise<void> {
    const numLendingEligibleCollections = this.configService.get(
      'NUM_LENDING_ELIGIBLE_NFT_COLLECTIONS',
    );
    const numCollectionsToUpdate = numLendingEligibleCollections * 3;

    this.logger.log('Updating bid offers for all collections');

    const collections = await this.nftCollectionRepo.find({
      where: {
        blackListed: false,
      },
      order: {
        loanCount: 'DESC',
        name: 'ASC',
      },
      take: numCollectionsToUpdate,
    });
    this.logger.log(`Found ${collections.length} collections to update`);

    const updatePromises = collections.map((collection) =>
      this.updateCollectionBidOffers(collection),
    );

    const results = await Promise.allSettled(updatePromises);

    const updatedCollections = results
      .filter(
        (result): result is PromiseFulfilledResult<NftCollectionEntity> =>
          result.status === 'fulfilled' && result.value != null,
      )
      .map((result) => result.value);

    if (updatedCollections.length > 0) {
      await this.nftCollectionRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const eligibleCollections = updatedCollections.slice(
            0,
            numLendingEligibleCollections,
          );

          // Set eligible collections to enabled
          eligibleCollections.forEach(
            (collection) => (collection.enabled = true),
          );

          // Set all other collections to disabled
          await transactionalEntityManager.update(
            NftCollectionEntity,
            { id: Not(In(eligibleCollections.map((c) => c.id))) },
            { enabled: false },
          );

          // Save the updated collections
          await transactionalEntityManager.save(
            NftCollectionEntity,
            eligibleCollections,
          );

          this.logger.log(
            `Updated ${updatedCollections.length} collections with new bid offers. Enabled ${eligibleCollections.length} collections.`,
          );
        },
      );
    }
    this.logger.log('Updated bid offers for all collections');
  }

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

  private async updateCollectionBidOffers(
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
      try {
        const offers = await sdk.api.getCollectionOffers(openSeaSlug);
        return offers;
      } catch (error) {
        const exception = new CustomException(
          'Failed to get collection offers',
          {
            error,
            openSeaSlug,
          },
        );
        captureException({ error: exception });
        return {
          offers: [],
        };
      }
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
