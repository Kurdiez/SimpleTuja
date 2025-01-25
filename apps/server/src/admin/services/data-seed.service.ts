import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenSeaAPIService } from '~/crypto-lending/services/opensea-api.service';
import { NftCollectionEntity } from '~/database/entities/crypto-lending/nft-collection.entity';
import { NftCollectionInfo } from '../utils/nftfi-loan-info-file-parser';

@Injectable()
export class DataSeedService {
  private readonly logger = new Logger(DataSeedService.name);

  constructor(
    private readonly openSeaApi: OpenSeaAPIService,
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
  ) {}

  async seedNftCollections(nftCollections: NftCollectionInfo[]): Promise<void> {
    this.logger.log('Initializing NFT collection definitions');

    await this.nftCollectionRepo.update({}, { enabled: false });
    this.logger.log('All NFT collections have been set to disabled');

    const nftEntities = Array.from(
      new Map(
        nftCollections.map((nft) => [
          nft.collection,
          {
            name: nft.collection,
            loanCount: nft.loanCount,
          } as NftCollectionEntity,
        ]),
      ).values(),
    );

    this.logger.log('Saving NFT collections to database');
    await this.nftCollectionRepo
      .createQueryBuilder()
      .insert()
      .into(NftCollectionEntity)
      .values(nftEntities)
      .orUpdate(['loanCount'], ['name'])
      .execute();

    this.logger.log('NFT collections have been initialized');
  }

  async getNftCollectionContractAddress(name: string): Promise<string | null> {
    try {
      const result = await this.openSeaApi.run(async (sdk) => {
        const response = await sdk.api.getCollections();
        const assets = response.collections;

        if (assets.length > 0) {
          const asset = assets[0];
          const assetName = asset.name.toLowerCase();

          if (assetName.includes(name.toLowerCase())) {
            return asset.contracts[0].address;
          }
        }
        return null;
      });
      return result;
    } catch (error) {
      this.logger.error(error);
    }

    return null;
  }
}
