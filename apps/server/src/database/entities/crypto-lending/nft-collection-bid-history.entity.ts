import Big from 'big.js';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { bigTransformer } from '~/database/utils/big-transformer';

@Entity('nft_collection_bid_history')
export class NftCollectionBidHistoryEntity {
  @PrimaryColumn('uuid')
  nftCollectionId!: string;

  @PrimaryColumn()
  @CreateDateColumn()
  createdAt!: Date;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 10,
    nullable: true,
    transformer: bigTransformer,
    default: 0,
  })
  avgTopFiveBids!: Big;
}
