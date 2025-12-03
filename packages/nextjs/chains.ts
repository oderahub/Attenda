import { defineChain } from "viem";

export const celoSepolia = /*#__PURE__*/ defineChain({
  id: 44787,
  network: "alfajores",
  name: "Celo Alfajores Testnet",
  nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://alfajores-forno.celo-testnet.org"],
    },
    public: {
      http: ["https://alfajores-forno.celo-testnet.org"],
    },
  },
  blockExplorers: {
    celoscan: {
      name: "Celoscan",
      url: "https://alfajores.celoscan.io",
    },
    default: {
      name: "Celoscan",
      url: "https://alfajores.celoscan.io",
    },
  },
  testnet: true,
});
