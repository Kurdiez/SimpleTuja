import {
  CryptoToken,
  NftFiLoanStatus,
  WithdrawTokenStatus,
} from '@simpletuja/shared';
import { z } from 'zod';

export const userIdDtoSchema = z.object({
  userId: z.string(),
});
export type UserIdDto = z.infer<typeof userIdDtoSchema>;

export const collectionAddressDtoSchema = z.object({
  collectionAddress: z.string(),
});
export type CollectionAddressDto = z.infer<typeof collectionAddressDtoSchema>;

export const collectionIdDtoSchema = z.object({
  collectionId: z.string(),
});
export type CollectionIdDto = z.infer<typeof collectionIdDtoSchema>;

export const getTokenAllowanceDtoSchema = z.object({
  userId: z.string(),
  token: z.nativeEnum(CryptoToken),
});
export type GetTokenAllowanceDto = z.infer<typeof getTokenAllowanceDtoSchema>;

export const approveTokenMaxAllowanceDtoSchema = z.object({
  userId: z.string(),
  token: z.nativeEnum(CryptoToken),
});
export type ApproveTokenMaxAllowanceDto = z.infer<
  typeof approveTokenMaxAllowanceDtoSchema
>;

export const getTokenBalanceDtoSchema = z.object({
  userId: z.string(),
  token: z.nativeEnum(CryptoToken),
});
export type GetTokenBalanceDto = z.infer<typeof getTokenBalanceDtoSchema>;

export const getLentLoansDtoSchema = z.object({
  userId: z.string(),
  status: z.nativeEnum(NftFiLoanStatus),
});
export type GetLentLoansDto = z.infer<typeof getLentLoansDtoSchema>;

export const adminWithdrawTokenDtoSchema = z.object({
  userId: z.string(),
  token: z.nativeEnum(CryptoToken),
  amount: z.string(),
  destinationAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});
export type AdminWithdrawTokenDto = z.infer<typeof adminWithdrawTokenDtoSchema>;

export const adminWithdrawTokenResponseDtoSchema = z.object({
  status: z.nativeEnum(WithdrawTokenStatus),
});
export type AdminWithdrawTokenResponseDto = z.infer<
  typeof adminWithdrawTokenResponseDtoSchema
>;
