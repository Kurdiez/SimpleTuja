import { z } from 'zod';

export const getContractAddressDtoSchema = z.object({
  name: z.string(),
});
export type GetContractAddressDto = z.infer<typeof getContractAddressDtoSchema>;
