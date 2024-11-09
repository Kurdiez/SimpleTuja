import Button from "@/components/common/Button";
import { useInvestmentWallet } from "@/components/common/investment-wallet.context";
import { Typography } from "@/components/common/Typography";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { CryptoToken } from "@simpletuja/shared";
import classNames from "classnames";
import { useState } from "react";

export const InvestmentWalletActions: React.FC = () => {
  const {
    isWalletConnected,
    isTransactionPending,
    connectFundingWallet,
    disconnectFundingWallet,
    depositErc20Token,
    depositEth,
    withdrawToken,
  } = useInvestmentWallet();

  const [selectedDepositToken, setSelectedDepositToken] = useState<CryptoToken>(
    CryptoToken.ETH
  );
  const [selectedWithdrawToken, setSelectedWithdrawToken] =
    useState<CryptoToken>(CryptoToken.ETH);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount) return;

    try {
      setIsDepositing(true);
      if (selectedDepositToken === CryptoToken.ETH) {
        await depositEth(depositAmount);
      } else {
        await depositErc20Token(selectedDepositToken, depositAmount);
      }
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !isWalletConnected) return;

    try {
      setIsWithdrawing(true);
      await withdrawToken(selectedWithdrawToken, withdrawAmount);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div>
      <div className="px-4 sm:px-0">
        <Typography.DisplayMD className="text-white">
          Investment Wallet Actions
        </Typography.DisplayMD>
        <Typography.TextSM className="mt-1 max-w-2xl text-gray-400">
          Deposit or withdraw funds from your investment wallet. Please ensure
          you have enough ETH to cover GAS fees.
        </Typography.TextSM>
      </div>

      <div className="mt-6 border-t border-white/10">
        <dl className="divide-y divide-white/10">
          {/* Connect Wallet */}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Typography.TextMD weight="medium" className="text-white">
              Connect Your Funding Wallet
            </Typography.TextMD>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              {isWalletConnected ? (
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
                <Button onClick={connectFundingWallet}>
                  Connect Funding Wallet
                </Button>
              )}
              <Typography.TextSM className="mt-1 text-gray-400">
                Connect the wallet you&apos;ll use to send deposits and receive
                withdrawals
              </Typography.TextSM>
            </dd>
          </div>

          {/* Deposit Funds */}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Typography.TextMD weight="medium" className="text-white">
              Deposit Funds
            </Typography.TextMD>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              <div className="space-y-4">
                <div className="flex gap-4">
                  {[
                    CryptoToken.ETH,
                    CryptoToken.WETH,
                    CryptoToken.DAI,
                    CryptoToken.USDC,
                  ].map((token) => (
                    <label
                      key={token}
                      className={classNames(
                        "flex items-center",
                        !isWalletConnected && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="radio"
                        name="depositToken"
                        value={token}
                        checked={selectedDepositToken === token}
                        onChange={(e) =>
                          setSelectedDepositToken(e.target.value as CryptoToken)
                        }
                        disabled={!isWalletConnected}
                        className="mr-2"
                      />
                      <Typography.TextSM>{token}</Typography.TextSM>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={!isWalletConnected}
                    min="0"
                    step="any"
                    className={classNames(
                      "block w-40 rounded-md border-0 bg-white/5 px-2 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10",
                      !isWalletConnected && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder="Amount"
                  />
                  <Button
                    onClick={handleDeposit}
                    disabled={
                      !isWalletConnected ||
                      !depositAmount ||
                      isTransactionPending
                    }
                    loading={isDepositing}
                  >
                    Deposit
                  </Button>
                </div>
              </div>
            </dd>
          </div>

          {/* Withdraw Funds */}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Typography.TextMD weight="medium" className="text-white">
              Withdraw Funds
            </Typography.TextMD>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              <div className="space-y-4">
                <div className="flex gap-4">
                  {[
                    CryptoToken.ETH,
                    CryptoToken.WETH,
                    CryptoToken.DAI,
                    CryptoToken.USDC,
                  ].map((token) => (
                    <label
                      key={token}
                      className={classNames(
                        "flex items-center",
                        !isWalletConnected && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="radio"
                        name="withdrawToken"
                        value={token}
                        checked={selectedWithdrawToken === token}
                        onChange={(e) =>
                          setSelectedWithdrawToken(
                            e.target.value as CryptoToken
                          )
                        }
                        disabled={!isWalletConnected}
                        className="mr-2"
                      />
                      <Typography.TextSM>{token}</Typography.TextSM>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={!isWalletConnected}
                    min="0"
                    step="any"
                    className={classNames(
                      "block w-40 rounded-md border-0 bg-white/5 px-2 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10",
                      !isWalletConnected && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder="Amount"
                  />
                  <Button
                    onClick={handleWithdraw}
                    disabled={
                      !isWalletConnected ||
                      !withdrawAmount ||
                      isTransactionPending
                    }
                    loading={isWithdrawing}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
