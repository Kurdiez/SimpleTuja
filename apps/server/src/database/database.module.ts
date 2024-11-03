import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollectionEntity } from './entities/nft-collection.entity';
import { UserEntity } from './entities/user.entity';
import { CryptoLendingUserStateEntity } from './entities/crypto-lending-user-state.entity';
import { CryptoLoanOfferEntity } from './entities/crypto-loan-offer.entity';
import { CryptoLoanEntity } from './entities/crypto-loan.entity';
import { CryptoDashboardSnapshotEntity } from './entities/crypto-dashboard-snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CryptoDashboardSnapshotEntity,
      CryptoLoanEntity,
      CryptoLoanOfferEntity,
      CryptoLendingUserStateEntity,
      NftCollectionEntity,
      UserEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
