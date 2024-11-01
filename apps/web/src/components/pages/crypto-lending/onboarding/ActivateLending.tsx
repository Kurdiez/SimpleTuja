import Button from "@/components/common/Button";
import LoadSpinner from "@/components/common/LoadSpinner";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCryptoUserState } from "@/utils/simpletuja/crypto-lending";
import { AppRoute } from "@/utils/app-route";

const ActivateLending: React.FC = () => {
  const [isActivating, setIsActivating] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkActivationStatus = async () => {
      try {
        const userState = await getCryptoUserState();
        setIsActivating(!userState?.active);
      } catch (error) {
        console.error("Failed to check activation status:", error);
      }
    };

    checkActivationStatus();
    const pollInterval = setInterval(checkActivationStatus, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleDashboardClick = () => {
    router.push(AppRoute.CryptoLending);
  };

  const renderContent = () => {
    if (isActivating) {
      return (
        <>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Setting Up Your Account
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-300">
            We are setting up your investment account with NFTfi protocol. Once
            complete, we will automatically start making loan offers according
            to your loan settings. This will take only a couple of minutes.
          </p>
          <div className="mt-10">
            <LoadSpinner />
          </div>
        </>
      );
    }

    return (
      <>
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Account Setup Complete
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-300">
          Your investment account is setup with NFTfi and we have begun making
          automated loan offers. Our dashboard will be updated to reflect your
          new lending activities in real-time.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={handleDashboardClick}>Go To Dashboard</Button>
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto my-14">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:px-24 lg:pt-0 border-[1px]">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">{renderContent()}</div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#gradient)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="gradient">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default ActivateLending;
