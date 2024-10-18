import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { withAuth } from "@/components/hoc/withAuth";
import { GlobalStatesProvider } from "@/components/pages/app/global-states.context";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { AppKitNetwork, mainnet } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const networks = [mainnet];

const metadata = {
  name: "My Crypto Investment App",
  description: "A simple crypto investment app",
  url: process.env.NEXT_PUBLIC_WEB_APP_URL || "",
  icons: [],
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: networks as unknown as [AppKitNetwork, ...AppKitNetwork[]],
  metadata,
  projectId,
  features: {
    email: false,
    socials: [],
  },
});

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
