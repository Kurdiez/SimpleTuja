import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import withAuth from "@/components/hoc/withAuth";

export default function App({ Component, pageProps, router }: AppProps) {
  const isProtectedRoute: boolean = router.pathname.startsWith("/app");
  const ProtectedComponent: React.FC = isProtectedRoute
    ? withAuth(Component as React.FC)
    : (Component as React.FC);

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
      <ProtectedComponent {...pageProps} />
    </>
  );
}
