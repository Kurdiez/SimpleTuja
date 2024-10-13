/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocalStorageKey } from "@/utils/const";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useGlobalStates } from "../pages/app/global-states.context";
import { confirmEmail, refreshToken } from "@/utils/simpletuja/auth";

type ComponentType = React.ComponentType<any>;

const getDisplayName = (Component: ComponentType) =>
  Component.displayName || Component.name || "Component";

export const withAuth = (Component: ComponentType) => {
  const AuthenticatedComponent: React.FC<any> = (props) => {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const { isLoggedIn, setLoggedIn } = useGlobalStates();

    useEffect(() => {
      if (!router.isReady) return;

      const authenticateAndRedirect = async () => {
        const {
          pathname,
          query: { token },
        } = router;

        if (pathname === "/email-confirmation" && token) {
          try {
            const accessToken = await confirmEmail(token as string);
            setLoggedIn(accessToken);
            router.push("/app");
          } catch {
            router.push("/");
          }
        } else if (!isLoggedIn && pathname.startsWith("/app")) {
          try {
            const accessToken = await refreshToken();
            setLoggedIn(accessToken);
          } catch {
            if (pathname !== "/" && pathname !== "/sign-in") {
              localStorage.removeItem(LocalStorageKey.AccessToken);
              router.push("/sign-in");
            }
          }
        }
        setIsAuthenticating(false);
      };

      authenticateAndRedirect();
    }, [isLoggedIn, router, setLoggedIn]);

    if (
      isAuthenticating ||
      (!isLoggedIn &&
        router.pathname.startsWith("/app") &&
        router.pathname !== "/")
    ) {
      return null;
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `WithAuthentication(${getDisplayName(
    Component
  )})`;

  return AuthenticatedComponent;
};
