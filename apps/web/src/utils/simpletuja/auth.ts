import {
  AuthResponse,
  RegisterDto,
  ResetPasswordDto,
  SendResetPasswordEmailDto,
  SignInDto,
} from "@simpletuja/shared";
import { apiRequest } from "./api";

const BaseUrl = "/auth";

export const register = async (registerDto: RegisterDto): Promise<void> => {
  await apiRequest<void>(`${BaseUrl}/register`, registerDto, false);
};

export const confirmEmail = async (token: string): Promise<AuthResponse> => {
  return await apiRequest<AuthResponse>(
    `${BaseUrl}/confirm-email`,
    { token },
    false
  );
};

export const signIn = async (signInDto: SignInDto): Promise<AuthResponse> => {
  return await apiRequest<AuthResponse>(`${BaseUrl}/sign-in`, signInDto, false);
};

export const refreshToken = async (): Promise<AuthResponse> => {
  return await apiRequest<AuthResponse>(`${BaseUrl}/sign-in-with-token`, {});
};

export const sendResetPasswordEmail = async (
  sendResetPasswordEmailDto: SendResetPasswordEmailDto
): Promise<void> => {
  await apiRequest<void>(
    `${BaseUrl}/send-reset-password-email`,
    sendResetPasswordEmailDto,
    false
  );
};

export const resetPassword = async (
  resetPasswordDto: ResetPasswordDto
): Promise<AuthResponse> => {
  return await apiRequest<AuthResponse>(
    `${BaseUrl}/reset-password`,
    resetPasswordDto,
    false
  );
};
