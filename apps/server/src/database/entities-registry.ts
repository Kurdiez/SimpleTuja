import { CryptoDashboardSnapshotEntity } from './entities/crypto-lending/crypto-dashboard-snapshot.entity';
import { CryptoLendingUserStateEntity } from './entities/crypto-lending/crypto-lending-user-state.entity';
import { CryptoLoanOfferEntity } from './entities/crypto-lending/crypto-loan-offer.entity';
import { CryptoLoanEntity } from './entities/crypto-lending/crypto-loan.entity';
import { NftCollectionBidHistoryEntity } from './entities/crypto-lending/nft-collection-bid-history.entity';
import { NftCollectionEntity } from './entities/crypto-lending/nft-collection.entity';
import { IgEpicPriceEntity } from './entities/trading/ig-epic-price.entity';
import { TradingPerformanceReportEntity } from './entities/trading/trading-performance-report.entity';
import { TradingPositionEntity } from './entities/trading/trading-position.entity';
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

  // trading
  IgEpicPriceEntity,
  TradingPositionEntity,
  TradingPerformanceReportEntity,
];
