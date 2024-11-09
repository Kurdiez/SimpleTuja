import { InvestmentWalletProvider } from "@/components/common/investment-wallet.context";
import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import { InvestmentWalletActions } from "@/components/pages/crypto-lending/wallet/InvestmentWalletActions";
import { InvestmentWalletBalances } from "@/components/pages/crypto-lending/wallet/InvestmentWalletBalances";
import React from "react";

const CryptoLendingWallet: React.FC = () => {
  const destinationWalletAddress = "0x..."; // Replace with actual destination wallet address

  return (
    <CryptoLendingLayout>
      <InvestmentWalletProvider destinationAddress={destinationWalletAddress}>
        <div className="space-y-8">
          <InvestmentWalletBalances />
          <InvestmentWalletActions />
        </div>
      </InvestmentWalletProvider>
    </CryptoLendingLayout>
  );
};

export default CryptoLendingWallet;
