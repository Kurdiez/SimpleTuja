import { CryptoLendingProvider } from "@/components/common/crypto-lending/crypto-lending.context";
import { withAuth } from "@/components/hoc/withAuth";
import Modal from "@/components/modal/Modal";
import { ModalProvider } from "@/components/modal/modal.context";
import { GlobalStatesProvider } from "@/components/pages/app/global-states.context";
import "@/styles/globals.css";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { AppKitNetwork, mainnet } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { http, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const metadata = {
  name: "Automated Self-Managed Investment Tool",
  description:
    "Automate and optimize your self-managed investments across diverse assets with STJ, the intelligent investment automation tool.",
  url: process.env.NEXT_PUBLIC_WEB_APP_URL || "",
  icons: [],
};
const networks = [mainnet];
const wagmiAdapter = new WagmiAdapter({
  chains: [mainnet],
  networks,
  projectId,
  ssr: false,
  transports: {
    [mainnet.id]: http(),
  },
});

createAppKit({
  adapters: [wagmiAdapter],
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
    <CryptoLendingProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <GlobalStatesProvider>
            <ModalProvider>
              <Head>
                <title>STJ - Automated Self-Managed Investment Tool</title>
              </Head>
              <AuthComponent {...pageProps} />
              <Modal />
            </ModalProvider>
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
        </QueryClientProvider>
      </WagmiProvider>
    </CryptoLendingProvider>
  );
}
