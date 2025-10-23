import type { Chain } from "wagmi";

export const bnb: Chain = {
    id: 56,
    name: "BNB Smart Chain",
    network: "bsc",
    nativeCurrency: {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://bsc-dataseed.binance.org"] },
        public: { http: ["https://bsc-dataseed.binance.org"] },
    },
    blockExplorers: {
        default: { name: "BscScan", url: "https://bscscan.com" },
    },
} as const;


