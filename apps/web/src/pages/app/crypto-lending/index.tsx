import React from "react";
import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import { WalletBalanceSummary } from "@/components/pages/crypto-lending/dashboard/wallet-balance-summary/WalletBalanceSummary";
import { Typography } from "@/components/common/Typography";
import { DashboardProvider } from "@/components/pages/crypto-lending/dashboard/dashboard.context";

const CryptoLending: React.FC = () => {
  return (
    <CryptoLendingLayout>
      <DashboardProvider>
        <Typography.DisplayXL className="mb-6">Dashboard</Typography.DisplayXL>
        <WalletBalanceSummary />
      </DashboardProvider>
    </CryptoLendingLayout>
  );
};

export default CryptoLending;
