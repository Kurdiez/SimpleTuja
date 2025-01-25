import { CryptoToken } from '@simpletuja/shared';
import Big from 'big.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigTransformer } from '../../utils/big-transformer';
import { CryptoLendingUserStateEntity } from './crypto-lending-user-state.entity';
import { NftCollectionEntity } from './nft-collection.entity';

@Entity('crypto_loan_offer')
@Index(['userStateId', 'isActive'])
export class CryptoLoanOfferEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  nftfiOfferId!: string;

  @Column({ type: 'timestamp' })
  dateOffered!: Date;

  @Column({ type: 'uuid' })
  nftCollectionId!: string;

  @ManyToOne(() => NftCollectionEntity)
  @JoinColumn({ name: 'nftCollectionId' })
  nftCollection!: NftCollectionEntity;

  @Column({ type: 'uuid' })
  userStateId!: string;

  @ManyToOne(() => CryptoLendingUserStateEntity)
  @JoinColumn({ name: 'userStateId' })
  userState!: CryptoLendingUserStateEntity;

  @Column({
    type: 'enum',
    enum: CryptoToken,
  })
  loanCurrency!: CryptoToken;

  @Index()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 0,
    transformer: bigTransformer,
  })
  loanDuration!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  loanRepayment!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  loanPrincipal!: Big;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 15,
    transformer: bigTransformer,
  })
  loanApr!: Big;

  @Column({ type: 'timestamp' })
  loanExpiry!: Date;

  @Column({ type: 'boolean' })
  loanInterestProrated!: boolean;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  loanOrigination!: Big;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 15,
    transformer: bigTransformer,
  })
  loanEffectiveApr!: Big;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
