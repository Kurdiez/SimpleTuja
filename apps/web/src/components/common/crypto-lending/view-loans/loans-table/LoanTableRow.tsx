import BlurIcon from "@/components/icons/BlurIcon";
import OpenseaIcon from "@/components/icons/OpenseaIcon";
import {
  formatApr,
  formatDateTime,
  formatEther,
  getLiquidationFailReason,
  getTransferFailReason,
  getTransferStatus,
} from "@/utils/formatters";
import { CryptoLoan, NftFiLoanStatus } from "@simpletuja/shared";
import React from "react";
import { LoanMobileDetails } from "./LoanMobileDetails";

interface LoanTableRowProps {
  loan: CryptoLoan;
  hasDefaultedLoans: boolean;
  hasTransferredOrLiquidatedLoans: boolean;
  hasTransferFailedLoans: boolean;
  hasLiquidationFailedLoans: boolean;
}

export const LoanTableRow: React.FC<LoanTableRowProps> = ({
  loan,
  hasDefaultedLoans,
  hasTransferredOrLiquidatedLoans,
  hasTransferFailedLoans,
  hasLiquidationFailedLoans,
}) => {
  const getOpenSeaAssetUrl = (contractAddress: string, tokenId: string) =>
    `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;

  const getBlurAssetUrl = (contractAddress: string, tokenId: string) =>
    `https://blur.io/eth/asset/${contractAddress}/${tokenId}`;

  return (
    <tr>
      <td className="py-4 pl-4 pr-3 text-sm sm:pl-0">
        <div className="flex items-center lg:items-start">
          <div className="h-32 w-32 lg:h-10 lg:w-10 flex-shrink-0 self-center lg:self-start">
            <img
              className="h-full w-full rounded-full object-cover"
              src={loan.nftImageUrl}
              alt={`${loan.nftCollection.name} #${loan.nftTokenId}`}
              width={128}
              height={128}
            />
          </div>
          <div className="ml-4 lg:hidden w-full">
            <LoanMobileDetails
              loan={loan}
              hasDefaultedLoans={hasDefaultedLoans}
              hasTransferredOrLiquidatedLoans={hasTransferredOrLiquidatedLoans}
              hasTransferFailedLoans={hasTransferFailedLoans}
              hasLiquidationFailedLoans={hasLiquidationFailedLoans}
            />
          </div>
        </div>
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        {loan.nftCollection.name}
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        <div className="flex items-center gap-1">
          <span className="pr-1">#{loan.nftTokenId}</span>
          <a
            href={getOpenSeaAssetUrl(
              loan.nftCollection.contractAddress,
              loan.nftTokenId
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <OpenseaIcon className="w-4 h-4" />
          </a>
          <a
            href={getBlurAssetUrl(
              loan.nftCollection.contractAddress,
              loan.nftTokenId
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <BlurIcon className="w-4 h-4" />
          </a>
        </div>
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        {loan.token}
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        ~{formatEther(loan.loanPrincipal)}
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        {formatApr(loan.loanApr)}%
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        ~{formatEther(loan.loanRepayment)}
      </td>

      <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
        {formatDateTime(loan.dueAt)}
      </td>

      {hasDefaultedLoans && (
        <td className="hidden px-3 py-4 text-sm lg:table-cell">
          {loan.status === NftFiLoanStatus.Defaulted && (
            <span className="text-red-500">Defaulted</span>
          )}
        </td>
      )}

      {hasTransferredOrLiquidatedLoans && (
        <td className="hidden px-3 py-4 text-sm lg:table-cell">
          <span className={getTransferStatus(loan.status).className}>
            {getTransferStatus(loan.status).text}
          </span>
        </td>
      )}

      {hasTransferFailedLoans && (
        <td className="hidden px-3 py-4 text-sm text-red-500 lg:table-cell">
          {loan.status === NftFiLoanStatus.NftTransferFailed &&
            getTransferFailReason(loan.nftTransferFailedReason)}
        </td>
      )}

      {hasLiquidationFailedLoans && (
        <>
          <td className="hidden px-3 py-4 text-sm lg:table-cell">
            {loan.status === NftFiLoanStatus.LiquidationFailed && (
              <span className="text-red-500">Liquidation failed</span>
            )}
          </td>
          <td className="hidden px-3 py-4 text-sm text-red-500 lg:table-cell">
            {loan.status === NftFiLoanStatus.LiquidationFailed &&
              getLiquidationFailReason(loan.liquidationFailedReason)}
          </td>
        </>
      )}
    </tr>
  );
};
