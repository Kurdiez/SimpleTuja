import { useRouter } from "next/router";
import React from "react";
import AppLayout from "../../common/app-layout/AppLayout";
import { TabHeader } from "../../common/TabHeader";
import { CryptoLendingProvider } from "./crypto-lending.context";

type CryptoLendingLayoutProps = {
  children: React.ReactNode;
};

export const CryptoLendingLayout: React.FC<CryptoLendingLayoutProps> = ({
  children,
}) => {
  const router = useRouter();

  const tabs = [
    {
      name: "Dashboard",
      href: "/app/crypto-lending",
      current: router.pathname === "/app/crypto-lending",
    },
    {
      name: "About",
      href: "/app/crypto-lending/about",
      current: router.pathname === "/app/crypto-lending/about",
    },
    {
      name: "Settings",
      href: "/app/crypto-lending/settings",
      current: router.pathname === "/app/crypto-lending/settings",
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto">
        <TabHeader title="Crypto P2P Lending" tabs={tabs} />
        <div className="mt-6">
          <CryptoLendingProvider>{children}</CryptoLendingProvider>
        </div>
      </div>
    </AppLayout>
  );
};
