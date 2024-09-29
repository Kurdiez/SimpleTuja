import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { bigTransformer } from '../utils/big-transformer';
import Big from 'big.js';

@Entity('nft_collection')
export class NftCollectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  contractAddress!: string | null;

  @Column({ type: 'varchar', nullable: true })
  openSeaSlug!: string | null;

  @Column({ default: true, type: 'boolean' })
  enabled!: boolean;

  @Column({ default: false, type: 'boolean' })
  blackListed!: boolean;

  @Column({ default: 0, type: 'integer' })
  loanCount!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 10,
    nullable: true,
    transformer: bigTransformer,
    default: 0,
  })
  bestBid!: Big;
}
