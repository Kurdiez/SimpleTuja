import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  useAppKitAccount,
  useAppKit,
  useWalletInfo,
} from "@reown/appkit/react";
import { useDisconnect, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import {
  CryptoToken,
  CryptoTokenAddress,
  CryptoTokenDecimals,
} from "@simpletuja/shared";
import toast from "react-hot-toast";
import { getBalance, http, createConfig } from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import { writeContract } from "@wagmi/core";
import { getTokenBalance as getTokenBalanceFromApi } from "@/utils/simpletuja/crypto-lending";
import { sendTransaction } from "@wagmi/core";

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

type InvestmentWalletContextType = {
  depositEth: (amount: string) => Promise<void>;
  depositErc20Token: (token: CryptoToken, amount: string) => Promise<void>;
  connectSenderWallet: () => void;
  isWalletConnected: boolean;
  isConnectWalletInitiated: boolean;
  getTokenBalance: (token: CryptoToken) => Promise<string>;
};

const InvestmentWalletContext = createContext<
  InvestmentWalletContextType | undefined
>(undefined);

type InvestmentWalletProviderProps = {
  children: ReactNode;
  destinationAddress: string;
};

const Toast_TransferringToastId = "onboardingFundingTransferring";

export const InvestmentWalletProvider: React.FC<
  InvestmentWalletProviderProps
> = ({ children, destinationAddress }) => {
  const [isConnectWalletInitiated, setIsConnectWalletInitiated] =
    useState<boolean>(false);
  const { address } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { walletInfo } = useWalletInfo();
  const isConnected = walletInfo != null;
  const [isWalletConnected, setIsWalletConnected] =
    useState<boolean>(isConnected);

  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | undefined
  >(undefined);

  const { isSuccess: isTransferSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  useEffect(() => {
    if (isTransferSuccess) {
      toast.dismiss(Toast_TransferringToastId);
      toast.success("Transaction successful");
    }
  }, [isTransferSuccess]);

  useEffect(() => {
    if (isConnected && !isConnectWalletInitiated) {
      disconnect();
      setIsWalletConnected(false);
    } else if (isConnected && isConnectWalletInitiated) {
      setIsWalletConnected(true);
    }
  }, [isConnected, isConnectWalletInitiated, disconnect]);

  const connectSenderWallet = useCallback(() => {
    setIsConnectWalletInitiated(true);
    open({ view: "Connect" });
  }, [open]);

  const depositEth = useCallback(
    async (amount: string): Promise<void> => {
      try {
        const amountInSmallestUnit = parseUnits(
          amount,
          CryptoTokenDecimals.ETH
        );
        const balance = await getBalance(config, {
          address: address as `0x${string}`,
        });

        if (balance.value < amountInSmallestUnit) {
          toast.error("Insufficient ETH balance");
          return;
        }

        toast.loading("Sending transaction...", {
          id: Toast_TransferringToastId,
        });

        const result = await sendTransaction(config, {
          to: destinationAddress as `0x${string}`,
          value: amountInSmallestUnit,
        });

        setTransactionHash(result as `0x${string}`);
      } catch (error) {
        toast.dismiss(Toast_TransferringToastId);
        toast.error(`Transfer failed: ${(error as Error).message}`);
        throw error;
      }
    },
    [address, destinationAddress]
  );

  const depositErc20Token = useCallback(
    async (token: CryptoToken, amount: string): Promise<void> => {
      try {
        const tokenAddress = CryptoTokenAddress[token];
        const decimals = CryptoTokenDecimals[token];
        const amountInSmallestUnit = parseUnits(amount, decimals);

        const balance = await getBalance(config, {
          address: address as `0x${string}`,
          token: tokenAddress as `0x${string}`,
        });

        if (balance.value < amountInSmallestUnit) {
          toast.error(`Insufficient ${token} balance`);
          return;
        }

        toast.loading("Sending transaction...", {
          id: Toast_TransferringToastId,
        });

        const result = await writeContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [destinationAddress as `0x${string}`, amountInSmallestUnit],
        });

        setTransactionHash(result);
      } catch (error) {
        toast.dismiss(Toast_TransferringToastId);
        toast.error(`Transfer failed: ${(error as Error).message}`);
        throw error;
      }
    },
    [address, destinationAddress]
  );

  const getTokenBalance = useCallback(
    async (token: CryptoToken): Promise<string> => {
      const balance = await getTokenBalanceFromApi(token);
      return balance;
    },
    []
  );

  return (
    <InvestmentWalletContext.Provider
      value={{
        connectSenderWallet,
        depositEth,
        depositErc20Token,
        isWalletConnected,
        isConnectWalletInitiated,
        getTokenBalance,
      }}
    >
      {children}
    </InvestmentWalletContext.Provider>
  );
};

export const useInvestmentWallet = () => {
  const context = useContext(InvestmentWalletContext);
  if (!context) {
    throw new Error(
      "useInvestmentWallet must be used within a InvestmentWalletProvider"
    );
  }
  return context;
};
