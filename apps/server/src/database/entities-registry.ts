import { CryptoDashboardSnapshotEntity } from './entities/crypto-lending/crypto-dashboard-snapshot.entity';
import { CryptoLendingUserStateEntity } from './entities/crypto-lending/crypto-lending-user-state.entity';
import { CryptoLoanOfferEntity } from './entities/crypto-lending/crypto-loan-offer.entity';
import { CryptoLoanEntity } from './entities/crypto-lending/crypto-loan.entity';
import { NftCollectionBidHistoryEntity } from './entities/crypto-lending/nft-collection-bid-history.entity';
import { NftCollectionEntity } from './entities/crypto-lending/nft-collection.entity';
import { UserEntity } from './entities/user.entity';

export const entitiesToReigster = [
  UserEntity,

  // crypto lending
  CryptoDashboardSnapshotEntity,
  CryptoLoanEntity,
  CryptoLoanOfferEntity,
  CryptoLendingUserStateEntity,
  NftCollectionEntity,
  NftCollectionBidHistoryEntity,
];
