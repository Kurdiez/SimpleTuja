import React from "react";
import FundAccountForm from "./FundAccountForm";
import { InvestmentWalletProvider } from "@/components/common/investment-wallet.context";
import { OnboardingStep, useOnboarding } from "./onboarding.context";
import { completeOnboardingFundAccount } from "@/utils/simpletuja/crypto-lending";

interface FundAccountProps {
  destinationAddress: string;
}

export const FundAccount: React.FC<FundAccountProps> = ({
  destinationAddress,
}) => {
  const { jumpToStep } = useOnboarding();

  const onActivateLending = () => {
    completeOnboardingFundAccount();
    jumpToStep(OnboardingStep.ActivateLending);
  };

  return (
    <InvestmentWalletProvider destinationAddress={destinationAddress}>
      <FundAccountForm
        classNames="mt-16 mb-14"
        onActivateLending={onActivateLending}
      />
    </InvestmentWalletProvider>
  );
};

export default FundAccount;
