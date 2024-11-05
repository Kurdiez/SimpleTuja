import LoadSpinner from "@/components/common/LoadSpinner";
import { Typography } from "@/components/common/Typography";
import DaiIcon from "@/components/icons/DaiIcon";
import EtherscanIcon from "@/components/icons/EtherscanIcon";
import EthIcon from "@/components/icons/EthIcon";
import UsdcIcon from "@/components/icons/UsdcIcon";
import WethIcon from "@/components/icons/WethIcon";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { CryptoToken } from "@simpletuja/shared";
import React from "react";
import { useDashboard } from "../dashboard.context";

const formatBalance = (balance: string | undefined) => {
  if (!balance) return "0";
  const num = parseFloat(balance);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
};

export const WalletBalanceSummary: React.FC = () => {
  const { isLoading, walletAddress, computedBalances, copyToClipboard } =
    useDashboard();

  if (!computedBalances && !isLoading) {
    return null;
  }

  const tokenConfigs = [
    {
      id: 1,
      name: "ETH",
      token: CryptoToken.ETH,
      icon: EthIcon,
      getBalance: () => formatBalance(computedBalances?.ethBalance),
    },
    {
      id: 2,
      name: "wETH",
      token: CryptoToken.WETH,
      icon: WethIcon,
      getBalance: () => formatBalance(computedBalances?.wethBalance),
    },
    {
      id: 3,
      name: "DAI",
      token: CryptoToken.DAI,
      icon: DaiIcon,
      getBalance: () => formatBalance(computedBalances?.daiBalance),
    },
    {
      id: 4,
      name: "USDC",
      token: CryptoToken.USDC,
      icon: UsdcIcon,
      getBalance: () => formatBalance(computedBalances?.usdcBalance),
    },
  ];

  return (
    <div className="space-y-6">
      <Typography.DisplayLG tag="h1" className="mb-4">
        Cash Balance
      </Typography.DisplayLG>

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
                }).format(computedBalances?.totalUsdBalance || 0)
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
                      {config.getBalance()}
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
