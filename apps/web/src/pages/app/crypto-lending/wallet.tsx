import { InvestmentWalletProvider } from "@/components/common/investment-wallet.context";
import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import { WalletInfo } from "@/components/pages/crypto-lending/wallet/WalletInfo";
import React from "react";

const CryptoLendingWallet: React.FC = () => {
  // TODO: Get this from your configuration or context
  const destinationWalletAddress = "0x..."; // Replace with actual destination wallet address

  return (
    <CryptoLendingLayout>
      <InvestmentWalletProvider destinationAddress={destinationWalletAddress}>
        <WalletInfo />
      </InvestmentWalletProvider>
    </CryptoLendingLayout>
  );
};

export default CryptoLendingWallet;
