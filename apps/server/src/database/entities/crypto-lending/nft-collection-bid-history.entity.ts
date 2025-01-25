import Big from 'big.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bigTransformer } from '~/database/utils/big-transformer';

@Entity('nft_collection_bid_history')
export class NftCollectionBidHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  nftCollectionId!: string;

  @Index()
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
