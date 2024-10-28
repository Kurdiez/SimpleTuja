import React from "react";
import LoanSettingsForm, {
  LoanSettingsSnapshot,
} from "@/components/common/LoanSettingsForm";
import { useOnboarding } from "./onboarding.context";

export default function LoanSettings() {
  const { updateLoanSettings, onboardingProgress } = useOnboarding();

  const handleSubmit = async (data: LoanSettingsSnapshot) => {
    await updateLoanSettings(data);
  };

  const currentSnapshot = !onboardingProgress?.hasCompletedLoanSettings
    ? undefined
    : {
        oneWeekLTV: onboardingProgress?.oneWeekLTV ?? null,
        twoWeeksLTV: onboardingProgress?.twoWeeksLTV ?? null,
        oneMonthLTV: onboardingProgress?.oneMonthLTV ?? null,
        twoMonthsLTV: onboardingProgress?.twoMonthsLTV ?? null,
        threeMonthsLTV: onboardingProgress?.threeMonthsLTV ?? null,
        foreclosureWalletAddress:
          onboardingProgress?.foreclosureWalletAddress ?? "",
      };

  return (
    <LoanSettingsForm onSubmit={handleSubmit} snapshot={currentSnapshot} />
  );
}
