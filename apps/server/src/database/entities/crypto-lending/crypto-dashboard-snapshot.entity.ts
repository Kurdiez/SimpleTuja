import Big from 'big.js';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bigTransformer } from '../../utils/big-transformer';
import { CryptoLendingUserStateEntity } from './crypto-lending-user-state.entity';

@Entity('crypto_dashboard_snapshot')
export class CryptoDashboardSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userStateId!: string;

  @OneToOne(() => CryptoLendingUserStateEntity)
  @JoinColumn({ name: 'userStateId' })
  userState!: CryptoLendingUserStateEntity;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  ethBalance!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  wethBalance!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  daiBalance!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  usdcBalance!: Big;

  @Column({ type: 'integer' })
  activeOffers!: number;

  @Column({ type: 'integer' })
  activeLoans!: number;

  @Column({ type: 'integer' })
  repaidLoans!: number;

  @Column({ type: 'integer' })
  liquidatedLoans!: number;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  wethActiveLoansPrincipal!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  daiActiveLoansPrincipal!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  usdcActiveLoansPrincipal!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  wethActiveLoansRepayment!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  daiActiveLoansRepayment!: Big;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
  })
  usdcActiveLoansRepayment!: Big;
}
