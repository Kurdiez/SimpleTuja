import React from "react";
import { FundAccountProvider } from "@/components/common/fund-account/fund-account.context";
import FundAccountForm from "@/components/common/fund-account/FundAccountForm";

interface FundAccountProps {
  destinationAddress: string;
}

export const FundAccount: React.FC<FundAccountProps> = ({
  destinationAddress,
}) => {
  const handleFunded = () => {
    console.log("Account funded successfully");
    // Add any additional logic here
  };

  return (
    <FundAccountProvider
      destinationAddress={destinationAddress}
      onFunded={handleFunded}
    >
      <FundAccountForm classNames="mt-16 mb-14" />
    </FundAccountProvider>
  );
};

export default FundAccount;
