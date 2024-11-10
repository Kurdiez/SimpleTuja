import { InvestmentWalletProvider } from "@/components/common/investment-wallet.context";
import { useCryptoLending } from "@/components/pages/crypto-lending/crypto-lending.context";
import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
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
    <CryptoLendingLayout>
      <CryptoLendingWalletImpl />
    </CryptoLendingLayout>
  );
};

export default CryptoLendingWallet;
