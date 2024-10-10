import { z } from "zod";
import axios from "axios";

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

export const SendResetPasswordEmailDtoSchema = z.object({
  email: z.string().email(),
});

export type SendResetPasswordEmailDto = z.infer<
  typeof SendResetPasswordEmailDtoSchema
>;

export const ResetPasswordDtoSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(6),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
