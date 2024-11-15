import React from "react";
import OnboardingProgressIndicator from "../../../common/crypto-lending/OnboardingProgressIndicator";
import ActivateLending from "./ActivateLending";
import FundAccount from "./FundAccount";
import LoanSettings from "./LoanSettings";
import {
  OnboardingProvider,
  OnboardingStep,
  useOnboarding,
} from "./onboarding.context";
import OpenAccountCTA from "./OpenAccountCTA";

const OnboardingContent: React.FC = () => {
  const { currentStep, onboardingProgress } = useOnboarding();

  return (
    <>
      <OnboardingProgressIndicator />
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

const Onboarding = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default Onboarding;
