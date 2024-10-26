import React from "react";

interface OpenAccountWalletAddressProps {
  walletAddress: string;
}

export function OpenAccountWalletAddressModal({
  walletAddress,
}: OpenAccountWalletAddressProps) {
  return (
    <div className="flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-semibold leading-9 tracking-tight pb-5 border-b border-gray-700 text-gray-100">
          Your Investment Wallet
        </h2>
      </div>

      <div className="mt-6 space-y-4 text-gray-300">
        <p>
          <span className="text-primary">Congratulations!</span> Your investment
          account has been successfully opened.
        </p>
        <p>Your wallet address is:</p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200 break-all text-center">
            {walletAddress}
          </p>
        </div>
        <p>
          Don&apos;t worry. You can always find this wallet address later even
          if this window is closed.
        </p>
      </div>
    </div>
  );
}
