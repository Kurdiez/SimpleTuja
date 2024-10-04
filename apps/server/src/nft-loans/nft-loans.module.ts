import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollectionEntity } from '~/database/entities/nft-collection.entity';
import { OpenSeaService } from './services/opensea.service';
import { OpenSeaAPIService } from './services/opensea-api.service';
import { ScheduledTasksService } from './services/scheduled-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([NftCollectionEntity])],
  providers: [OpenSeaService, OpenSeaAPIService, ScheduledTasksService],
  exports: [OpenSeaService, OpenSeaAPIService],
})
export class NftLoansModule {}
