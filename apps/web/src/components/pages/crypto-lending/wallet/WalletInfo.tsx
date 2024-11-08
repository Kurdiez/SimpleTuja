import Button from "@/components/common/Button";
import { useInvestmentWallet } from "@/components/common/investment-wallet.context";
import LoadSpinner from "@/components/common/LoadSpinner";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { CryptoToken } from "@simpletuja/shared";
import classNames from "classnames";
import { useEffect, useState } from "react";

export const WalletInfo: React.FC = () => {
  const {
    isWalletConnected,
    connectSenderWallet,
    depositErc20Token,
    depositEth,
    getTokenBalance,
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

  const [ethBalance, setEthBalance] = useState("0.00");
  const [wethBalance, setWethBalance] = useState("0.00");
  const [daiBalance, setDaiBalance] = useState("0.00");
  const [usdcBalance, setUsdcBalance] = useState("0.00");

  const [ethLoading, setEthLoading] = useState(false);
  const [wethLoading, setWethLoading] = useState(false);
  const [daiLoading, setDaiLoading] = useState(false);
  const [usdcLoading, setUsdcLoading] = useState(false);

  useEffect(() => {
    const loadBalance = async (
      token: CryptoToken,
      setBalance: (value: string) => void,
      setLoading: (value: boolean) => void
    ) => {
      setLoading(true);
      try {
        const balance = await getTokenBalance(token);
        setBalance(balance);
      } catch (error) {
        console.error(`Error loading ${token} balance:`, error);
        setBalance("0.00");
      } finally {
        setLoading(false);
      }
    };

    loadBalance(CryptoToken.ETH, setEthBalance, setEthLoading);
    loadBalance(CryptoToken.WETH, setWethBalance, setWethLoading);
    loadBalance(CryptoToken.DAI, setDaiBalance, setDaiLoading);
    loadBalance(CryptoToken.USDC, setUsdcBalance, setUsdcLoading);
  }, []);

  const BalanceDisplay: React.FC<{ token: CryptoToken }> = ({ token }) => {
    const getBalanceAndLoading = (token: CryptoToken): [string, boolean] => {
      switch (token) {
        case CryptoToken.ETH:
          return [ethBalance, ethLoading];
        case CryptoToken.WETH:
          return [wethBalance, wethLoading];
        case CryptoToken.DAI:
          return [daiBalance, daiLoading];
        case CryptoToken.USDC:
          return [usdcBalance, usdcLoading];
      }
    };

    const [balance, loading] = getBalanceAndLoading(token);

    return (
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm/6 font-medium text-white">{token} Balance</dt>
        <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
          {loading ? (
            <div className="flex justify-start">
              <LoadSpinner className="h-4 w-4" />
            </div>
          ) : (
            `${balance} ${token}`
          )}
        </dd>
      </div>
    );
  };

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
    if (!withdrawAmount) return;

    try {
      setIsWithdrawing(true);
      // TODO: Implement withdraw functionality
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
        <h3 className="text-base/7 font-semibold text-white">Wallet</h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-400">
          Please ensure you have enough ETH in your wallet to cover GAS fees for
          withdrawals.
        </p>
      </div>

      <div className="mt-6 border-t border-white/10">
        <dl className="divide-y divide-white/10">
          {/* Token Balances */}
          <BalanceDisplay token={CryptoToken.ETH} />
          <BalanceDisplay token={CryptoToken.WETH} />
          <BalanceDisplay token={CryptoToken.DAI} />
          <BalanceDisplay token={CryptoToken.USDC} />

          {/* Connect Wallet */}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-white">Connect Wallet</dt>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              {isWalletConnected ? (
                <div className="w-32 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white bg-green-600 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Connected
                </div>
              ) : (
                <Button onClick={connectSenderWallet}>Connect Wallet</Button>
              )}
            </dd>
          </div>

          {/* Deposit Funds */}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-white">Deposit Funds</dt>
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
                      {token}
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
                    disabled={!isWalletConnected || !depositAmount}
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
            <dt className="text-sm/6 font-medium text-white">Withdraw Funds</dt>
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
                      {token}
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
                    disabled={!isWalletConnected || !withdrawAmount}
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
