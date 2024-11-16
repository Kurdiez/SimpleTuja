import { LoansByStatus } from "@/components/common/crypto-lending/view-loans/LoansByStatus";
import { NftFiLoanStatus } from "@simpletuja/shared";
import React from "react";

const RepaidLoans: React.FC = () => {
  return (
    <LoansByStatus
      status={NftFiLoanStatus.Repaid}
      pageTitle="Crypto Lending - Repaid Loans"
    />
  );
};

export default RepaidLoans;
