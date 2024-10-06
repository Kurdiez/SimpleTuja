import { z } from "zod";

export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const ConfirmEmailDtoSchema = z.object({
  token: z.string().uuid(),
});

export type ConfirmEmailDto = z.infer<typeof ConfirmEmailDtoSchema>;

export const SignInDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignInDto = z.infer<typeof SignInDtoSchema>;
