import { Buffer } from "buffer";
(window as Window & { Buffer: typeof Buffer }).Buffer = Buffer;

import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./index.css";
import App from "./App.tsx";

const RPC_ENDPOINT = "https://devnet.helius-rpc.com/?api-key=88176966-062f-4098-8659-1247bb812de9";

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10_000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function WalletProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => RPC_ENDPOINT, []);
  const wallets = useMemo(() => [], []); // wallet-adapter auto-detects installed wallets
  const config = useMemo(() => ({ fetch: fetchWithTimeout }), []);

  return (
    <ConnectionProvider endpoint={endpoint} config={config}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <WalletProviders>
    <App />
  </WalletProviders>,
);
