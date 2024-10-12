import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { refreshToken } from "@/utils/simpletuja/auth";
import { LocalStorageKey } from "@/utils/const";

const withAuth = (WrappedComponent: React.FC) => {
  const AuthenticatedComponent: React.FC = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem(LocalStorageKey.AccessToken);
        if (token) {
          try {
            const newToken = await refreshToken();
            localStorage.setItem(LocalStorageKey.AccessToken, newToken);
            setLoading(false);
          } catch {
            localStorage.removeItem(LocalStorageKey.AccessToken);
            router.push("/sign-in");
          }
        } else {
          router.push("/sign-in");
        }
      };

      checkAuth();
    }, [router]);

    if (loading) {
      return <div></div>;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
