import { LoansByStatus } from "@/components/common/crypto-lending/view-loans/LoansByStatus";
import { NftFiLoanStatus } from "@simpletuja/shared";
import React from "react";

const ActiveLoans: React.FC = () => {
  return (
    <LoansByStatus
      status={NftFiLoanStatus.Active}
      pageTitle="Crypto Lending - Active Loans"
    />
  );
};

export default ActiveLoans;
