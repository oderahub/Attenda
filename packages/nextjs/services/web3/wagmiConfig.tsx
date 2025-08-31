import { createConfig, http } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { createPublicClient } from "viem";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

// Configure chains & providers
export const chains = [mainnet, sepolia, localhost];

// Set up wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors: [injected(), metaMask(), walletConnect({ projectId })],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
});

// Create public client
export const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});
