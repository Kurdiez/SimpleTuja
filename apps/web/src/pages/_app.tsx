import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { withAuth } from "@/components/hoc/withAuth";
import { GlobalStatesProvider } from "@/components/pages/app/global-states.context";
import { createAppKit } from "@reown/appkit/react";
import { http, WagmiProvider } from "wagmi";
import { AppKitNetwork, mainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { ModalProvider } from "@/components/modal/modal.context";
import Modal from "@/components/modal/Modal";

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const metadata = {
  name: "My Crypto Investment App",
  description: "A simple crypto investment app",
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
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GlobalStatesProvider>
          <ModalProvider>
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
  );
}
