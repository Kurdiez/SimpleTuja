import Button from "@/components/common/Button";
import { Typography } from "@/components/common/Typography";
import { OnboardingFundAccountAmountModal } from "@/components/modal/content/OnboardingFundAccountAmount/OnboardingFundAccountAmountModal";
import { WhyDepositEthModal } from "@/components/modal/content/WhyDepositEthModal";
import { useModal } from "@/components/modal/modal.context";
import { useOnboarding } from "@/components/pages/crypto-lending/onboarding/onboarding.context";
import { getCryptoExchangeRates } from "@/utils/simpletuja/crypto-lending";
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { CryptoToken } from "@simpletuja/shared";
import classNames from "classnames";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useInvestmentWallet } from "../../../common/crypto-lending/investment-wallet.context";

interface FundAccountFormProps {
  classNames?: string;
  onActivateLending: () => void;
}

interface StepTitleProps {
  title: string;
  isCompleted: boolean;
}

const StepTitle: React.FC<StepTitleProps> = ({ title, isCompleted }) => (
  <div className="flex items-center space-x-2 mb-4">
    <CheckCircleIcon
      className={classNames(
        "h-6 w-6",
        isCompleted ? "text-green-500" : "text-gray-400"
      )}
    />
    <h3 className="text-lg font-semibold text-white">{title}</h3>
  </div>
);

export const FundAccountForm: React.FC<FundAccountFormProps> = ({
  classNames: additionalClassNames,
  onActivateLending,
}) => {
  const {
    isWalletConnected,
    isConnectWalletInitiated,
    isTransactionPending,
    connectFundingWallet,
    disconnectFundingWallet,
    getTokenBalance,
    depositEth,
    depositErc20Token,
  } = useInvestmentWallet();
  const { onboardingProgress } = useOnboarding();

  const { openModal } = useModal();
  const [amount, setAmount] = useState<string>("0.0");
  const [ethBalance, setEthBalance] = useState<string>("-");
  const [minimumAmount, setMinimumAmount] = useState<string>("-");
  const [ethInputAmount, setEthInputAmount] = useState<string>("");
  const [isEthDepositing, setIsEthDepositing] = useState<boolean>(false);
  const [isErc20TokenDepositing, setIsErc20TokenDepositing] =
    useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<CryptoToken>(
    CryptoToken.WETH
  );
  const [tokenBalances, setTokenBalances] = useState({
    [CryptoToken.WETH]: "-",
    [CryptoToken.DAI]: "-",
    [CryptoToken.USDC]: "-",
  });

  const highestLtv = useMemo(() => {
    if (!onboardingProgress) return 0;
    const ltvValues = [
      onboardingProgress.oneWeekLTV,
      onboardingProgress.twoWeeksLTV,
      onboardingProgress.oneMonthLTV,
      onboardingProgress.twoMonthsLTV,
      onboardingProgress.threeMonthsLTV,
    ].filter((ltv): ltv is number => ltv !== null);
    return Math.max(...ltvValues, 0);
  }, [onboardingProgress]);

  const isEthDepositCompleted = useMemo(() => {
    return parseFloat(ethBalance) >= parseFloat(minimumAmount);
  }, [ethBalance, minimumAmount]);

  useEffect(() => {
    const loadInitialData = async () => {
      const ethBal = await getTokenBalance(CryptoToken.ETH);
      const wethBal = await getTokenBalance(CryptoToken.WETH);
      const daiBal = await getTokenBalance(CryptoToken.DAI);
      const usdcBal = await getTokenBalance(CryptoToken.USDC);

      setEthBalance(ethBal ? Number(ethBal).toFixed(8) : "0");
      setTokenBalances({
        [CryptoToken.WETH]: wethBal?.toString() ?? "-",
        [CryptoToken.DAI]: daiBal?.toString() ?? "-",
        [CryptoToken.USDC]: usdcBal?.toString() ?? "-",
      });

      const rates = await getCryptoExchangeRates();
      if (rates?.USDC) {
        setMinimumAmount((5 / rates.USDC).toFixed(8));
      }
    };

    loadInitialData();
  }, [getTokenBalance]);

  const handleAmountClick = () => {
    if (isWalletConnected && isConnectWalletInitiated) {
      openModal(
        <OnboardingFundAccountAmountModal
          onAmountSelected={(amount) => setAmount(amount.toString())}
          token={CryptoToken.WETH}
          ltvThreshold={highestLtv}
          initialAmount={parseFloat(amount)}
        />
      );
    }
  };

  const handleEthDeposit = async () => {
    if (!ethInputAmount) {
      toast.error("Please enter an amount");
      return;
    }
    if (isTransactionPending) {
      toast.error("Please wait for the current transaction to complete");
      return;
    }
    setIsEthDepositing(true);
    try {
      await depositEth(ethInputAmount);
      const balance = await getTokenBalance(CryptoToken.ETH);
      setEthBalance(balance ? Number(balance).toFixed(8) : "-");
    } finally {
      setIsEthDepositing(false);
    }
  };

  const handleErc20TokenDeposit = async () => {
    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    if (isTransactionPending) {
      toast.error("Please wait for the current transaction to complete");
      return;
    }
    setIsErc20TokenDepositing(true);
    try {
      await depositErc20Token(selectedToken, amount);
      const balance = await getTokenBalance(selectedToken);
      setTokenBalances((prev) => ({
        ...prev,
        [selectedToken]: balance?.toString() ?? "-",
      }));
    } finally {
      setIsErc20TokenDepositing(false);
    }
  };

  const handleGasInfoClick = () => {
    openModal(<WhyDepositEthModal />);
  };

  const isStep3Completed = useMemo(() => {
    return Object.values(tokenBalances).some(
      (balance) => balance !== "-" && parseFloat(balance) > 0
    );
  }, [tokenBalances]);

  const canProceedToNext = useMemo(() => {
    return isEthDepositCompleted && isStep3Completed;
  }, [isEthDepositCompleted, isStep3Completed]);

  return (
    <div
      className={classNames(
        "relative rounded-2xl overflow-hidden shadow-lg border-[1px] flex",
        additionalClassNames
      )}
    >
      <div className="relative overflow-hidden bg-primary-light w-1/2 h-min-full w-min-full flex-1">
        <Image
          src="/img/deposit-wallet.svg"
          alt="Bitcoin wallet banner"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12 lg:px-14 lg:py-16">
        <div className="max-w-lg mx-auto">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Fund Your Account
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Deposit Tokens
          </p>
          <div className="mt-8 space-y-12">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                1. Connect Funding Wallet
              </h3>
              {isWalletConnected && isConnectWalletInitiated ? (
                <div className="flex items-center gap-4">
                  <div className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-white bg-green-600 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <Typography.TextSM weight="medium">
                      Funding Wallet Connected
                    </Typography.TextSM>
                  </div>
                  <button
                    onClick={disconnectFundingWallet}
                    className="link text-sm"
                  >
                    <Typography.TextSM>Disconnect</Typography.TextSM>
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  className="w-full"
                  onClick={connectFundingWallet}
                >
                  Connect Funding Wallet
                </Button>
              )}
            </div>

            <div>
              <StepTitle
                title="2. Deposit ETH for GAS Fees"
                isCompleted={isEthDepositCompleted}
              />
              <button
                onClick={handleGasInfoClick}
                className="flex items-center text-sm text-primary hover:text-primary-light mb-2"
              >
                <InformationCircleIcon className="h-4 w-4 mr-1" />
                Why do I need to deposit ETH?
              </button>
              <p className="text-gray-300 mb-2">
                Minimum amount: {minimumAmount} ETH
              </p>
              <p className="text-gray-300 mb-4">
                Current balance: {ethBalance} ETH
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={ethInputAmount}
                  onChange={(e) => setEthInputAmount(e.target.value)}
                  className={classNames(
                    "bg-gray-700 rounded-md px-3 py-2 text-white w-full sm:w-48",
                    (!isWalletConnected || !isConnectWalletInitiated) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  placeholder="0.0"
                  disabled={!isWalletConnected || !isConnectWalletInitiated}
                />
                <Button
                  type="button"
                  disabled={
                    !isWalletConnected ||
                    !isConnectWalletInitiated ||
                    isTransactionPending
                  }
                  onClick={handleEthDeposit}
                  loading={isEthDepositing}
                  className="w-full sm:w-auto"
                >
                  Deposit
                </Button>
              </div>
            </div>

            <div>
              <StepTitle
                title="3. Deposit Tokens to Lend"
                isCompleted={isStep3Completed}
              />
              <div className="space-y-4 mb-6">
                <div className="flex flex-col space-y-2">
                  <div>Current balances:</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="weth"
                      value={CryptoToken.WETH}
                      checked={selectedToken === CryptoToken.WETH}
                      onChange={(e) =>
                        setSelectedToken(e.target.value as CryptoToken)
                      }
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor="weth" className="text-white">
                      WETH - {tokenBalances[CryptoToken.WETH]} WETH
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="dai"
                      value={CryptoToken.DAI}
                      checked={selectedToken === CryptoToken.DAI}
                      onChange={(e) =>
                        setSelectedToken(e.target.value as CryptoToken)
                      }
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor="dai" className="text-white">
                      DAI - {tokenBalances[CryptoToken.DAI]} DAI
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="usdc"
                      value={CryptoToken.USDC}
                      checked={selectedToken === CryptoToken.USDC}
                      onChange={(e) =>
                        setSelectedToken(e.target.value as CryptoToken)
                      }
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor="usdc" className="text-white">
                      USDC - {tokenBalances[CryptoToken.USDC]} USDC
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <Button
                  type="button"
                  className="w-full sm:w-48 justify-end"
                  onClick={handleAmountClick}
                  disabled={!isWalletConnected || !isConnectWalletInitiated}
                >
                  <span className="flex items-center space-x-2">
                    <span>{amount}</span>
                    <span className="text-xs">▼</span>
                  </span>
                </Button>
                <Button
                  type="button"
                  onClick={handleErc20TokenDeposit}
                  loading={isErc20TokenDepositing}
                  className="w-full sm:w-auto"
                  disabled={
                    !isWalletConnected ||
                    !isConnectWalletInitiated ||
                    parseFloat(amount) <= 0 ||
                    isTransactionPending
                  }
                >
                  Deposit
                </Button>
              </div>
            </div>

            <div>
              {!canProceedToNext ? (
                <div className="w-full rounded-md px-3.5 py-2.5 text-sm font-semibold text-white bg-gray-400 flex items-center justify-center">
                  Complete steps 2 and 3 to continue
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={onActivateLending}
                  className="w-full"
                >
                  Activate Lending
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundAccountForm;
