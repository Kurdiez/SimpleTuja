import React, { useState } from "react";
import Button from "../../../common/Button";
import toast from "react-hot-toast";
import { useOnboarding } from "./onboarding.context";
import { useModal } from "@/components/modal/modal.context";
import { OpenAccountLearnMoreModal } from "@/components/modal/content/OpenAccountLearnMoreModal";
import { OpenAccountWalletAddressModal } from "@/components/modal/content/OpenAccountWalletAddressModal";
import Image from "next/image";

const OpenAccountCTA: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { openCryptoInvestmentAccount } = useOnboarding();
  const { openModal } = useModal();

  const handleOpenAccount = async () => {
    setIsLoading(true);
    try {
      const walletAddress = await openCryptoInvestmentAccount();
      openModal(
        <OpenAccountWalletAddressModal walletAddress={walletAddress} />
      );
    } catch {
      toast.error("Failed to open account");
    } finally {
      setIsLoading(false);
    }
  };

  const onLearnMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openModal(<OpenAccountLearnMoreModal />);
  };

  return (
    <div className="mx-auto my-14">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 border-[1px]">
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
        >
          <circle
            r={512}
            cx={512}
            cy={512}
            fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start your crypto lending.
            <br />
            Open an account today.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Lend your <span className="text-primary">ETH</span>,{" "}
            <span className="text-primary">DAI</span>, or{" "}
            <span className="text-primary">USDC</span> to earn high returns as
            passive income. We&apos;ll set you up with safe, low-risk options to
            get you started in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <Button onClick={handleOpenAccount} loading={isLoading}>
              Open Account
            </Button>
            <a
              href="#"
              className="text-sm font-semibold leading-6 text-white"
              onClick={onLearnMoreClick}
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="relative mt-16 h-80 lg:mt-8">
          <Image
            alt="Crypto lending platform screenshot"
            src="/img/bitcoin-trade.jpg"
            width={1824}
            height={1080}
            className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
          />
        </div>
      </div>
    </div>
  );
};

export default OpenAccountCTA;
