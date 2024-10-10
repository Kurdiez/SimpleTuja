import { apiRequest } from "./api";
import {
  RegisterDto,
  SignInDto,
  SendResetPasswordEmailDto,
  ResetPasswordDto,
} from "@simpletuja/shared";

export const register = async (registerDto: RegisterDto): Promise<void> => {
  await apiRequest<void>("/auth/register", registerDto, false);
};

export const signIn = async (
  signInDto: SignInDto
): Promise<{ accessToken: string }> => {
  return await apiRequest<{ accessToken: string }>(
    "/auth/sign-in",
    signInDto,
    false
  );
};

export const refreshToken = async (): Promise<string> => {
  const response = await apiRequest<{ accessToken: string }>(
    "/auth/sign-in-with-token",
    {}
  );
  return response.accessToken;
};

export const sendResetPasswordEmail = async (
  sendResetPasswordEmailDto: SendResetPasswordEmailDto
): Promise<void> => {
  await apiRequest<void>(
    "/auth/send-reset-password-email",
    sendResetPasswordEmailDto,
    false
  );
};

export const resetPassword = async (
  resetPasswordDto: ResetPasswordDto
): Promise<{ accessToken: string }> => {
  return await apiRequest<{ accessToken: string }>(
    "/auth/reset-password",
    resetPasswordDto,
    false
  );
};
