import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { withAuth } from "@/components/hoc/withAuth";
import { GlobalStatesProvider } from "@/components/pages/app/global-states.context";

export default function App({ Component, pageProps }: AppProps) {
  const AuthComponent = withAuth(Component);

  return (
    <GlobalStatesProvider>
      <AuthComponent {...pageProps} />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            border: "2px solid #ea580c",
            background: "#ffdecc",
            fontSize: "14px",
          },
        }}
      />
    </GlobalStatesProvider>
  );
}
