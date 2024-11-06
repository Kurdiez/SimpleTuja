import { PlayCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

export const WhyUseSTJ: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <div className="px-4 sm:px-0">
        <h3 className="text-2xl font-semibold text-gray-100">
          Why Use <span className="text-primary">STJ + NFTfi.com</span>?
        </h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-400">
          Streamline your NFT lending experience with automated us!
        </p>
      </div>
      <div className="mt-6 border-t border-gray-800">
        <dl className="divide-y divide-gray-800">
          <div className="bg-gray-900/50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm/6 font-medium text-gray-300">
              How NFTfi Loans Work
            </dt>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              <div className="space-y-4">
                <p>
                  You will lend your capital using the secure & open-source
                  protocol on ETH blockchain by{" "}
                  <Link
                    href="https://nftfi.com/"
                    className="link"
                    target="_blank"
                  >
                    NFTfi.com
                  </Link>
                  . NFTfi enables peer-to-peer loans using NFTs as collateral.
                  Borrowers can get loans without selling their NFTs, while
                  lenders earn interest by providing liquidity. If a borrower
                  defaults, the lender receives the NFT collateral.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=ND9TnQztEjA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center link transition-colors"
                >
                  <PlayCircleIcon className="h-5 w-5 mr-2" />
                  Watch video explanation
                </a>
              </div>
            </dd>
          </div>

          <div className="bg-gray-900/30 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm/6 font-medium text-gray-300">
              Market Complexity
            </dt>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              Making manual loan offers is risky and time-consuming. You need
              accurate collection prices, careful LTV calculations, and precise
              loan amounts. One wrong calculation could lead to significant
              losses.
            </dd>
          </div>

          <div className="bg-gray-900/50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm/6 font-medium text-gray-300">
              Time-Intensive Process
            </dt>
            <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
              Managing multiple loans requires constant market monitoring and
              complex calculations. This becomes especially challenging when
              deploying large amounts of capital across different NFT
              collections.
            </dd>
          </div>

          <div className="bg-gray-900/30 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm/6 font-semibold text-primary">
              Our Solution
            </dt>
            <dd className="mt-1 text-sm/6 text-primary sm:col-span-2 sm:mt-0">
              <span className="font-semibold">STJ</span> automates the entire
              process. We track collection prices, calculate optimal loan terms
              based on your LTV settings, and help prevent errors. This means
              safer lending and more efficient capital deployment.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
