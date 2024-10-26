import { z } from 'zod';

export const userIdDtoSchema = z.object({
  userId: z.string(),
});
export type UserIdDto = z.infer<typeof userIdDtoSchema>;
