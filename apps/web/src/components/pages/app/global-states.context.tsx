import { LocalStorageKey } from "@/utils/const";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type GlobalStatesContextType = {
  isLoggedIn: boolean;
  setLoggedIn: (accessToken: string) => void;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const setLoggedIn = useCallback((accessToken: string) => {
    localStorage.setItem(LocalStorageKey.AccessToken, accessToken);
    setIsLoggedIn(true);
  }, []);

  return (
    <GlobalStatesContext.Provider
      value={{
        isLoggedIn,
        setLoggedIn,
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
