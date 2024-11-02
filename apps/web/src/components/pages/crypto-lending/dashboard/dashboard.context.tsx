import {
  getCryptoExchangeRates,
  getTokenBalance,
} from "@/utils/simpletuja/crypto-lending";
import { CryptoExchangeRatesDto, CryptoToken } from "@simpletuja/shared";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import toast from "react-hot-toast";

export interface TokenBalance {
  id: number;
  name: string;
  balance: string;
  token: CryptoToken;
}

type DashboardContextType = {
  isLoading: boolean;
  tokenBalances: TokenBalance[];
  exchangeRates: CryptoExchangeRatesDto | null;
  walletAddress: string;
  copyToClipboard: () => Promise<void>;
  calculateTotalUsdBalance: () => number;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

type DashboardProviderProps = {
  children: ReactNode;
};

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exchangeRates, setExchangeRates] =
    useState<CryptoExchangeRatesDto | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    {
      id: 1,
      name: "ETH Balance",
      balance: "0",
      token: CryptoToken.ETH,
    },
    {
      id: 2,
      name: "wETH Balance",
      balance: "0",
      token: CryptoToken.WETH,
    },
    {
      id: 3,
      name: "DAI Balance",
      balance: "0",
      token: CryptoToken.DAI,
    },
    {
      id: 4,
      name: "USDC Balance",
      balance: "0",
      token: CryptoToken.USDC,
    },
  ]);

  const walletAddress: string = "0x1234567890abcdef1234567890abcdef12345678";

  const copyToClipboard = async (): Promise<void> => {
    await navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard");
  };

  const calculateTotalUsdBalance = (): number => {
    if (!exchangeRates || isLoading) return 0;

    const total = tokenBalances.reduce((total, token) => {
      const balance = parseFloat(token.balance.replace(/,/g, ""));
      switch (token.token) {
        case CryptoToken.ETH:
          return total + balance * exchangeRates.USDC;
        case CryptoToken.WETH:
          return total + balance * exchangeRates.USDC;
        case CryptoToken.DAI:
          return total + balance;
        case CryptoToken.USDC:
          return total + balance;
        default:
          return total;
      }
    }, 0);

    return parseFloat(
      total
        .toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
        .replace(/,/g, "")
    );
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const rates = await getCryptoExchangeRates();
        setExchangeRates(rates);

        await Promise.all(
          tokenBalances.map(async (token, index) => {
            const balance = await getTokenBalance(token.token);
            const parsedBalance = parseFloat(balance);
            const maxDecimals =
              token.token === CryptoToken.DAI ||
              token.token === CryptoToken.USDC
                ? 2
                : 8;

            setTokenBalances((prev) => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                balance: parsedBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: maxDecimals,
                }),
              };
              return updated;
            });
          })
        );
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
        tokenBalances,
        exchangeRates,
        walletAddress,
        copyToClipboard,
        calculateTotalUsdBalance,
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
