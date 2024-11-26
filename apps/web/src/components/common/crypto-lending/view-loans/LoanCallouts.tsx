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
    hasNftTransferredLoans,
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
      hasNftTransferredLoans:
        acc.hasNftTransferredLoans ||
        loan.status === NftFiLoanStatus.NftTransferred,
    }),
    {
      hasDefaultedLoans: false,
      hasLiquidationFailedLoans: false,
      hasNftTransferFailedLoans: false,
      hasNftTransferredLoans: false,
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

      {hasNftTransferredLoans && (
        <Callout type="info">
          <strong>NFTs Successfully Transferred:</strong> Some liquidated NFTs
          have been transferred to your foreclosure wallet. You can sell these
          NFTs on{" "}
          <a
            href="https://opensea.io"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            OpenSea
          </a>{" "}
          or{" "}
          <a
            href="https://blur.io"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            Blur
          </a>{" "}
          for <span className="text-primary">wETH</span>. If you wish to fund
          your lending wallet again, you can transfer the{" "}
          <span className="text-primary">wETH</span> back to it{" "}
          <Link href={AppRoute.CryptoLendingWallet} className="link">
            here
          </Link>
          .
        </Callout>
      )}
    </>
  );
};
