import AppLayout from "@/components/common/app-layout/AppLayout";
import { HeroSection } from "@/components/pages/crypto-lending/about/HeroSection";
import { WhyUseSTJ } from "@/components/pages/crypto-lending/about/WhyUseSTJ";
import React from "react";

const CryptoLendingAbout: React.FC = () => {
  return (
    <AppLayout pageTitle="Crypto Lending - About">
      <HeroSection className="pt-4 pb-14" />
      <hr className="border-gray-200 dark:border-gray-700" />
      <WhyUseSTJ className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
    </AppLayout>
  );
};

export default CryptoLendingAbout;
