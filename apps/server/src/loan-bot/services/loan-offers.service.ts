import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoanOfferService {
  private readonly logger = new Logger(LoanOfferService.name);

  async makeCollectionLoanOffersForAllCollections() {
    const nftCollections = []; // pre-defined NFT collections to loop through and check
  }
}
