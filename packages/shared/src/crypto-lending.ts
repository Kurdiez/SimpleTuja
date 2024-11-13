import { z } from "zod";
import {
  createPaginatedRequestSchema,
  createPaginatedResponseSchema,
} from "./commons";
import { CryptoToken } from "./const";

// Base schema for LTV fields
const LTVSchema = z.number().int().gte(10).lte(100).nullable();

// Base schema for all LTV fields
const LTVFieldsSchema = z.object({
  oneWeekLTV: LTVSchema,
  twoWeeksLTV: LTVSchema,
  oneMonthLTV: LTVSchema,
  twoMonthsLTV: LTVSchema,
  threeMonthsLTV: LTVSchema,
});

const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .nullable();

export const cryptoLendingUserStateDtoSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    hasOpenedCryptoInvestmentAccount: z.boolean(),
    hasCompletedLoanSettings: z.boolean(),
    hasFundedTheAccount: z.boolean(),
    hasAllTokenAllowancesApproved: z.boolean(),
    ...LTVFieldsSchema.shape,
    foreclosureWalletAddress: walletAddressSchema,
    walletAddress: walletAddressSchema,
    active: z.boolean(),
  })
  .nullable();
export type CryptoLendingUserStateDto = z.infer<
  typeof cryptoLendingUserStateDtoSchema
>;

export const loanSettingsUpdateRequestSchema = LTVFieldsSchema.extend({
  foreclosureWalletAddress: walletAddressSchema,
});
export type LoanSettingsUpdateDto = z.infer<
  typeof loanSettingsUpdateRequestSchema
>;

export const loanEligibleNftCollectionsDtoSchema = z.array(
  z.object({
    name: z.string().min(1),
    loanCount: z.number().int(),
    openSeaSlug: z.string().min(1),
    avgTopBids: z.number(),
  })
);
export type LoanEligibleNftCollectionsDto = z.infer<
  typeof loanEligibleNftCollectionsDtoSchema
>;

export const cryptoExchangeRatesDtoSchema = z.object({
  [CryptoToken.WETH]: z.number(),
  [CryptoToken.DAI]: z.number(),
  [CryptoToken.USDC]: z.number(),
});
export type CryptoExchangeRatesDto = z.infer<
  typeof cryptoExchangeRatesDtoSchema
>;

export const updateActiveStatusDtoSchema = z.object({
  active: z.boolean(),
});
export type UpdateActiveStatusDto = z.infer<typeof updateActiveStatusDtoSchema>;

export const getTokenBalanceDtoSchema = z.object({
  token: z.nativeEnum(CryptoToken),
});
export type GetTokenBalanceDto = z.infer<typeof getTokenBalanceDtoSchema>;

export const cryptoLendingDashboardDataDtoSchema = z
  .object({
    walletAddress: z.string(),
    ethBalance: z.string(), // Big numbers are serialized as strings
    wethBalance: z.string(),
    daiBalance: z.string(),
    usdcBalance: z.string(),
    activeOffers: z.number(),
    activeLoans: z.number(),
    repaidLoans: z.number(),
    liquidatedLoans: z.number(),
    wethActiveLoansPrincipal: z.string(),
    daiActiveLoansPrincipal: z.string(),
    usdcActiveLoansPrincipal: z.string(),
    wethActiveLoansRepayment: z.string(),
    daiActiveLoansRepayment: z.string(),
    usdcActiveLoansRepayment: z.string(),
  })
  .nullable();

export type CryptoLendingDashboardDataDto = z.infer<
  typeof cryptoLendingDashboardDataDtoSchema
>;

export const withdrawTokenRequestDtoSchema = z.object({
  token: z.nativeEnum(CryptoToken),
  amount: z.string(), // Amount in decimal string format (e.g., "1.5")
  destinationAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), // Ethereum address format
});
export type WithdrawTokenRequestDto = z.infer<
  typeof withdrawTokenRequestDtoSchema
>;

export enum WithdrawTokenStatus {
  Success = "Success",
  InsufficientTokenBalance = "InsufficientTokenBalance",
  InsufficientEthForGasFee = "InsufficientEthForGasFee",
}

export const withdrawTokenResponseDtoSchema = z.object({
  status: z.nativeEnum(WithdrawTokenStatus),
});
export type WithdrawTokenResponseDto = z.infer<
  typeof withdrawTokenResponseDtoSchema
>;

export const cryptoLoanOfferSchema = z.object({
  id: z.string().uuid(),
  nftfiOfferId: z.string().uuid(),
  dateOffered: z.date(),
  loanCurrency: z.nativeEnum(CryptoToken),
  loanDuration: z.string(),
  loanRepayment: z.string(),
  loanPrincipal: z.string(),
  loanApr: z.string(),
  loanExpiry: z.date(),
  loanInterestProrated: z.boolean(),
  loanOrigination: z.string(),
  loanEffectiveApr: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  nftCollection: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});

// Keep the shared types entity-agnostic
const getLoanOffersSpecificSchema = z.object({
  isActive: z.boolean().optional(),
});

export const getLoanOffersRequestSchema = createPaginatedRequestSchema(
  getLoanOffersSpecificSchema
);

export type GetLoanOffersRequest = z.infer<typeof getLoanOffersRequestSchema>;

export const getLoanOffersResponseSchema = createPaginatedResponseSchema(
  cryptoLoanOfferSchema
);
export type CryptoLoanOffer = z.infer<typeof cryptoLoanOfferSchema>;
export type GetLoanOffersResponse = z.infer<typeof getLoanOffersResponseSchema>;
