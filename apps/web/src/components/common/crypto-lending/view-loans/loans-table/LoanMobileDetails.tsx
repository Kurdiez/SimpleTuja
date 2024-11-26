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

interface LoanMobileDetailsProps {
  loan: CryptoLoan;
  hasDefaultedLoans: boolean;
  hasTransferredOrLiquidatedLoans: boolean;
  hasTransferFailedLoans: boolean;
  hasLiquidationFailedLoans: boolean;
}

export const LoanMobileDetails: React.FC<LoanMobileDetailsProps> = ({
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:hidden gap-4 py-4 text-sm w-full">
      <div className="space-y-1 min-w-0">
        <div className="font-medium text-gray-500 h-5">Collection</div>
        <div className="text-gray-200 truncate">{loan.nftCollection.name}</div>
      </div>

      <div className="space-y-1 min-w-0">
        <div className="font-medium text-gray-500 h-5">Token ID</div>
        <div className="text-gray-200 flex items-center gap-1">
          <span className="pr-1 truncate">#{loan.nftTokenId}</span>
          <a
            href={getOpenSeaAssetUrl(
              loan.nftCollection.contractAddress,
              loan.nftTokenId
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity flex-shrink-0"
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
            className="inline-block hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <BlurIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="space-y-1 min-w-0">
        <div className="font-medium text-gray-500 h-5">Principal</div>
        <div className="text-gray-200 truncate">
          {formatEther(loan.loanPrincipal)} {loan.token}
        </div>
      </div>

      <div className="space-y-1 min-w-0">
        <div className="font-medium text-gray-500 h-5">APR</div>
        <div className="text-gray-200 truncate">{formatApr(loan.loanApr)}%</div>
      </div>

      <div className="space-y-1 min-w-0">
        <div className="font-medium text-gray-500 h-5">Start Date</div>
        <div className="text-gray-200 truncate">
          {formatDateTime(loan.startedAt)}
        </div>
      </div>

      <div className="space-y-1 min-w-0">
        <div className="font-medium text-gray-500 h-5">Due Date</div>
        <div className="text-gray-200 truncate">
          {formatDateTime(loan.dueAt)}
        </div>
      </div>

      {hasDefaultedLoans && loan.status === NftFiLoanStatus.Defaulted && (
        <div className="space-y-1 min-w-0">
          <div className="font-medium text-gray-500 h-5">Default</div>
          <div className="text-red-500 truncate">Defaulted</div>
        </div>
      )}

      {hasTransferredOrLiquidatedLoans && (
        <div className="space-y-1 col-span-2 sm:col-span-3 md:col-span-4 min-w-0">
          <div className="font-medium text-gray-500 h-5">
            Transferred to Foreclosure Wallet
          </div>
          <div
            className={`${getTransferStatus(loan.status).className} truncate`}
          >
            {getTransferStatus(loan.status).text}
          </div>
        </div>
      )}

      {hasTransferFailedLoans &&
        loan.status === NftFiLoanStatus.NftTransferFailed && (
          <div className="space-y-1 col-span-2 sm:col-span-3 md:col-span-4 min-w-0">
            <div className="font-medium text-gray-500 h-5">
              Transfer Fail Reason
            </div>
            <div className="text-red-500 truncate">
              {getTransferFailReason(loan.nftTransferFailedReason)}
            </div>
          </div>
        )}

      {hasLiquidationFailedLoans &&
        loan.status === NftFiLoanStatus.LiquidationFailed && (
          <>
            <div className="space-y-1 col-span-2 sm:col-span-3 md:col-span-4 min-w-0">
              <div className="font-medium text-gray-500 h-5">
                Liquidation Status
              </div>
              <div className="text-red-500 truncate">Liquidation failed</div>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-3 md:col-span-4 min-w-0">
              <div className="font-medium text-gray-500 h-5">
                Liquidation Fail Reason
              </div>
              <div className="text-red-500 truncate">
                {getLiquidationFailReason(loan.liquidationFailedReason)}
              </div>
            </div>
          </>
        )}
    </div>
  );
};
