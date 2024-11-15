import AppLayout from "@/components/common/app-layout/AppLayout";
import { useCryptoLending } from "@/components/common/crypto-lending/crypto-lending.context";
import { InvestmentWalletProvider } from "@/components/common/crypto-lending/investment-wallet.context";
import { InvestmentWalletActions } from "@/components/pages/crypto-lending/wallet/InvestmentWalletActions";
import { InvestmentWalletBalances } from "@/components/pages/crypto-lending/wallet/InvestmentWalletBalances";
import React, { useMemo } from "react";

const CryptoLendingWalletImpl = () => {
  const { userState } = useCryptoLending();
  const destinationWalletAddress = useMemo(
    () => userState?.walletAddress ?? "",
    [userState?.walletAddress]
  );

  return (
    <InvestmentWalletProvider destinationAddress={destinationWalletAddress}>
      <div className="space-y-8">
        <InvestmentWalletBalances />
        <InvestmentWalletActions />
      </div>
    </InvestmentWalletProvider>
  );
};

const CryptoLendingWallet: React.FC = () => {
  return (
    <AppLayout pageTitle="Crypto Lending - Investment Wallet">
      <CryptoLendingWalletImpl />
    </AppLayout>
  );
};

export default CryptoLendingWallet;
