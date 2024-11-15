import {
  getCryptoUserState,
  openAccount,
} from "@/utils/simpletuja/crypto-lending";
import { CryptoLendingUserStateDto } from "@simpletuja/shared";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCryptoLending } from "../../../common/crypto-lending/crypto-lending.context";

export enum OnboardingStep {
  OpenCryptoInvestmentAccount = "Open Crypto Investment Account",
  CompleteLoanSettings = "Complete Loan Settings",
  FundAccount = "Fund The Account",
  ActivateLending = "Activate Lending",
}

type OnboardingContextType = {
  onboardingProgress: CryptoLendingUserStateDto;
  currentStep: OnboardingStep;
  openCryptoInvestmentAccount: () => Promise<string>;
  jumpToStep: (step: OnboardingStep) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

type OnboardingProviderProps = {
  children: ReactNode;
};

const getCurrentStep = (
  progress: CryptoLendingUserStateDto
): OnboardingStep => {
  if (progress == null) {
    return OnboardingStep.OpenCryptoInvestmentAccount;
  }

  if (!progress.hasOpenedCryptoInvestmentAccount) {
    return OnboardingStep.OpenCryptoInvestmentAccount;
  }
  if (!progress.hasCompletedLoanSettings) {
    return OnboardingStep.CompleteLoanSettings;
  }
  if (!progress.hasFundedTheAccount) {
    return OnboardingStep.FundAccount;
  }

  return OnboardingStep.ActivateLending;
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const { userState: onboardingProgress } = useCryptoLending();
  const [progress, setProgress] =
    useState<CryptoLendingUserStateDto>(onboardingProgress);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    getCurrentStep(onboardingProgress)
  );

  useEffect(() => {
    setProgress(onboardingProgress);
  }, [onboardingProgress]);

  useEffect(() => {
    setCurrentStep(getCurrentStep(progress));
  }, [progress]);

  const openCryptoInvestmentAccount = useCallback(async () => {
    const walletAddress = await openAccount();
    const newProgress = await getCryptoUserState();
    setProgress(newProgress);
    return walletAddress;
  }, []);

  const jumpToStep = useCallback(
    (step: OnboardingStep) => {
      const stepOrder = [
        OnboardingStep.OpenCryptoInvestmentAccount,
        OnboardingStep.CompleteLoanSettings,
        OnboardingStep.FundAccount,
        OnboardingStep.ActivateLending,
      ];

      const currentStepIndex = stepOrder.indexOf(currentStep);
      const targetStepIndex = stepOrder.indexOf(step);

      // Check if trying to jump to OpenCryptoInvestmentAccount when it's already completed
      if (
        step === OnboardingStep.OpenCryptoInvestmentAccount &&
        progress?.hasOpenedCryptoInvestmentAccount
      ) {
        return;
      }

      // Allow jumping to any completed step or the next incomplete step
      if (
        targetStepIndex <= currentStepIndex ||
        targetStepIndex === currentStepIndex + 1
      ) {
        setCurrentStep(step);
      }
    },
    [currentStep, progress?.hasOpenedCryptoInvestmentAccount]
  );

  return (
    <OnboardingContext.Provider
      value={{
        onboardingProgress: progress,
        currentStep,
        openCryptoInvestmentAccount,
        jumpToStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
