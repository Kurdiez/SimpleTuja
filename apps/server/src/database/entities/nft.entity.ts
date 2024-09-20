import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { bigTransformer } from '../utils/big-transformer';
import Big from 'big.js';

@Entity('nft')
export class NftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  contractAddress!: string;

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
