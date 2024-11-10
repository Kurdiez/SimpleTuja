/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocalStorageKey } from "@/utils/const";
import { confirmEmail, refreshToken } from "@/utils/simpletuja/auth";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useGlobalStates } from "../pages/app/global-states.context";

type ComponentType = React.ComponentType<any>;

const getDisplayName = (Component: ComponentType) =>
  Component.displayName || Component.name || "Component";

export const withAuth = (Component: ComponentType) => {
  const AuthenticatedComponent: React.FC<any> = (props) => {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const { isSignedIn, setSignedIn } = useGlobalStates();

    useEffect(() => {
      if (!router.isReady) return;

      const authenticateAndRedirect = async () => {
        const {
          pathname,
          query: { token },
        } = router;

        if (pathname === "/email-confirmation" && token) {
          try {
            const authResponse = await confirmEmail(token as string);
            setSignedIn(authResponse);
            router.push("/app");
          } catch {
            router.push("/");
          }
        } else if (!isSignedIn && pathname.startsWith("/app")) {
          try {
            const authResponse = await refreshToken();
            setSignedIn(authResponse);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, setSignedIn]);

    if (
      isAuthenticating ||
      (!isSignedIn &&
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
