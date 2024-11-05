import {
  getCryptoExchangeRates,
  getDashboardData,
} from "@/utils/simpletuja/crypto-lending";
import {
  CryptoExchangeRatesDto,
  CryptoLendingDashboardDataDto,
} from "@simpletuja/shared";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

export type ComputedBalances = {
  // Portfolio balances
  portfolioUsdValue: number;
  portfolioEthValue: number;

  // Cash balances
  totalUsdBalance: number;

  // Loan stats
  activeOffers: number;
  activeLoans: number;
  repaidLoans: number;
  liquidatedLoans: number;

  // Token balances
  ethBalance: string;
  wethBalance: string;
  daiBalance: string;
  usdcBalance: string;

  // Active loan principals
  wethActiveLoansPrincipal: string;
  daiActiveLoansPrincipal: string;
  usdcActiveLoansPrincipal: string;
  totalActiveLoanPrincipalUsd: number;

  // Active loan repayments
  wethActiveLoansRepayment: string;
  daiActiveLoansRepayment: string;
  usdcActiveLoansRepayment: string;
  totalActiveLoansRepaymentUsd: number;
};

type DashboardContextType = {
  isLoading: boolean;
  walletAddress: string | null;
  computedBalances: ComputedBalances | null;
  copyToClipboard: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

const computeBalances = (
  data: CryptoLendingDashboardDataDto | null,
  exchangeRates: CryptoExchangeRatesDto | null
): ComputedBalances | null => {
  if (!data || !exchangeRates) return null;

  // Calculate loan principals in USD
  const wethPrincipalUsd =
    parseFloat(data.wethActiveLoansPrincipal) * exchangeRates.USDC;
  const daiPrincipalUsd = parseFloat(data.daiActiveLoansPrincipal);
  const usdcPrincipalUsd = parseFloat(data.usdcActiveLoansPrincipal);
  const totalActiveLoanPrincipalUsd =
    wethPrincipalUsd + daiPrincipalUsd + usdcPrincipalUsd;

  // Calculate loan repayments in USD
  const wethRepaymentUsd =
    parseFloat(data.wethActiveLoansRepayment) * exchangeRates.USDC;
  const daiRepaymentUsd = parseFloat(data.daiActiveLoansRepayment);
  const usdcRepaymentUsd = parseFloat(data.usdcActiveLoansRepayment);
  const totalActiveLoansRepaymentUsd =
    wethRepaymentUsd + daiRepaymentUsd + usdcRepaymentUsd;

  // Calculate Portfolio USD Value (using principals, not repayments)
  const ethBalanceUsd = parseFloat(data.ethBalance) * exchangeRates.USDC;
  const wethBalanceUsd = parseFloat(data.wethBalance) * exchangeRates.USDC;
  const daiBalanceUsd = parseFloat(data.daiBalance);
  const usdcBalanceUsd = parseFloat(data.usdcBalance);

  const portfolioUsdValue =
    ethBalanceUsd +
    wethBalanceUsd +
    daiBalanceUsd +
    usdcBalanceUsd +
    totalActiveLoanPrincipalUsd;

  // Calculate Portfolio ETH Value
  const ethBalance = parseFloat(data.ethBalance);
  const wethBalance = parseFloat(data.wethBalance);
  const daiBalance = parseFloat(data.daiBalance) / exchangeRates.USDC;
  const usdcBalance = parseFloat(data.usdcBalance) / exchangeRates.USDC;
  const wethLoan = parseFloat(data.wethActiveLoansPrincipal);
  const daiLoan = parseFloat(data.daiActiveLoansPrincipal) / exchangeRates.USDC;
  const usdcLoan =
    parseFloat(data.usdcActiveLoansPrincipal) / exchangeRates.USDC;

  const portfolioEthValue =
    ethBalance +
    wethBalance +
    daiBalance +
    usdcBalance +
    wethLoan +
    daiLoan +
    usdcLoan;

  // Calculate Total USD Balance (cash only, no loans)
  const totalUsdBalance =
    ethBalanceUsd + wethBalanceUsd + daiBalanceUsd + usdcBalanceUsd;

  return {
    portfolioUsdValue,
    portfolioEthValue,
    totalUsdBalance,

    // Loan stats
    activeOffers: data.activeOffers,
    activeLoans: data.activeLoans,
    repaidLoans: data.repaidLoans,
    liquidatedLoans: data.liquidatedLoans,

    // Token balances
    ethBalance: data.ethBalance,
    wethBalance: data.wethBalance,
    daiBalance: data.daiBalance,
    usdcBalance: data.usdcBalance,

    // Active loan principals
    wethActiveLoansPrincipal: data.wethActiveLoansPrincipal,
    daiActiveLoansPrincipal: data.daiActiveLoansPrincipal,
    usdcActiveLoansPrincipal: data.usdcActiveLoansPrincipal,
    totalActiveLoanPrincipalUsd,

    // Active loan repayments
    wethActiveLoansRepayment: data.wethActiveLoansRepayment,
    daiActiveLoansRepayment: data.daiActiveLoansRepayment,
    usdcActiveLoansRepayment: data.usdcActiveLoansRepayment,
    totalActiveLoansRepaymentUsd,
  };
};

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exchangeRates, setExchangeRates] =
    useState<CryptoExchangeRatesDto | null>(null);
  const [dashboardData, setDashboardData] =
    useState<CryptoLendingDashboardDataDto | null>(null);
  const computedBalances = computeBalances(dashboardData, exchangeRates);

  const copyToClipboard = async (): Promise<void> => {
    if (!dashboardData?.walletAddress) return;
    await navigator.clipboard.writeText(dashboardData.walletAddress);
    toast.success("Address copied to clipboard");
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const [rates, data] = await Promise.all([
          getCryptoExchangeRates(),
          getDashboardData(),
        ]);

        setExchangeRates(rates);
        setDashboardData(data);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        isLoading,
        walletAddress: dashboardData?.walletAddress ?? null,
        computedBalances,
        copyToClipboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
