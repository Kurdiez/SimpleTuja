import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

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
}
