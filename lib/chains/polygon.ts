import type { Chain } from "wagmi";

export const polygon: Chain = {
    id: 137,
    name: "Polygon",
    network: "polygon",
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


