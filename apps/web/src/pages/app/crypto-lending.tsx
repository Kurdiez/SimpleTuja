import React, { useEffect, useState } from "react";
import AppLayout from "../../components/common/app-layout/AppLayout";
import CryptoLendingDescription from "../../components/pages/crypto-lending/CryptoLendingDescription";
import { CryptoLendingUserStateDto } from "@simpletuja/shared";
import { getOnboardingProgress } from "@/utils/simpletuja/cypto-lending";
import Onboarding from "@/components/pages/crypto-lending/onboarding/onboarding";

const CryptoLending: React.FC = () => {
  const [onboardingProgress, setOnboardingProgress] =
    useState<CryptoLendingUserStateDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      try {
        const progress = await getOnboardingProgress();
        setOnboardingProgress(progress);
      } catch (error) {
        console.error("Error fetching onboarding progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnboardingProgress();
  }, []);

  const isOnboardingComplete =
    onboardingProgress != null &&
    onboardingProgress.hasOpenedCryptoInvestmentAccount &&
    onboardingProgress.hasCompletedLoanSettings &&
    onboardingProgress.hasFundedTheAccount;

  return (
    <AppLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Crypto P2P Lending</h1>
        <div className="mb-14">
          <CryptoLendingDescription />
        </div>
        {isLoading ? (
          <div></div>
        ) : !isOnboardingComplete ? (
          <Onboarding onboardingProgress={onboardingProgress} />
        ) : (
          <p>Onboarding completed. Ready to start lending!</p>
        )}
      </div>
    </AppLayout>
  );
};

export default CryptoLending;
