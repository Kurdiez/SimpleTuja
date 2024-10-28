import Link from "next/link";
import React from "react";

export function WhatIsGasFeeModal() {
  return (
    <div className="flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-semibold leading-9 tracking-tight pb-5 border-b border-gray-700 text-gray-100">
          What is GAS fee?
        </h2>
      </div>

      <div className="mt-6 space-y-4 text-gray-300">
        <p>
          GAS fees are transaction costs you must pay when interacting
          with&nbsp;
          <Link className="link" href="https://nftfi.com" target="_blank">
            NFTfi
          </Link>
          &apos;s smart contracts on the Ethereum blockchain. There are two main
          scenarios where you&apos;ll need to pay GAS:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-primary">One-time setup fee</span> to
            initialize your investment wallet for automated loan offers
          </li>
          <li>
            Transaction fee when{" "}
            <span className="text-primary">claiming foreclosed NFTs</span> on
            defaulted loans that are automatically transferred to your wallet
          </li>
        </ul>
        <p>
          The amount of GAS you need to pay depends on complexity of the action.
          Usually the cost is between $0.5 - $3 USD per action.
        </p>
      </div>
    </div>
  );
}
