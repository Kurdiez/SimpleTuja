import {
  CryptoLendingUserStateDto,
  LoanSettingsUpdateDto,
} from "@simpletuja/shared";
import { apiRequest } from "./api";

const BaseUrl = "/crypto-lending";

export const getOnboardingProgress =
  async (): Promise<CryptoLendingUserStateDto> => {
    const response = await apiRequest<CryptoLendingUserStateDto>(
      `${BaseUrl}/get-onboarding-progress`,
      {}
    );
    return response;
  };

export const openAccount = async (): Promise<void> => {
  await apiRequest(`${BaseUrl}/open-account`, {});
};

export const updateLoanSettings = async (
  loanSettingsUpdateDto: LoanSettingsUpdateDto
): Promise<void> => {
  await apiRequest(`${BaseUrl}/update-loan-settings`, loanSettingsUpdateDto);
};
