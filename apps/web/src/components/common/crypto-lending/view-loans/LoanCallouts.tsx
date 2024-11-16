import { Callout } from "@/components/common/Callout";
import { useLoans } from "@/components/common/crypto-lending/view-loans/loans.context";
import { AppRoute } from "@/utils/app-route";
import { NftFiLoanStatus } from "@simpletuja/shared";
import Link from "next/link";
import React from "react";

export const LoanCallouts: React.FC = () => {
  const { loans } = useLoans();

  const {
    hasDefaultedLoans,
    hasLiquidationFailedLoans,
    hasNftTransferFailedLoans,
  } = loans.reduce(
    (acc, loan) => ({
      hasDefaultedLoans:
        acc.hasDefaultedLoans || loan.status === NftFiLoanStatus.Defaulted,
      hasLiquidationFailedLoans:
        acc.hasLiquidationFailedLoans ||
        loan.status === NftFiLoanStatus.LiquidationFailed,
      hasNftTransferFailedLoans:
        acc.hasNftTransferFailedLoans ||
        loan.status === NftFiLoanStatus.NftTransferFailed,
    }),
    {
      hasDefaultedLoans: false,
      hasLiquidationFailedLoans: false,
      hasNftTransferFailedLoans: false,
    }
  );

  return (
    <>
      {hasDefaultedLoans && (
        <Callout type="critical">
          <strong>Defaulted Loans Found:</strong> When a loan defaults, your
          NFTs will be automatically moved to your foreclosure wallet. This
          process requires ETH to cover gas fees. You can{" "}
          <Link href={AppRoute.CryptoLendingSettings} className="link">
            set up or update your foreclosure wallet address here
          </Link>
          .
        </Callout>
      )}

      {hasLiquidationFailedLoans && (
        <Callout type="critical">
          <strong>Failed Liquidation Found:</strong> Our system will
          automatically retry the liquidation process periodically. If the
          failure is due to insufficient ETH for gas fees, please{" "}
          <Link href={AppRoute.CryptoLendingWallet} className="link">
            add more ETH to your wallet
          </Link>{" "}
          to ensure successful liquidation.
        </Callout>
      )}

      {hasNftTransferFailedLoans && (
        <Callout type="critical">
          <strong>NFT Transfer Failed:</strong> Some liquidated NFTs could not
          be transferred to your foreclosure wallet. If this is due to
          insufficient ETH for gas fees, please{" "}
          <Link href={AppRoute.CryptoLendingWallet} className="link">
            add more ETH to your wallet
          </Link>{" "}
          to complete the transfer.
        </Callout>
      )}
    </>
  );
};
