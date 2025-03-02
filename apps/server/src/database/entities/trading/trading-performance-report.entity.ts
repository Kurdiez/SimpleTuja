import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { IgEpic } from '~/trading/utils/const';

@Entity('trading_performance_report')
export class TradingPerformanceReportEntity {
  @PrimaryColumn('enum', { enum: IgEpic })
  epic!: IgEpic;

  @Column('text')
  report!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
