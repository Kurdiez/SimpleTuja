import { useState, useEffect } from "react";
import { refreshToken } from "@/utils/simpletuja/auth";
import { LocalStorageKey } from "@/utils/const";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(LocalStorageKey.AccessToken);
      if (token) {
        try {
          const newToken = await refreshToken();
          localStorage.setItem(LocalStorageKey.AccessToken, newToken);
          setAuthState({ isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem(LocalStorageKey.AccessToken);
          setAuthState({ isAuthenticated: false, isLoading: false });
        }
      } else {
        setAuthState({ isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  return authState;
};
