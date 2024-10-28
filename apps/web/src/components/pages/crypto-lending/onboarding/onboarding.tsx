import React from "react";
import ProgressIndicator from "../../../common/ProgressIndicator";
import {
  OnboardingProvider,
  OnboardingStep,
  useOnboarding,
} from "./onboarding.context";
import { CryptoLendingUserStateDto } from "@simpletuja/shared";
import OpenAccountCTA from "./OpenAccountCTA";
import LoanSettings from "./LoanSettings";
import FundAccount from "./FundAccount";
import ActivateLending from "./ActivateLending";

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
      {currentStep === OnboardingStep.ActivateLending && <ActivateLending />}
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
