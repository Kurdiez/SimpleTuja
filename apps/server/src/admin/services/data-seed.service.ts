import { Injectable, Logger } from '@nestjs/common';
import { NftCollectionInfo } from '../utils/nftfi-loan-info-file-parser';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Big from 'big.js';
import { OpenSeaAPIService } from '~/nft-loans/services/opensea-api.service';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';

@Injectable()
export class DataSeedService {
  private readonly logger = new Logger(DataSeedService.name);

  constructor(
    private readonly openSeaApi: OpenSeaAPIService,
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
  ) {}

  async initNftCollections(nftCollections: NftCollectionInfo[]) {
    this.logger.log('Initializing NFT collection definitions');

    // Disable all existing NFT collections
    await this.nftCollectionRepo.update({}, { enabled: false });
    this.logger.log('All NFT collections have been set to disabled');

    // Prepare NFT entities for upsert and remove duplicates
    const nftEntities = Array.from(
      new Map(
        nftCollections.map((nft) => [
          nft.collection,
          {
            name: nft.collection,
            loanCount: nft.loanCount,
            bestBid: new Big(0),
            enabled: true,
            contractAddress: null, // Initialize contractAddress
          } as NftCollectionEntity,
        ]),
      ).values(),
    );

    // Fetch contract addresses for each NFT collection
    for (const nftEntity of nftEntities) {
      const contractAddress = await this.getNftCollectionContractAddress(
        nftEntity.name,
      );
      if (contractAddress) {
        nftEntity.contractAddress = contractAddress; // Assign the fetched address
      }
    }

    // Perform upsert in one batch
    await this.nftCollectionRepo
      .createQueryBuilder()
      .insert()
      .into(NftCollectionEntity)
      .values(nftEntities)
      .orUpdate(
        ['enabled', 'loanCount', 'bestBid', 'contractAddress'],
        ['name'],
      )
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
            return asset.contracts[0].address; // Return the contract address
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
