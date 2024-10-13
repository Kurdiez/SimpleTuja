import React from "react";
import {
  useOnboarding,
  OnboardingStep,
} from "@/components/pages/crypto-lending/onboarding/onboarding.context";

export enum StepStatus {
  Complete = "complete",
  Current = "current",
  Upcoming = "upcoming",
}

export interface Step {
  name: string;
  status: StepStatus;
  onboardingStep: OnboardingStep;
}

const ProgressIndicator: React.FC = () => {
  const { currentStep, jumpToStep } = useOnboarding();

  const steps: Step[] = [
    {
      name: "Open Crypto Investment Account",
      status: getStepStatus(
        OnboardingStep.OpenCryptoInvestmentAccount,
        currentStep
      ),
      onboardingStep: OnboardingStep.OpenCryptoInvestmentAccount,
    },
    {
      name: "Complete Loan Settings",
      status: getStepStatus(OnboardingStep.CompleteLoanSettings, currentStep),
      onboardingStep: OnboardingStep.CompleteLoanSettings,
    },
    {
      name: "Fund The Account",
      status: getStepStatus(OnboardingStep.FundTheAccount, currentStep),
      onboardingStep: OnboardingStep.FundTheAccount,
    },
  ];

  function getStepStatus(
    step: OnboardingStep,
    currentStep: OnboardingStep
  ): StepStatus {
    const stepOrder = Object.values(OnboardingStep);
    const stepIndex = stepOrder.indexOf(step);
    const currentStepIndex = stepOrder.indexOf(currentStep);

    if (stepIndex < currentStepIndex) return StepStatus.Complete;
    if (stepIndex === currentStepIndex) return StepStatus.Current;
    return StepStatus.Upcoming;
  }

  const handleStepClick = (step: OnboardingStep) => {
    if (step !== currentStep) {
      jumpToStep(step);
    }
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.name} className="md:flex-1">
            <button
              onClick={() => handleStepClick(step.onboardingStep)}
              className={`group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                step.status !== StepStatus.Upcoming
                  ? "border-primary hover:border-primary-light cursor-pointer"
                  : "border-gray-200 cursor-default"
              }`}
              aria-current={
                step.status === StepStatus.Current ? "step" : undefined
              }
              disabled={step.status === StepStatus.Upcoming}
            >
              <span
                className={`text-sm font-medium ${
                  step.status !== StepStatus.Upcoming
                    ? "text-primary group-hover:text-primary-light"
                    : "text-gray-500"
                }`}
              >
                {`Step ${index + 1}`}
              </span>
              <span className="text-sm font-medium">{step.name}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ProgressIndicator;
