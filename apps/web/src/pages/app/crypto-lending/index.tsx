import AppLayout from "@/components/common/app-layout/AppLayout";
import { Callout } from "@/components/common/Callout";
import { DashboardProvider } from "@/components/pages/crypto-lending/dashboard/dashboard.context";
import { LoanSummary } from "@/components/pages/crypto-lending/dashboard/LoanSummary";
import { PortfolioBalanceSection } from "@/components/pages/crypto-lending/dashboard/PortfolioBalanceSection";
import { WalletAddressSection } from "@/components/pages/crypto-lending/dashboard/WalletAddressSection";
import { WalletBalanceSummary } from "@/components/pages/crypto-lending/dashboard/WalletBalanceSummary";
import React from "react";

const CryptoLendingDashboard: React.FC = () => {
  return (
    <AppLayout pageTitle="Crypto Lending - Dashboard">
      <DashboardProvider>
        <div className="space-y-8">
          <Callout type="info">
            Please note: All data is updated every 3 hours and will not reflect
            real-time values.
          </Callout>
          <WalletAddressSection />
          <hr className="border-gray-200 dark:border-gray-700" />
          <PortfolioBalanceSection />
          <hr className="border-gray-200 dark:border-gray-700" />
          <LoanSummary />
          <hr className="border-gray-200 dark:border-gray-700" />
          <WalletBalanceSummary />
        </div>
      </DashboardProvider>
    </AppLayout>
  );
};

export default CryptoLendingDashboard;
