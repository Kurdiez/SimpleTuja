import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IgEpicPriceEntity } from '~/database/entities/trading/ig-epic-price.entity';
import { IgEpic, TimeResolution } from '~/trading/utils/const';

@Injectable()
export class PriceDataQueryService {
  constructor(
    @InjectRepository(IgEpicPriceEntity)
    private readonly igPriceRepo: Repository<IgEpicPriceEntity>,
  ) {}

  async getRecentAveragedClosingPrices(
    epic: IgEpic,
    timeFrame: TimeResolution,
    limit: number,
  ): Promise<Big[]> {
    const prices = await this.igPriceRepo.find({
      where: {
        epic,
        timeFrame,
      },
      order: {
        time: 'DESC',
      },
      take: limit,
    });

    return prices.map((price) => {
      const { ask, bid } = price.snapshot.closePrice;
      return ask.plus(bid).div(2);
    });
  }

  async getRecentPrices(
    epic: IgEpic,
    timeFrame: TimeResolution,
    limit: number,
  ) {
    const prices = await this.igPriceRepo.find({
      where: {
        epic,
        timeFrame,
      },
      order: {
        time: 'DESC',
      },
      take: limit,
    });

    return prices;
  }
}
