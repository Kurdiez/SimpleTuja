import {
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import React from "react";

interface HeroSectionProps {
  className?: string;
}

const features = [
  {
    name: "Earn Passive Income While Holding ETH",
    description:
      "Put your ETH to work by lending it out securely, generating returns without selling your holdings.",
    icon: WalletIcon,
  },
  {
    name: "Lend with Confidence, Backed by NFTs as Collateral",
    description:
      "Protect your capital with valuable NFTs backing each loan, reducing the risk of unsecured lending.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Effortless Income Through Automation",
    description:
      "Our platform simplifies and automates the entire process, so you can lend at scale with ease and efficiency.",
    icon: CogIcon,
  },
  {
    name: "Capitalize on Market Opportunities",
    description:
      "Leverage up-to-date NFT bid prices to make competitive offers that align with current market conditions.",
    icon: ChartBarIcon,
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <div className={classNames("bg-gray-900", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            P2P Crypto Lending
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-balance">
            Secure NFT-Backed Lending Platform
          </p>
          <p className="mt-6 text-lg/8 text-gray-300">
            Discover the future of decentralized lending with our NFT-backed P2P
            platform, offering secure, automated, and profitable lending
            opportunities.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-300">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
