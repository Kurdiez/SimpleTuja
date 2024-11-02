import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { CryptoLendingUserStateDto } from "@simpletuja/shared";
import { getCryptoUserState } from "@/utils/simpletuja/crypto-lending";
import { useRouter } from "next/router";
import { AppRoute } from "@/utils/app-route";

type CryptoLendingContextType = {
  userState: CryptoLendingUserStateDto | null;
  isLoading: boolean;
};

const CryptoLendingContext = createContext<
  CryptoLendingContextType | undefined
>(undefined);

type CryptoLendingProviderProps = {
  children: ReactNode;
};

export const CryptoLendingProvider: React.FC<CryptoLendingProviderProps> = ({
  children,
}) => {
  const [userState, setUserState] = useState<CryptoLendingUserStateDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserState = async () => {
      try {
        setIsLoading(true);
        const state = await getCryptoUserState();
        setUserState(state);

        const isOnboardingComplete =
          state != null &&
          state.hasOpenedCryptoInvestmentAccount &&
          state.hasCompletedLoanSettings &&
          state.hasFundedTheAccount &&
          state.hasAllTokenAllowancesApproved;

        // redirect only if the pathname isn't already the onboarding page
        if (
          !isOnboardingComplete &&
          router.pathname !== AppRoute.CryptoLendingOnboarding
        ) {
          router.push(AppRoute.CryptoLendingOnboarding);
        } else if (
          isOnboardingComplete &&
          router.pathname === AppRoute.CryptoLendingOnboarding
        ) {
          router.push(AppRoute.CryptoLending);
        }
      } catch (error) {
        console.error("Error fetching crypto user state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CryptoLendingContext.Provider
      value={{
        userState,
        isLoading,
      }}
    >
      {isLoading ? <div></div> : children}
    </CryptoLendingContext.Provider>
  );
};

export const useCryptoLending = () => {
  const context = useContext(CryptoLendingContext);
  if (!context) {
    throw new Error(
      "useCryptoLending must be used within a CryptoLendingProvider"
    );
  }
  return context;
};
