import {
  getTokenBalance as getTokenBalanceFromApi,
  withdrawToken as withdrawTokenFromApi,
} from "@/utils/simpletuja/crypto-lending";
import { formatCamelCase } from "@/utils/utils";
import {
  useAppKit,
  useAppKitAccount,
  useWalletInfo,
} from "@reown/appkit/react";
import {
  CryptoToken,
  CryptoTokenAddress,
  CryptoTokenDecimals,
  WithdrawTokenResponseDto,
  WithdrawTokenStatus,
} from "@simpletuja/shared";
import {
  createConfig,
  getBalance,
  http,
  sendTransaction,
  writeContract,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { erc20Abi, parseUnits } from "viem";
import { useDisconnect, useWaitForTransactionReceipt } from "wagmi";

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

type InvestmentWalletContextType = {
  depositEth: (amount: string) => Promise<void>;
  depositErc20Token: (token: CryptoToken, amount: string) => Promise<void>;
  connectFundingWallet: () => void;
  disconnectFundingWallet: () => void;
  isWalletConnected: boolean;
  isConnectWalletInitiated: boolean;
  getTokenBalance: (token: CryptoToken) => Promise<string>;
  withdrawToken: (
    token: CryptoToken,
    amount: string
  ) => Promise<WithdrawTokenResponseDto>;
  isTransactionPending: boolean;
  tokenBalances: Record<CryptoToken, string>;
  updateTokenBalance: (token: CryptoToken) => Promise<void>;
};

const InvestmentWalletContext = createContext<
  InvestmentWalletContextType | undefined
>(undefined);

type InvestmentWalletProviderProps = {
  children: ReactNode;
  destinationAddress: string;
};

const ToastMessage = {
  TransactionPending: "Please wait for the current transaction to complete",
  WalletNotConnected: "Please connect your funding wallet first",
  SendingTransaction: "Sending transaction...",
  TransactionSuccessful: "Transaction successful",
  ProcessingWithdrawal: "Processing withdrawal...",
  WithdrawalSuccessful: "Withdrawal successful",
  InsufficientBalance: (token: string) => `Insufficient ${token} balance`,
  TransferFailed: (message: string) => `Transfer failed: ${message}`,
  WithdrawalFailed: (status: string) =>
    `Withdrawal failed: ${formatCamelCase(status)}`,
} as const;

const ToastIds = {
  TransferringToastId: "onboardingFundingTransferring",
} as const;

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

  const [isTransactionPending, setIsTransactionPending] = useState(false);

  const [tokenBalances, setTokenBalances] = useState<
    Record<CryptoToken, string>
  >({} as Record<CryptoToken, string>);

  const updateTokenBalance = useCallback(async (token: CryptoToken) => {
    const balance = await getTokenBalanceFromApi(token);
    setTokenBalances((prev) => ({ ...prev, [token]: balance }));
  }, []);

  useEffect(() => {
    if (isTransferSuccess) {
      toast.dismiss(ToastIds.TransferringToastId);
      toast.success(ToastMessage.TransactionSuccessful);
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

  const connectFundingWallet = useCallback(() => {
    setIsConnectWalletInitiated(true);
    open({ view: "Connect" });
  }, [open]);

  const disconnectFundingWallet = useCallback(() => {
    disconnect();
    setIsWalletConnected(false);
    setIsConnectWalletInitiated(false);
  }, [disconnect]);

  const depositEth = useCallback(
    async (amount: string): Promise<void> => {
      if (!isWalletConnected) {
        toast.error(ToastMessage.WalletNotConnected);
        return;
      }

      if (isTransactionPending) {
        toast.error(ToastMessage.TransactionPending);
        return;
      }

      try {
        setIsTransactionPending(true);
        const amountInSmallestUnit = parseUnits(
          amount,
          CryptoTokenDecimals.ETH
        );
        const balance = await getBalance(config, {
          address: address as `0x${string}`,
        });

        if (balance.value < amountInSmallestUnit) {
          toast.error(ToastMessage.InsufficientBalance("ETH"));
          return;
        }

        toast.loading(ToastMessage.SendingTransaction, {
          id: ToastIds.TransferringToastId,
        });

        const result = await sendTransaction(config, {
          to: destinationAddress as `0x${string}`,
          value: amountInSmallestUnit,
        });

        setTransactionHash(result as `0x${string}`);
        await updateTokenBalance(CryptoToken.ETH);
      } catch (error) {
        toast.dismiss(ToastIds.TransferringToastId);
        toast.error(ToastMessage.TransferFailed((error as Error).message));
        throw error;
      } finally {
        setIsTransactionPending(false);
      }
    },
    [
      address,
      destinationAddress,
      isTransactionPending,
      isWalletConnected,
      updateTokenBalance,
    ]
  );

  const depositErc20Token = useCallback(
    async (token: CryptoToken, amount: string): Promise<void> => {
      if (!isWalletConnected) {
        toast.error(ToastMessage.WalletNotConnected);
        return;
      }

      if (isTransactionPending) {
        toast.error(ToastMessage.TransactionPending);
        return;
      }

      try {
        setIsTransactionPending(true);
        const tokenAddress = CryptoTokenAddress[token];
        const decimals = CryptoTokenDecimals[token];
        const amountInSmallestUnit = parseUnits(amount, decimals);

        const balance = await getBalance(config, {
          address: address as `0x${string}`,
          token: tokenAddress as `0x${string}`,
        });

        if (balance.value < amountInSmallestUnit) {
          toast.error(ToastMessage.InsufficientBalance(token));
          return;
        }

        toast.loading(ToastMessage.SendingTransaction, {
          id: ToastIds.TransferringToastId,
        });

        const result = await writeContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [destinationAddress as `0x${string}`, amountInSmallestUnit],
        });

        setTransactionHash(result);
        await updateTokenBalance(token);
      } catch (error) {
        toast.dismiss(ToastIds.TransferringToastId);
        toast.error(ToastMessage.TransferFailed((error as Error).message));
        throw error;
      } finally {
        setIsTransactionPending(false);
      }
    },
    [
      address,
      destinationAddress,
      isTransactionPending,
      isWalletConnected,
      updateTokenBalance,
    ]
  );

  const getTokenBalance = useCallback(
    async (token: CryptoToken): Promise<string> => {
      const balance = await getTokenBalanceFromApi(token);
      return balance;
    },
    []
  );

  const withdrawToken = useCallback(
    async (
      token: CryptoToken,
      amount: string
    ): Promise<WithdrawTokenResponseDto> => {
      if (!isWalletConnected) {
        throw new Error(ToastMessage.WalletNotConnected);
      }

      if (isTransactionPending) {
        throw new Error(ToastMessage.TransactionPending);
      }

      try {
        setIsTransactionPending(true);
        toast.loading(ToastMessage.ProcessingWithdrawal, {
          id: ToastIds.TransferringToastId,
        });

        const response = await withdrawTokenFromApi(
          token,
          amount,
          address as string
        );

        toast.dismiss(ToastIds.TransferringToastId);
        if (response.status === WithdrawTokenStatus.Success) {
          toast.success(ToastMessage.WithdrawalSuccessful);
          await updateTokenBalance(token);
        } else if (
          response.status === WithdrawTokenStatus.InsufficientEthForGasFee
        ) {
          toast.error("Insufficient ETH balance for GAS fee");
        } else {
          toast.error(ToastMessage.WithdrawalFailed(response.status));
        }

        return response;
      } catch (error) {
        toast.dismiss(ToastIds.TransferringToastId);
        toast.error(ToastMessage.TransferFailed((error as Error).message));
        throw error;
      } finally {
        setIsTransactionPending(false);
      }
    },
    [isTransactionPending, address, isWalletConnected, updateTokenBalance]
  );

  return (
    <InvestmentWalletContext.Provider
      value={{
        connectFundingWallet,
        disconnectFundingWallet,
        depositEth,
        depositErc20Token,
        isWalletConnected,
        isConnectWalletInitiated,
        getTokenBalance,
        withdrawToken,
        isTransactionPending,
        tokenBalances,
        updateTokenBalance,
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
