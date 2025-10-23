import type { Chain } from "viem";

// NOTE: U2U mainnet configuration
export const u2u: Chain = {
    id: 39,
    name: "U2U Network",
    nativeCurrency: {
        name: "U2U",
        symbol: "U2U",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://rpc-mainnet.u2u.xyz"] },
        public: { http: ["https://rpc-mainnet.u2u.xyz"] },
    },
    blockExplorers: {
        default: { name: "U2U Explorer", url: "https://uniultra.xyz/explorer" },
    },
} as const;


