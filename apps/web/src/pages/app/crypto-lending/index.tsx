import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import { DashboardProvider } from "@/components/pages/crypto-lending/dashboard/dashboard.context";
import { LoanSummary } from "@/components/pages/crypto-lending/dashboard/LoanSummary";
import { PortfolioBalanceSection } from "@/components/pages/crypto-lending/dashboard/PortfolioBalanceSection";
import { WalletAddressSection } from "@/components/pages/crypto-lending/dashboard/WalletAddressSection";
import { WalletBalanceSummary } from "@/components/pages/crypto-lending/dashboard/WalletBalanceSummary";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

const CryptoLendingDashboard: React.FC = () => {
  return (
    <CryptoLendingLayout>
      <DashboardProvider>
        <div className="space-y-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5" />
              Please note: Dashboard data is updated every 12 hours and may not
              reflect real-time values.
            </p>
          </div>
          <WalletAddressSection />
          <hr className="border-gray-200 dark:border-gray-700" />
          <PortfolioBalanceSection />
          <hr className="border-gray-200 dark:border-gray-700" />
          <LoanSummary />
          <hr className="border-gray-200 dark:border-gray-700" />
          <WalletBalanceSummary />
        </div>
      </DashboardProvider>
    </CryptoLendingLayout>
  );
};

export default CryptoLendingDashboard;
