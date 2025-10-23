import type { Chain } from "viem";

export const polygon: Chain = {
    id: 137,
    name: "Polygon",
    nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://polygon-rpc.com"] },
        public: { http: ["https://polygon-rpc.com"] },
    },
    blockExplorers: {
        default: { name: "Polygonscan", url: "https://polygonscan.com" },
    },
} as const;


