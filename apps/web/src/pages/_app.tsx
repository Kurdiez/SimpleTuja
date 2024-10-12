import { useAuth } from "@/components/common/hooks/useAuth";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute =
        router.pathname === "/sign-in" || router.pathname === "/register";
      if (isAuthRoute && isAuthenticated) {
        router.push("/app");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            border: "2px solid #ea580c",
            background: "#ffdecc",
            fontSize: "14px",
          },
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
