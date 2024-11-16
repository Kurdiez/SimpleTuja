import { CryptoLoan, NftFiLoanStatus } from "@simpletuja/shared";
import React from "react";
import { LoansTableHeader } from "./LoansTableHeader";
import { LoanTableRow } from "./LoanTableRow";

interface LoansTableProps {
  loans: CryptoLoan[];
}

export const LoansTable: React.FC<LoansTableProps> = ({ loans }) => {
  const {
    hasDefaultedLoans,
    hasTransferredOrLiquidatedLoans,
    hasTransferFailedLoans,
    hasLiquidationFailedLoans,
  } = loans.reduce(
    (acc, loan) => ({
      hasDefaultedLoans:
        acc.hasDefaultedLoans || loan.status === NftFiLoanStatus.Defaulted,
      hasTransferredOrLiquidatedLoans:
        acc.hasTransferredOrLiquidatedLoans ||
        [
          NftFiLoanStatus.Liquidated,
          NftFiLoanStatus.NftTransferred,
          NftFiLoanStatus.NftTransferFailed,
        ].includes(loan.status),
      hasTransferFailedLoans:
        acc.hasTransferFailedLoans ||
        loan.status === NftFiLoanStatus.NftTransferFailed,
      hasLiquidationFailedLoans:
        acc.hasLiquidationFailedLoans ||
        loan.status === NftFiLoanStatus.LiquidationFailed,
    }),
    {
      hasDefaultedLoans: false,
      hasTransferredOrLiquidatedLoans: false,
      hasTransferFailedLoans: false,
      hasLiquidationFailedLoans: false,
    }
  );

  return (
    <div className="-mx-4 mt-8 sm:-mx-0 overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-700">
          <LoansTableHeader
            hasDefaultedLoans={hasDefaultedLoans}
            hasTransferredOrLiquidatedLoans={hasTransferredOrLiquidatedLoans}
            hasTransferFailedLoans={hasTransferFailedLoans}
            hasLiquidationFailedLoans={hasLiquidationFailedLoans}
          />
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            {loans.map((loan) => (
              <LoanTableRow
                key={loan.id}
                loan={loan}
                hasDefaultedLoans={hasDefaultedLoans}
                hasTransferredOrLiquidatedLoans={
                  hasTransferredOrLiquidatedLoans
                }
                hasTransferFailedLoans={hasTransferFailedLoans}
                hasLiquidationFailedLoans={hasLiquidationFailedLoans}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
