import { CryptoDashboardSnapshotEntity } from './entities/crypto-dashboard-snapshot.entity';
import { CryptoLendingUserStateEntity } from './entities/crypto-lending-user-state.entity';
import { CryptoLoanOfferEntity } from './entities/crypto-loan-offer.entity';
import { CryptoLoanEntity } from './entities/crypto-loan.entity';
import { NftCollectionEntity } from './entities/nft-collection.entity';
import { UserEntity } from './entities/user.entity';

export const entitiesToReigster = [
  CryptoDashboardSnapshotEntity,
  CryptoLoanEntity,
  CryptoLoanOfferEntity,
  CryptoLendingUserStateEntity,
  NftCollectionEntity,
  UserEntity,
];
