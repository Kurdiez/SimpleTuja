import { Body, Controller, Post } from '@nestjs/common';
import {
  GetLoanOffersRequest,
  getLoanOffersRequestSchema,
  GetLoanOffersResponse,
  getLoanOffersResponseSchema,
  GetLoansRequest,
  getLoansRequestSchema,
  GetLoansResponse,
  getLoansResponseSchema,
  NftFiLoanStatus,
  PaginatedReq,
  WithdrawTokenStatus,
} from '@simpletuja/shared';
import { z } from 'zod';
import { zodResTransform, ZodValidationPipe } from '~/commons/validations';
import { CoinlayerService } from '~/crypto-lending/services/coinlayer.service';
import { CryptoLendingService } from '~/crypto-lending/services/crypto-lending.service';
import { InvestmentWalletService } from '~/crypto-lending/services/investment-wallet.service';
import { LoanService } from '~/crypto-lending/services/loan.service';
import { NftFiApiService } from '~/crypto-lending/services/nftfi-api.service';
import { OpenSeaService } from '~/crypto-lending/services/opensea.service';
import { NftFiApiLoanStatus } from '~/crypto-lending/types/nftfi-types';
import { CryptoLoanOfferEntity } from '~/database/entities/crypto-loan-offer.entity';
import { CryptoLoanEntity } from '~/database/entities/crypto-loan.entity';
import {
  AdminWithdrawTokenDto,
  adminWithdrawTokenDtoSchema,
  AdminWithdrawTokenResponseDto,
  ApproveTokenMaxAllowanceDto,
  approveTokenMaxAllowanceDtoSchema,
  CollectionAddressDto,
  collectionAddressDtoSchema,
  CollectionIdDto,
  collectionIdDtoSchema,
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
    private readonly cryptoLendingService: CryptoLendingService,
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
    @Body(
      new ZodValidationPipe(
        z.object({
          userId: z.string().uuid(),
          status: z.nativeEnum(NftFiApiLoanStatus),
        }),
      ),
    )
    { userId, status }: { userId: string; status: NftFiApiLoanStatus },
  ) {
    return await this.nftFiApiService.getLentLoansForUser(userId, status);
  }

  @Post('withdraw-token')
  async withdrawToken(
    @Body(new ZodValidationPipe(adminWithdrawTokenDtoSchema))
    { userId, token, amount, destinationAddress }: AdminWithdrawTokenDto,
  ): Promise<AdminWithdrawTokenResponseDto> {
    const result = await this.investmentWalletService.withdrawToken(
      userId,
      token,
      amount,
      destinationAddress,
    );

    return {
      status: result === true ? WithdrawTokenStatus.Success : result,
    };
  }

  @Post('get-loan-offers')
  async getLoanOffers(
    @Body(
      new ZodValidationPipe(
        getLoanOffersRequestSchema.extend({
          userId: z.string().uuid(),
        }),
      ),
    )
    params: GetLoanOffersRequest & { userId: string },
  ): Promise<GetLoanOffersResponse> {
    const offers = await this.cryptoLendingService.getLoanOffers(
      params.userId,
      params as unknown as PaginatedReq<
        CryptoLoanOfferEntity,
        { isActive?: boolean; userId: string }
      >,
    );

    const transformedOffers = {
      ...offers,
      items: offers.items.map((offer) => ({
        ...offer,
        loanDuration: offer.loanDuration.toString(),
        loanRepayment: offer.loanRepayment.toString(),
        loanPrincipal: offer.loanPrincipal.toString(),
        loanApr: offer.loanApr.toString(),
        loanOrigination: offer.loanOrigination.toString(),
        loanEffectiveApr: offer.loanEffectiveApr.toString(),
      })),
    };

    return zodResTransform(transformedOffers, getLoanOffersResponseSchema);
  }

  @Post('get-loans')
  async getLoans(
    @Body(
      new ZodValidationPipe(
        getLoansRequestSchema.extend({
          userId: z.string().uuid(),
        }),
      ),
    )
    params: GetLoansRequest & { userId: string },
  ): Promise<GetLoansResponse> {
    const loans = await this.cryptoLendingService.getLoans(
      params.userId,
      params as unknown as PaginatedReq<
        CryptoLoanEntity,
        { status?: NftFiLoanStatus; userId: string }
      >,
    );

    const transformedLoans = {
      ...loans,
      items: loans.items.map((loan) => ({
        ...loan,
        loanDuration: loan.loanDuration,
        loanRepayment: loan.loanRepayment.toString(),
        loanPrincipal: loan.loanPrincipal.toString(),
        loanApr: loan.loanApr.toString(),
      })),
    };

    return zodResTransform(transformedLoans, getLoansResponseSchema);
  }
}
