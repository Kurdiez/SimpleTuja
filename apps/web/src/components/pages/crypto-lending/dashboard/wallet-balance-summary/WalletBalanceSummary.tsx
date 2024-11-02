import React from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/common/Typography";
import EtherscanIcon from "@/components/icons/EtherscanIcon";
import EthIcon from "@/components/icons/EthIcon";
import WethIcon from "@/components/icons/WethIcon";
import DaiIcon from "@/components/icons/DaiIcon";
import UsdcIcon from "@/components/icons/UsdcIcon";
import LoadSpinner from "@/components/common/LoadSpinner";
import { useDashboard } from "../dashboard.context";

export const WalletBalanceSummary: React.FC = () => {
  const {
    isLoading,
    tokenBalances,
    walletAddress,
    copyToClipboard,
    calculateTotalUsdBalance,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Typography.TextLG tag="h2">Wallet Address</Typography.TextLG>
        <div className="flex items-center">
          <span className="text-base text-primary font-medium">
            {walletAddress}
          </span>
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={copyToClipboard}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <DocumentDuplicateIcon
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
            </button>
            <a
              href={`https://etherscan.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <EtherscanIcon className="h-5 w-5 text-primary" />
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">Total Balance</Typography.TextLG>
        <dl className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              USD Balance
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {isLoading ? (
                <LoadSpinner className="h-5 w-5 mt-3" />
              ) : (
                new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(calculateTotalUsdBalance())
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">Token Balances</Typography.TextLG>
        <dl className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tokenBalances.map((token) => (
            <div
              key={token.id}
              className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-gray-900/5 dark:bg-gray-700 border border-gray-200/10 dark:border-gray-600/10 p-2">
                  {token.name === "ETH Balance" ? (
                    <EthIcon className="h-8 w-8 text-white" />
                  ) : token.name === "wETH Balance" ? (
                    <WethIcon className="h-8 w-8" />
                  ) : token.name === "DAI Balance" ? (
                    <DaiIcon className="h-8 w-8" />
                  ) : token.name === "USDC Balance" ? (
                    <UsdcIcon className="h-8 w-8" />
                  ) : (
                    <div className="h-8 w-8" />
                  )}
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  {token.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 sm:pb-7">
                {isLoading ? (
                  <LoadSpinner className="h-5 w-5 mt-3" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {token.balance}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
