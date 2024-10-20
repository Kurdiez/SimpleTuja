import { z } from "zod";

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

const WalletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .nullable();

export const CryptoLendingUserStateDtoSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    hasOpenedCryptoInvestmentAccount: z.boolean(),
    hasCompletedLoanSettings: z.boolean(),
    hasFundedTheAccount: z.boolean(),
    ...LTVFieldsSchema.shape,
    foreclosureWalletAddress: WalletAddressSchema,
    walletAddress: WalletAddressSchema,
  })
  .nullable();

export type CryptoLendingUserStateDto = z.infer<
  typeof CryptoLendingUserStateDtoSchema
>;

export const LoanSettingsUpdateRequestSchema = LTVFieldsSchema.extend({
  foreclosureWalletAddress: WalletAddressSchema,
});

export type LoanSettingsUpdateDto = z.infer<
  typeof LoanSettingsUpdateRequestSchema
>;

export const LoanEligibleNftCollectionsDtoSchema = z.array(
  z.object({
    name: z.string().min(1),
    loanCount: z.number().int(),
    openSeaSlug: z.string().min(1),
    avgTopBids: z.number(),
  })
);

export type LoanEligibleNftCollectionsDto = z.infer<
  typeof LoanEligibleNftCollectionsDtoSchema
>;
