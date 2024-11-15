import { LoansByStatus } from "@/components/common/crypto-lending/LoansByStatus";
import { NftFiLoanStatus } from "@simpletuja/shared";
import React from "react";

const LiquidatedLoans: React.FC = () => {
  return (
    <LoansByStatus
      status={NftFiLoanStatus.Liquidated}
      pageTitle="Crypto Lending - Liquidated Loans"
    />
  );
};

export default LiquidatedLoans;
