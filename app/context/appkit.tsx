"use client";

import type { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { defineChain, sepolia } from "@reown/appkit/networks";
import { chainMode, localRpcUrl, reownProjectId } from "@/lib/config";

export const hardhatLocal = defineChain({
  id: 31337,
  caipNetworkId: "eip155:31337",
  chainNamespace: "eip155",
  name: "Hardhat Local",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: [localRpcUrl] },
  },
});

export const activeAppKitNetwork = chainMode === "local" ? hardhatLocal : sepolia;

const metadata = {
  name: "Two-Partner Supply Chain",
  description: "Two-partner supply-chain tracking DApp",
  url:
    typeof window === "undefined"
      ? "http://localhost:3000"
      : window.location.origin,
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

if (reownProjectId) {
  createAppKit({
    adapters: [new EthersAdapter()],
    metadata,
    networks: [activeAppKitNetwork],
    defaultNetwork: activeAppKitNetwork,
    projectId: reownProjectId,
    features: {
      analytics: false,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
    },
  });
}

export function AppKit({ children }: { children: ReactNode }) {
  return children;
}
