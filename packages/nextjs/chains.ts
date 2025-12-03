import { defineChain } from "viem";

export const celoSepolia = /*#__PURE__*/ defineChain({
  id: 11142220,
  network: "celo-sepolia",
  name: "Celo Sepolia Testnet",
  nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
    public: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
  },
  blockExplorers: {
    celoscan: {
      name: "Celoscan",
      url: "https://sepolia.celoscan.io",
    },
    default: {
      name: "Celoscan",
      url: "https://sepolia.celoscan.io",
    },
  },
  testnet: true,
});
