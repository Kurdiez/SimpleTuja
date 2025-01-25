import Big from 'big.js';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bigTransformer } from '../../utils/big-transformer';
import { CryptoLoanOfferEntity } from './crypto-loan-offer.entity';

@Entity('nft_collection')
export class NftCollectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  contractAddress!: string | null;

  @Column({ type: 'varchar', nullable: true })
  openSeaSlug!: string | null;

  @Column({ default: false, type: 'boolean' })
  enabled!: boolean;

  @Column({ default: null, type: 'boolean', nullable: true })
  blackListed!: boolean | null;

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

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 10,
    nullable: true,
    transformer: bigTransformer,
    default: 0,
  })
  avgTopFiveBids!: Big;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 15,
    transformer: bigTransformer,
    nullable: true,
  })
  averageApr: Big;

  @OneToMany(() => CryptoLoanOfferEntity, (offer) => offer.nftCollection)
  offers!: CryptoLoanOfferEntity[];
}
