import Link from "next/link";

export function WhyDepositEthModal() {
  return (
    <div className="flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-semibold leading-9 tracking-tight pb-5 border-b border-gray-700 text-gray-100">
          Why do I need to deposit ETH?
        </h2>
      </div>

      <div className="mt-6 space-y-4 text-gray-300">
        <p>
          GAS fees are transaction costs paid in ETH for any action on the
          Ethereum blockchain. Think of it like a processing fee that powers the
          network. When using&nbsp;
          <Link className="link" href="https://nftfi.com" target="_blank">
            NFTfi
          </Link>
          , you&apos;ll need ETH for:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-primary">One-time setup fee (~$2-3)</span> to
            initialize your investment wallet for automated lending
          </li>
          <li>
            <span className="text-primary">
              Foreclosure transfer fees (~$8-15 total)
            </span>{" "}
            when claiming defaulted NFTs:
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>First transfer: NFTfi to your STJ lending wallet</li>
              <li>
                Second transfer: STJ wallet to your personal foreclosure wallet
              </li>
            </ul>
          </li>
        </ul>
        <p>
          The minimum deposit amount we recommend will only cover the one-time
          setup fee. For active lending, we suggest maintaining{" "}
          <span className="text-primary">$50-100 worth of ETH</span> in your
          lending wallet to handle potential loan defaults. To minimize
          foreclosure risks, consider using lower LTV % settings.
        </p>
        <p className="text-sm italic">
          Note: All USD amounts are estimates. Actual fees are paid in ETH and
          vary based on network activity.
        </p>
      </div>
    </div>
  );
}
