import { AppRoute } from "@/utils/app-route";
import {
  getCryptoUserState,
  updateLoanSettings as updateLoanSettingsApi,
} from "@/utils/simpletuja/crypto-lending";
import {
  CryptoLendingUserStateDto,
  LoanSettingsUpdateDto,
} from "@simpletuja/shared";
import { useRouter } from "next/router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type CryptoLendingContextType = {
  userState: CryptoLendingUserStateDto | null;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  updateLoanSettings: (
    loanSettingsUpdateDto: LoanSettingsUpdateDto
  ) => Promise<void>;
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
  const [isOnboardingComplete, setIsOnboardingComplete] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Add pathname to track actual route changes
  const { pathname } = router;

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

        setIsOnboardingComplete(isOnboardingComplete);

        // redirect only if the pathname isn't already the onboarding page
        if (
          !isOnboardingComplete &&
          pathname !== AppRoute.CryptoLendingOnboarding &&
          pathname !== AppRoute.CryptoLendingOnboardingAbout
        ) {
          router.push(AppRoute.CryptoLendingOnboarding);
        } else if (
          isOnboardingComplete &&
          (pathname === AppRoute.CryptoLendingOnboarding ||
            pathname === AppRoute.CryptoLendingOnboardingAbout)
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
  }, [pathname, router]);

  const updateLoanSettings = async (
    loanSettingsUpdateDto: LoanSettingsUpdateDto
  ) => {
    await updateLoanSettingsApi(loanSettingsUpdateDto);
    const state = await getCryptoUserState();
    setUserState(state);
  };

  return (
    <CryptoLendingContext.Provider
      value={{
        userState,
        isOnboardingComplete,
        isLoading,
        updateLoanSettings,
      }}
    >
      {children}
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
