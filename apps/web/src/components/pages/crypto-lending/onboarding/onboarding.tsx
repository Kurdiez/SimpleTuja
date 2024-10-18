import React from "react";
import ProgressIndicator from "../../../common/ProgressIndicator";
import {
  OnboardingProvider,
  OnboardingStep,
  useOnboarding,
} from "./onboarding.context";
import { CryptoLendingUserStateDto } from "@simpletuja/shared";
import OpenAccountCTA from "./open-account-cta";
import LoanSettings from "./loan-settings";
import FundAccount from "./fund-account";

interface OnboardingProps {
  onboardingProgress: CryptoLendingUserStateDto | null;
}

const OnboardingContent: React.FC = () => {
  const { currentStep, onboardingProgress } = useOnboarding();

  return (
    <>
      <ProgressIndicator />
      {currentStep === OnboardingStep.OpenCryptoInvestmentAccount && (
        <OpenAccountCTA />
      )}
      {currentStep === OnboardingStep.CompleteLoanSettings && <LoanSettings />}
      {currentStep === OnboardingStep.FundAccount && (
        <FundAccount destinationAddress={onboardingProgress!.walletAddress!} />
      )}
    </>
  );
};

const Onboarding: React.FC<OnboardingProps> = ({ onboardingProgress }) => {
  return (
    <OnboardingProvider onboardingProgress={onboardingProgress}>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default Onboarding;
