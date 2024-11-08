import { AppRoute } from "@/utils/app-route";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import AppLayout from "../../common/app-layout/AppLayout";
import { TabHeader } from "../../common/TabHeader";
import {
  CryptoLendingProvider,
  useCryptoLending,
} from "./crypto-lending.context";

const StaticPages = new Set<string>([
  AppRoute.CryptoLendingAbout,
  AppRoute.CryptoLendingWallet,
]);

const CryptoLendingLayoutContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { isOnboardingComplete, isLoading } = useCryptoLending();

  const onboardingTabs = useMemo(
    () => [
      {
        name: "Onboarding",
        href: AppRoute.CryptoLendingOnboarding,
        current: router.pathname === AppRoute.CryptoLendingOnboarding,
      },
      {
        name: "About",
        href: "/app/crypto-lending/onboarding/about",
        current: router.pathname === "/app/crypto-lending/onboarding/about",
      },
    ],
    [router.pathname]
  );

  const completedTabs = useMemo(
    () => [
      {
        name: "Dashboard",
        href: AppRoute.CryptoLending,
        current: router.pathname === AppRoute.CryptoLending,
      },
      {
        name: "About",
        href: AppRoute.CryptoLendingAbout,
        current: router.pathname === AppRoute.CryptoLendingAbout,
      },
      {
        name: "Wallet",
        href: AppRoute.CryptoLendingWallet,
        current: router.pathname === AppRoute.CryptoLendingWallet,
      },
      {
        name: "Settings",
        href: AppRoute.CryptoLendingSettings,
        current: router.pathname === AppRoute.CryptoLendingSettings,
      },
    ],
    [router.pathname]
  );

  const shouldRender = useMemo(() => {
    let shouldRender = true;
    if (isLoading && !StaticPages.has(router.pathname)) {
      shouldRender = false;
    }

    if (
      !isOnboardingComplete &&
      router.pathname !== AppRoute.CryptoLendingOnboarding &&
      router.pathname !== AppRoute.CryptoLendingAbout
    ) {
      shouldRender = false;
    }

    return shouldRender;
  }, [isLoading, isOnboardingComplete, router.pathname]);

  const isOnboardingRoute = router.pathname.startsWith(
    "/app/crypto-lending/onboarding"
  );

  return (
    <div className="container mx-auto">
      <TabHeader
        title="Crypto P2P Lending"
        tabs={!isOnboardingRoute ? completedTabs : onboardingTabs}
      />
      <div className="mt-6">{shouldRender ? children : null}</div>
    </div>
  );
};

export const CryptoLendingLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <AppLayout>
      <CryptoLendingProvider>
        <CryptoLendingLayoutContent>{children}</CryptoLendingLayoutContent>
      </CryptoLendingProvider>
    </AppLayout>
  );
};
