import Big from 'big.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IgEpic,
  PositionDirection,
  TradingPositionStatus,
  TradingStrategy,
} from '~/trading/utils/const';
import { bigTransformer } from '../../utils/big-transformer';

@Entity('trading_position')
export class TradingPositionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('enum', {
    enum: TradingPositionStatus,
    default: TradingPositionStatus.PENDING,
  })
  status!: TradingPositionStatus;

  @Index()
  @Column('varchar')
  igPositionOpenDealReference!: string;

  @Index()
  @Column('varchar', { nullable: true })
  igPositionOpenDealId!: string | null;

  @Index()
  @Column('enum', { enum: TradingStrategy })
  strategy!: TradingStrategy;

  @Index()
  @Column('enum', { enum: IgEpic })
  epic!: IgEpic;

  @Index()
  @Column('enum', { enum: PositionDirection })
  direction!: PositionDirection;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
    nullable: true,
  })
  size!: Big | null;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
    nullable: true,
  })
  entryPrice!: Big | null;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
    nullable: true,
  })
  exitPrice!: Big | null;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
    nullable: true,
  })
  stopLossPrice!: Big | null;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    transformer: bigTransformer,
    nullable: true,
  })
  takeProfitPrice!: Big | null;

  @Column('jsonb', { nullable: true })
  metadata!: any | null;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @Column('timestamp', { nullable: true })
  exitedAt!: Date | null;
}
