import {
  Column,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CryptoLendingUserStateEntity } from './crypto-lending/crypto-lending-user-state.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'boolean', default: false })
  isEmailConfirmed!: boolean;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  emailConfirmationToken!: string | null;

  @OneToOne(() => CryptoLendingUserStateEntity, (userState) => userState.user)
  cryptoLendingUserState!: CryptoLendingUserStateEntity;
}
