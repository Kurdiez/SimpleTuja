import { z } from 'zod';

export const testNftLiquidationAlertReqSchema = z.object({
  toEmail: z.string(),
  foreclosureWalletAddress: z.string(),
  nftCollectionName: z.string(),
  nftTokenId: z.string(),
});
export type TestNftLiquidationAlertReq = z.infer<
  typeof testNftLiquidationAlertReqSchema
>;
