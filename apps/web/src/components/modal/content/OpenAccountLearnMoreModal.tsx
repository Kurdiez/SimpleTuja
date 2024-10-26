import Link from "next/link";

export function OpenAccountLearnMoreModal() {
  return (
    <div className="flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-semibold leading-9 tracking-tight pb-5 border-b border-gray-700 text-gray-100">
          Learn More: Opening an Account
        </h2>
      </div>

      <div className="mt-6 space-y-4 text-gray-300">
        <p>
          Opening an account with us means creating a new{" "}
          <span className="text-primary">public crypto wallet</span>.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Unlike the traditional crypto exchanges that keep your trading
            activities off-chain,{" "}
            <span className="text-primary">we do everything on-chain</span> with
            your investment wallet for full transparency. This means you can
            monitor every single activity of your investment wallet on{" "}
            <Link className="link" href="https://etherscan.io" target="_blank">
              Etherscan
            </Link>
            . This includes all automatic loan activities, smart contract
            interactions, and cryptocurrency transfers in and out of the wallet.
          </li>
          <li>
            All automatic loan activities will go through{" "}
            <Link className="link" href="https://nftfi.com" target="_blank">
              NFTfi
            </Link>
            &apos;s smart contracts.{" "}
            <Link className="link" href="https://nftfi.com" target="_blank">
              NFTfi
            </Link>
            &apos;s smart contracts are{" "}
            <Link
              className="link"
              href="https://docs.nftfi.com/smart-contracts/contract-addresses"
              target="_blank"
            >
              completely open-source
            </Link>{" "}
            for anyone to check the source code.
          </li>
          <li>
            Transfer funds in and out of the wallet with{" "}
            <span className="text-primary">no restrictions</span> at any time.
          </li>
        </ul>
        <p>
          We will share with you the wallet address immediately after opening
          the account in Step 1 of this onboarding process.
        </p>
      </div>
    </div>
  );
}
