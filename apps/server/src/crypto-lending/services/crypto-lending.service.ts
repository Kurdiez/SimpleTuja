import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { LoanEligibleNftCollectionsDto } from '@simpletuja/shared';
import { ConfigService } from '~/config';

@Injectable()
export class CryptoLendingService {
  private readonly logger = new Logger(CryptoLendingService.name);

  constructor(
    @InjectRepository(NftCollectionEntity)
    private readonly nftCollectionRepo: Repository<NftCollectionEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getLoanEligibleNftCollections(): Promise<LoanEligibleNftCollectionsDto> {
    this.logger.log('Fetching loan eligible NFT collections');

    const eligibleCollections = await this.nftCollectionRepo.find({
      where: { enabled: true },
    });

    return eligibleCollections.map((collection) => ({
      ...collection,
      avgTopBids: collection.avgTopFiveBids.toNumber(),
    }));
  }
}
