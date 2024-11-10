import LoadSpinner from "@/components/common/LoadSpinner";
import { Typography } from "@/components/common/Typography";
import DaiIcon from "@/components/icons/DaiIcon";
import EthIcon from "@/components/icons/EthIcon";
import UsdcIcon from "@/components/icons/UsdcIcon";
import UsdIcon from "@/components/icons/UsdIcon";
import WethIcon from "@/components/icons/WethIcon";
import { CryptoToken } from "@simpletuja/shared";
import React from "react";
import { ComputedBalances, useDashboard } from "./dashboard.context";
import { formatCryptoValue, formatUsdValue } from "./utils";

const tokenConfigs = [
  {
    id: 1,
    name: "ETH",
    token: CryptoToken.ETH,
    icon: EthIcon,
    getBalance: (balances: ComputedBalances) =>
      formatCryptoValue(balances.ethBalance),
  },
  {
    id: 2,
    name: "wETH",
    token: CryptoToken.WETH,
    icon: WethIcon,
    getBalance: (balances: ComputedBalances) =>
      formatCryptoValue(balances.wethBalance),
  },
  {
    id: 3,
    name: "DAI",
    token: CryptoToken.DAI,
    icon: DaiIcon,
    getBalance: (balances: ComputedBalances) =>
      formatCryptoValue(balances.daiBalance),
  },
  {
    id: 4,
    name: "USDC",
    token: CryptoToken.USDC,
    icon: UsdcIcon,
    getBalance: (balances: ComputedBalances) =>
      formatCryptoValue(balances.usdcBalance),
  },
];

export const WalletBalanceSummary: React.FC = () => {
  const { isLoading, computedBalances } = useDashboard();

  if (!computedBalances && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-6 pb-4">
      <Typography.DisplayLG tag="h1">Cash Balance</Typography.DisplayLG>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">Total Balance</Typography.TextLG>
        <dl className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-gray-900/5 dark:bg-gray-700 border border-gray-200/10 dark:border-gray-600/10 p-2">
                <UsdIcon className="h-8 w-8 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                Total in USD
              </p>
            </dt>
            <dd className="ml-16 pb-6 sm:pb-7">
              {isLoading ? (
                <LoadSpinner className="h-5 w-5 mt-3" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatUsdValue(computedBalances?.totalUsdBalance ?? 0)}
                </p>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">Token Balances</Typography.TextLG>
        <dl className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tokenConfigs.map((config) => {
            const Icon = config.icon;
            return (
              <div
                key={config.id}
                className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 pt-5 shadow sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-md bg-gray-900/5 dark:bg-gray-700 border border-gray-200/10 dark:border-gray-600/10 p-2">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    {config.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 sm:pb-7">
                  {isLoading ? (
                    <LoadSpinner className="h-5 w-5 mt-3" />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {computedBalances && config.getBalance(computedBalances)}
                    </p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};
