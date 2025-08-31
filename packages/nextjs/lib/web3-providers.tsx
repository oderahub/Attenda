"use client";

import type React from "react";

import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    // Use hardhat for local development, will be overridden in production
    chains: [hardhat],
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

    // Required App Info
    appName: "Attenda",
    appDescription: "Decentralized Attention Economy DApp",
    appUrl: "https://attenda.app",
    appIcon: "https://attenda.app/logo.png",
  }),
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="auto">{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
