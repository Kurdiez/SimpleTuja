import { apiRequest } from "./api";
import {
  RegisterDto,
  SignInDto,
  SendResetPasswordEmailDto,
  ResetPasswordDto,
} from "@simpletuja/shared";

const BaseUrl = "/auth";

export const register = async (registerDto: RegisterDto): Promise<void> => {
  await apiRequest<void>(`${BaseUrl}/register`, registerDto, false);
};

export const confirmEmail = async (token: string): Promise<string> => {
  const { accessToken } = await apiRequest<{ accessToken: string }>(
    `${BaseUrl}/confirm-email`,
    { token },
    false
  );
  return accessToken;
};

export const signIn = async (signInDto: SignInDto): Promise<string> => {
  const { accessToken } = await apiRequest<{ accessToken: string }>(
    `${BaseUrl}/sign-in`,
    signInDto,
    false
  );
  return accessToken;
};

export const refreshToken = async (): Promise<string> => {
  const response = await apiRequest<{ accessToken: string }>(
    `${BaseUrl}/sign-in-with-token`,
    {}
  );
  return response.accessToken;
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
): Promise<string> => {
  const { accessToken } = await apiRequest<{ accessToken: string }>(
    `${BaseUrl}/reset-password`,
    resetPasswordDto,
    false
  );
  return accessToken;
};
