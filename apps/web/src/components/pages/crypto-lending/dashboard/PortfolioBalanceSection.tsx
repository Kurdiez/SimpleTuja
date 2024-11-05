import LoadSpinner from "@/components/common/LoadSpinner";
import { Typography } from "@/components/common/Typography";
import EthIcon from "@/components/icons/EthIcon";
import UsdIcon from "@/components/icons/UsdIcon";
import React from "react";
import { useDashboard } from "./dashboard.context";
import { formatCryptoValue, formatUsdValue } from "./utils";

export const PortfolioBalanceSection: React.FC = () => {
  const { isLoading, computedBalances } = useDashboard();

  if (!computedBalances && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-6 pt-2 pb-6">
      <Typography.DisplayLG tag="h1">Portfolio Balance</Typography.DisplayLG>
      <dl className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-gray-900/5 dark:bg-gray-700 border border-gray-200/10 dark:border-gray-600/10 p-2">
              <UsdIcon className="h-8 w-8 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Total USD Value
            </p>
          </dt>
          <dd className="ml-16 pb-6 sm:pb-7">
            {isLoading ? (
              <LoadSpinner className="h-5 w-5 mt-3" />
            ) : (
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatUsdValue(computedBalances?.portfolioUsdValue ?? 0)}
              </p>
            )}
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-gray-900/5 dark:bg-gray-700 border border-gray-200/10 dark:border-gray-600/10 p-2">
              <EthIcon className="h-8 w-8 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Total ETH Value
            </p>
          </dt>
          <dd className="ml-16 pb-6 sm:pb-7">
            {isLoading ? (
              <LoadSpinner className="h-5 w-5 mt-3" />
            ) : (
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCryptoValue(computedBalances?.portfolioEthValue ?? 0)}
              </p>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
};
