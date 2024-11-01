import React from "react";
import AppLayout from "../../common/app-layout/AppLayout";
import CryptoLendingDescription from "./CryptoLendingDescription";
import { CryptoLendingProvider } from "./crypto-lending.context";

type CryptoLendingLayoutProps = {
  children: React.ReactNode;
};

export const CryptoLendingLayout: React.FC<CryptoLendingLayoutProps> = ({
  children,
}) => {
  return (
    <AppLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Crypto P2P Lending</h1>
        <div className="mb-14">
          <CryptoLendingDescription />
        </div>
        <CryptoLendingProvider>{children}</CryptoLendingProvider>
      </div>
    </AppLayout>
  );
};
