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
import {
  completeOnboardingFuncAccount,
  updateActiveStatus,
} from "@/utils/simpletuja/cypto-lending";

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

type FundAccountContextType = {
  fundAccount: (
    token: CryptoToken,
    amount: string,
    startLendingRightAway: boolean
  ) => Promise<void>;
  connectSenderWallet: () => void;
  isWalletConnected: boolean;
  isConnectWalletInitiated: boolean;
};

const FundAccountContext = createContext<FundAccountContextType | undefined>(
  undefined
);

type FundAccountProviderProps = {
  children: ReactNode;
  destinationAddress: string;
  onFunded: () => void;
};

const Toast_TransferringToastId = "onboardingFundingTransferring";

export const FundAccountProvider: React.FC<FundAccountProviderProps> = ({
  children,
  destinationAddress,
  onFunded,
}) => {
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
      toast.success("Transaction confirmed");
      onFunded();
    }
  }, [isTransferSuccess, onFunded]);

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

  const fundAccount = useCallback(
    async (
      token: CryptoToken,
      amount: string,
      startLendingRightAway: boolean
    ): Promise<void> => {
      try {
        const tokenAddress = CryptoTokenAddress[token];
        const decimals = CryptoTokenDecimals[token];

        const balance = await getBalance(config, {
          address: address as `0x${string}`,
          token: tokenAddress as `0x${string}`,
        });

        const amountInSmallestUnit = parseUnits(amount, decimals);

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
        return;
      }

      await completeOnboardingFuncAccount(startLendingRightAway);
    },
    [address, destinationAddress]
  );

  return (
    <FundAccountContext.Provider
      value={{
        connectSenderWallet,
        fundAccount,
        isWalletConnected,
        isConnectWalletInitiated,
      }}
    >
      {children}
    </FundAccountContext.Provider>
  );
};

export const useFundAccount = () => {
  const context = useContext(FundAccountContext);
  if (!context) {
    throw new Error("useFundAccount must be used within a FundAccountProvider");
  }
  return context;
};
