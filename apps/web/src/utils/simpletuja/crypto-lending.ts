import {
  CryptoExchangeRatesDto,
  CryptoLendingDashboardDataDto,
  CryptoLendingUserStateDto,
  CryptoToken,
  LoanEligibleNftCollectionsDto,
  LoanSettingsUpdateDto,
  WithdrawTokenResponseDto,
} from "@simpletuja/shared";
import { apiRequest } from "./api";

const BaseUrl = "/crypto-lending";

export const getCryptoUserState =
  async (): Promise<CryptoLendingUserStateDto> => {
    const response = await apiRequest<CryptoLendingUserStateDto>(
      `${BaseUrl}/get-crypto-user-state`,
      {}
    );
    return response;
  };

export const openAccount = async (): Promise<string> => {
  return await apiRequest(`${BaseUrl}/open-account`, {});
};

export const updateLoanSettings = async (
  loanSettingsUpdateDto: LoanSettingsUpdateDto
): Promise<void> => {
  await apiRequest(`${BaseUrl}/update-loan-settings`, loanSettingsUpdateDto);
};

export const getLoanEligibleNftCollections =
  async (): Promise<LoanEligibleNftCollectionsDto> => {
    const response = await apiRequest<LoanEligibleNftCollectionsDto>(
      `${BaseUrl}/get-loan-eligible-nft-collections`,
      {}
    );
    return response;
  };

export const getCryptoExchangeRates =
  async (): Promise<CryptoExchangeRatesDto> => {
    const response = await apiRequest<CryptoExchangeRatesDto>(
      `${BaseUrl}/get-crypto-exchange-rates`,
      {}
    );
    return response;
  };

export const updateActiveStatus = async (active: boolean): Promise<void> => {
  await apiRequest(`${BaseUrl}/update-active-status`, { active });
};

export const completeOnboardingFundAccount = async (): Promise<void> => {
  await apiRequest(`${BaseUrl}/complete-onboarding-fund-account`);
};

export const getTokenBalance = async (token: CryptoToken): Promise<string> => {
  const response = await apiRequest<string>(
    `${BaseUrl}/investment-wallet/get-token-balance`,
    { token }
  );
  return response;
};

export const getDashboardData =
  async (): Promise<CryptoLendingDashboardDataDto> => {
    const response = await apiRequest<CryptoLendingDashboardDataDto>(
      `${BaseUrl}/get-dashboard-data`,
      {}
    );
    return response;
  };

export const withdrawToken = async (
  token: CryptoToken,
  amount: string,
  destinationAddress: string
): Promise<WithdrawTokenResponseDto> => {
  const response = await apiRequest<WithdrawTokenResponseDto>(
    `${BaseUrl}/investment-wallet/withdraw`,
    { token, amount, destinationAddress }
  );
  return response;
};
