import type { Chain } from "wagmi";

export const u2uMainnet: Chain = {
    id: 39,
    name: "U2U Solaris Mainnet",
    network: "u2u-mainnet",
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
        default: { name: "U2UScan", url: "https://u2uscan.xyz" },
    },
} as const;


