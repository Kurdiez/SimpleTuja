import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '~/commons/validations';
import { CoinlayerService } from '~/crypto-lending/services/coinlayer.service';
import { InvestmentWalletService } from '~/crypto-lending/services/investment-wallet.service';
import { LoanService } from '~/crypto-lending/services/loan.service';
import { NftFiApiService } from '~/crypto-lending/services/nftfi-api.service';
import { OpenSeaService } from '~/crypto-lending/services/opensea.service';
import {
  ApproveTokenMaxAllowanceDto,
  approveTokenMaxAllowanceDtoSchema,
  CollectionAddressDto,
  collectionAddressDtoSchema,
  CollectionIdDto,
  collectionIdDtoSchema,
  GetLentLoansDto,
  getLentLoansDtoSchema,
  GetTokenAllowanceDto,
  getTokenAllowanceDtoSchema,
  GetTokenBalanceDto,
  getTokenBalanceDtoSchema,
  UserIdDto,
  userIdDtoSchema,
} from '../schema';

@Controller('admin/nft-loans')
export class NftLoansController {
  constructor(
    private readonly coinlayerService: CoinlayerService,
    private readonly loanService: LoanService,
    private readonly nftFiApiService: NftFiApiService,
    private readonly investmentWalletService: InvestmentWalletService,
    private readonly openSeaService: OpenSeaService,
  ) {}

  @Post('get-active-offers')
  async getActiveOffers(
    @Body(new ZodValidationPipe(userIdDtoSchema))
    { userId }: UserIdDto,
  ) {
    return await this.nftFiApiService.getOffersForUser(userId);
  }

  @Post('get-all-offers-for-collection')
  async getAllOffersForCollection(
    @Body(new ZodValidationPipe(collectionAddressDtoSchema))
    { collectionAddress }: CollectionAddressDto,
  ) {
    return await this.nftFiApiService.getAllOffersForCollection(
      collectionAddress,
    );
  }

  @Post('sync-nft-collections')
  async syncNftCollections() {
    await this.loanService.syncNftCollections();
  }

  @Post('refresh-crypto-exchange-rates')
  async refreshCryptoExchangeRates() {
    await this.coinlayerService.updateCryptoExchangeRates();
  }

  @Post('sync-and-make-loan-offers')
  async syncAndMakeLoanOffers() {
    await this.loanService.syncAndMakeLoanOffers();
  }

  @Post('get-token-balances')
  async getTokenBalances(
    @Body(new ZodValidationPipe(userIdDtoSchema))
    { userId }: UserIdDto,
  ) {
    return await this.investmentWalletService.getTokenBalances(userId);
  }

  @Post('get-token-allowance')
  async getTokenAllowance(
    @Body(new ZodValidationPipe(getTokenAllowanceDtoSchema))
    { userId, token }: GetTokenAllowanceDto,
  ) {
    const allowance = await this.nftFiApiService.getTokenAllowanceForUser(
      userId,
      token,
    );
    return allowance.toString();
  }

  @Post('approve-token-max-allowance')
  async approveTokenMaxAllowance(
    @Body(new ZodValidationPipe(approveTokenMaxAllowanceDtoSchema))
    { userId, token }: ApproveTokenMaxAllowanceDto,
  ) {
    return await this.nftFiApiService.approveTokenMaxAllowanceForUser(
      userId,
      token,
    );
  }

  @Post('get-token-balance')
  async getTokenBalance(
    @Body(new ZodValidationPipe(getTokenBalanceDtoSchema))
    { userId, token }: GetTokenBalanceDto,
  ) {
    return await this.investmentWalletService.getTokenBalance(userId, token);
  }

  @Post('get-opensea-collection-offers')
  async getOpenseaCollectionOffers(
    @Body(new ZodValidationPipe(collectionIdDtoSchema))
    { collectionId }: CollectionIdDto,
  ) {
    return await this.openSeaService.getCollectionOffers(collectionId);
  }

  @Post('get-opensea-collection-stats')
  async getOpenseaCollectionStats(
    @Body(new ZodValidationPipe(collectionIdDtoSchema))
    { collectionId }: CollectionIdDto,
  ) {
    return await this.openSeaService.getCollectionStats(collectionId);
  }

  @Post('get-lent-loans')
  async getLentLoans(
    @Body(new ZodValidationPipe(getLentLoansDtoSchema))
    { userId, status }: GetLentLoansDto,
  ) {
    return await this.nftFiApiService.getLentLoansForUser(userId, status);
  }
}
