import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollectionEntity } from './entities/nft-collection.entity';
import { UserEntity } from './entities/user.entity';
import { CryptoLendingUserStateEntity } from './entities/crypto-lending-user-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CryptoLendingUserStateEntity,
      NftCollectionEntity,
      UserEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
