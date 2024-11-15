import LoadSpinner from "@/components/common/LoadSpinner";
import { Typography } from "@/components/common/Typography";
import DaiIcon from "@/components/icons/DaiIcon";
import UsdcIcon from "@/components/icons/UsdcIcon";
import UsdIcon from "@/components/icons/UsdIcon";
import WethIcon from "@/components/icons/WethIcon";
import { AppRoute } from "@/utils/app-route";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";
import { ComputedBalances, useDashboard } from "./dashboard.context";
import { formatCryptoValue, formatUsdValue } from "./utils";

const loanStatusConfigs = [
  {
    id: 1,
    name: "Active Offers",
    getValue: (balances: ComputedBalances) => balances.activeOffers,
  },
  {
    id: 2,
    name: "Active Loans",
    getValue: (balances: ComputedBalances) => balances.activeLoans,
  },
  {
    id: 3,
    name: "Repaid Loans",
    getValue: (balances: ComputedBalances) => balances.repaidLoans,
  },
  {
    id: 4,
    name: "Liquidated Loans",
    getValue: (balances: ComputedBalances) => balances.liquidatedLoans,
  },
];

const tokenConfigs = [
  {
    id: 1,
    name: "Total in USD",
    icon: UsdIcon,
    getPrincipal: (balances: ComputedBalances) =>
      formatUsdValue(balances.totalActiveLoanPrincipalUsd),
    getRepayment: (balances: ComputedBalances) =>
      formatUsdValue(balances.totalActiveLoansRepaymentUsd),
  },
  {
    id: 2,
    name: "wETH",
    icon: WethIcon,
    getPrincipal: (balances: ComputedBalances) =>
      formatCryptoValue(balances.wethActiveLoansPrincipal),
    getRepayment: (balances: ComputedBalances) =>
      formatCryptoValue(balances.wethActiveLoansRepayment),
  },
  {
    id: 3,
    name: "DAI",
    icon: DaiIcon,
    getPrincipal: (balances: ComputedBalances) =>
      formatCryptoValue(balances.daiActiveLoansPrincipal),
    getRepayment: (balances: ComputedBalances) =>
      formatCryptoValue(balances.daiActiveLoansRepayment),
  },
  {
    id: 4,
    name: "USDC",
    icon: UsdcIcon,
    getPrincipal: (balances: ComputedBalances) =>
      formatCryptoValue(balances.usdcActiveLoansPrincipal),
    getRepayment: (balances: ComputedBalances) =>
      formatCryptoValue(balances.usdcActiveLoansRepayment),
  },
];

export const LoanSummary: React.FC = () => {
  const { isLoading, computedBalances } = useDashboard();

  if (!computedBalances && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-6 pt-2 pb-6">
      <Typography.DisplayLG tag="h1" className="mb-4">
        Loans
      </Typography.DisplayLG>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">Life Time Summary</Typography.TextLG>
        <dl className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loanStatusConfigs.map((config) => (
            <div
              key={config.id}
              className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-white/10 px-4 py-5 shadow sm:p-6"
            >
              <dt className="flex justify-between items-center">
                <span className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  {config.name}
                </span>
                {config.name === "Active Offers" && (
                  <Link
                    href={AppRoute.CryptoLendingActiveLoanOffers}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </Link>
                )}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {isLoading ? (
                  <LoadSpinner className="h-5 w-5 mt-3" />
                ) : (
                  computedBalances && config.getValue(computedBalances)
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">Active Loan Principals</Typography.TextLG>
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
                      {computedBalances &&
                        config.getPrincipal(computedBalances)}
                    </p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="space-y-2">
        <Typography.TextLG tag="h2">
          Active Loan Expected Repayments
        </Typography.TextLG>
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
                      {computedBalances &&
                        config.getRepayment(computedBalances)}
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
