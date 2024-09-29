import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollectionEntity } from './entities/nft.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NftCollectionEntity])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
