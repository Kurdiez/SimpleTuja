import { LocalStorageKey } from "@/utils/const";
import { AuthResponse } from "@simpletuja/shared";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type GlobalStatesContextType = {
  isSignedIn: boolean;
  user: AuthResponse["user"] | null;
  userHandle: string | null;
  setSignedIn: (authResponse: AuthResponse) => void;
  setSignedOut: () => void;
};

const GlobalStatesContext = createContext<GlobalStatesContextType | undefined>(
  undefined
);

type GlobalStatesProviderProps = {
  children: ReactNode;
};

export const GlobalStatesProvider: React.FC<GlobalStatesProviderProps> = ({
  children,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);

  const userHandle = useMemo(() => {
    if (!user?.email) return null;
    return user.email.split("@")[0];
  }, [user?.email]);

  const setSignedIn = useCallback((authResponse: AuthResponse) => {
    localStorage.setItem(LocalStorageKey.AccessToken, authResponse.accessToken);
    setIsSignedIn(true);
    setUser(authResponse.user);
  }, []);

  const setSignedOut = useCallback(() => {
    localStorage.removeItem(LocalStorageKey.AccessToken);
    setIsSignedIn(false);
    setUser(null);
  }, []);

  return (
    <GlobalStatesContext.Provider
      value={{
        user,
        isSignedIn,
        userHandle,
        setSignedIn,
        setSignedOut,
      }}
    >
      {children}
    </GlobalStatesContext.Provider>
  );
};

export const useGlobalStates = () => {
  const context = useContext(GlobalStatesContext);
  if (!context) {
    throw new Error(
      "useGlobalStates must be used within a GlobalStatesProvider"
    );
  }
  return context;
};
