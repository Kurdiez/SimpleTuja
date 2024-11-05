import { Typography } from "@/components/common/Typography";
import EtherscanIcon from "@/components/icons/EtherscanIcon";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useDashboard } from "./dashboard.context";

export const WalletAddressSection: React.FC = () => {
  const { walletAddress, copyToClipboard } = useDashboard();

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Typography.DisplayLG tag="h1">Wallet Address</Typography.DisplayLG>
      <div className="flex items-center">
        <span className="text-base text-primary font-medium">
          {walletAddress}
        </span>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <DocumentDuplicateIcon
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
          </button>
          <a
            href={`https://etherscan.io/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <EtherscanIcon className="h-5 w-5 text-primary" />
          </a>
        </div>
      </div>
    </div>
  );
};
