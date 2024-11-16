import React from "react";

interface LoansTableHeaderProps {
  hasDefaultedLoans: boolean;
  hasTransferredOrLiquidatedLoans: boolean;
  hasTransferFailedLoans: boolean;
  hasLiquidationFailedLoans: boolean;
}

export const LoansTableHeader: React.FC<LoansTableHeaderProps> = ({
  hasDefaultedLoans,
  hasTransferredOrLiquidatedLoans,
  hasTransferFailedLoans,
  hasLiquidationFailedLoans,
}) => {
  return (
    <thead>
      <tr>
        <th
          scope="col"
          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-0"
        >
          NFT
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          Collection
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          Token ID
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          Currency
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          Principal
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          APR
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          Repayment
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
        >
          Due Date
        </th>
        {hasDefaultedLoans && (
          <th
            scope="col"
            className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
          >
            Default
          </th>
        )}
        {hasTransferredOrLiquidatedLoans && (
          <th
            scope="col"
            className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
          >
            Transferred to Foreclosure Wallet
          </th>
        )}
        {hasTransferFailedLoans && (
          <th
            scope="col"
            className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
          >
            Transfer Fail Reason
          </th>
        )}
        {hasLiquidationFailedLoans && (
          <>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
            >
              Liquidation Fail
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
            >
              Liquidation Fail Reason
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};
