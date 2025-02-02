import { Column, Entity, PrimaryColumn } from 'typeorm';
import { igPriceSnapshotTransformer } from '~/database/utils/ig-price-snapshot-transformer';
import { IgEpic, TimeResolution } from '~/trading/utils/const';
import { IgPriceSnapshot } from '~/trading/utils/types';

@Entity('ig_epic_price')
export class IgEpicPriceEntity {
  @PrimaryColumn('enum', { enum: IgEpic })
  epic!: IgEpic;

  @PrimaryColumn('enum', { enum: TimeResolution })
  timeFrame!: TimeResolution;

  @PrimaryColumn('timestamp')
  time!: Date;

  @Column('jsonb', { transformer: igPriceSnapshotTransformer })
  snapshot!: IgPriceSnapshot;
}
