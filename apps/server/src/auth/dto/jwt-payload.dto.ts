import z from 'zod';

export const jwtPayloadDtoSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
});
export type JwtPayloadDto = z.infer<typeof jwtPayloadDtoSchema>;
