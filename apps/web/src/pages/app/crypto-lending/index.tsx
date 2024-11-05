import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import { DashboardProvider } from "@/components/pages/crypto-lending/dashboard/dashboard.context";
import { LoanSummary } from "@/components/pages/crypto-lending/dashboard/LoanSummary";
import { PortfolioBalanceSection } from "@/components/pages/crypto-lending/dashboard/PortfolioBalanceSection";
import { WalletAddressSection } from "@/components/pages/crypto-lending/dashboard/WalletAddressSection";
import { WalletBalanceSummary } from "@/components/pages/crypto-lending/dashboard/WalletBalanceSummary";
import React from "react";

const CryptoLending: React.FC = () => {
  return (
    <CryptoLendingLayout>
      <DashboardProvider>
        <div className="space-y-8">
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

export default CryptoLending;
