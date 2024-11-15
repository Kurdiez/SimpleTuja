import { InvestmentWalletProvider } from "@/components/common/crypto-lending/investment-wallet.context";
import { completeOnboardingFundAccount } from "@/utils/simpletuja/crypto-lending";
import React from "react";
import FundAccountForm from "./FundAccountForm";
import { OnboardingStep, useOnboarding } from "./onboarding.context";

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
