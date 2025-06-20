import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user.entity';
import { CryptoLoanOfferEntity } from './crypto-loan-offer.entity';

@Entity('crypto_lending_user_state')
export class CryptoLendingUserStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @OneToOne(() => UserEntity, (user) => user.cryptoLendingUserState, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Index()
  @Column({ type: 'boolean', default: false })
  active!: boolean;

  @Column({ type: 'boolean', default: false })
  hasOpenedCryptoInvestmentAccount!: boolean;

  @Column({ type: 'boolean', default: false })
  hasCompletedLoanSettings!: boolean;

  @Column({ type: 'boolean', default: false })
  hasFundedTheAccount!: boolean;

  @Column({ type: 'boolean', default: false })
  hasAllTokenAllowancesApproved!: boolean;

  @Column({ type: 'text', nullable: false })
  walletAddress: string;

  @Column({ type: 'text', nullable: false })
  walletPrivateKey: string;

  @Column({ type: 'integer', default: null, nullable: true })
  oneWeekLTV!: number;

  @Column({ type: 'integer', default: null, nullable: true })
  twoWeeksLTV!: number;

  @Column({ type: 'integer', default: null, nullable: true })
  oneMonthLTV!: number;

  @Column({ type: 'integer', default: null, nullable: true })
  twoMonthsLTV!: number;

  @Column({ type: 'integer', default: null, nullable: true })
  threeMonthsLTV!: number;

  @Column({ type: 'text', nullable: true })
  foreclosureWalletAddress?: string;

  @OneToMany(() => CryptoLoanOfferEntity, (offer) => offer.userState)
  offers!: CryptoLoanOfferEntity[];
}
