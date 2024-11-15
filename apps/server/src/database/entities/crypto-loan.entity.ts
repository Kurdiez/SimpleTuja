import { CryptoToken, NftFiLoanStatus } from '@simpletuja/shared';
import Big from 'big.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { bigTransformer } from '../utils/big-transformer';
import { CryptoLendingUserStateEntity } from './crypto-lending-user-state.entity';
import { NftCollectionEntity } from './nft-collection.entity';

@Entity('crypto_loan')
@Index(['userStateId', 'status', 'startedAt'])
@Index(['userStateId', 'status', 'dueAt'])
@Unique(['userStateId', 'nftfiLoanId'])
export class CryptoLoanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userStateId!: string;

  @ManyToOne(() => CryptoLendingUserStateEntity)
  @JoinColumn({ name: 'userStateId' })
  userState!: CryptoLendingUserStateEntity;

  @Column({ type: 'text' })
  nftfiLoanId!: string;

  @Column({ type: 'text', enum: NftFiLoanStatus })
  status!: NftFiLoanStatus;

  @Column({ type: 'timestamp' })
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  repaidAt!: Date | null;

  @Column({ type: 'timestamp' })
  dueAt!: Date;

  @Column({ type: 'uuid' })
  nftCollectionId!: string;

  @ManyToOne(() => NftCollectionEntity)
  @JoinColumn({ name: 'nftCollectionId' })
  nftCollection!: NftCollectionEntity;

  @Column({ type: 'text' })
  nftTokenId!: string;

  @Column({ type: 'text' })
  nftImageUrl!: string;

  @Column({ type: 'text' })
  borrowerWalletAddress!: string;

  @Column({
    type: 'integer',
  })
  loanDuration!: number;

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
    precision: 36,
    scale: 15,
    transformer: bigTransformer,
  })
  loanApr!: Big;

  @Column({ type: 'text', enum: CryptoToken })
  token!: CryptoToken;

  @Column({ type: 'text' })
  nftfiContractName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
