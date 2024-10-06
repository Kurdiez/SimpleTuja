import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollectionEntity } from './entities/nft-collection.entity';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NftCollectionEntity, UserEntity])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
