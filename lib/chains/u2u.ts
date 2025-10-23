import type { Chain } from "viem";

// U2U Mainnet configuration (kept as the canonical `u2u` export)
export const u2u: Chain = {
    id: 39,
    name: "U2U Mainnet",
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

// U2U Testnet configuration
// Chain ID: 2484 (0x9b4)
// RPC: https://rpc-nebulas-testnet.uniultra.xyz
export const u2uTestnet: Chain = {
    id: 2484,
    name: "U2U Testnet",
    nativeCurrency: {
        name: "U2U",
        symbol: "U2U",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://rpc-nebulas-testnet.uniultra.xyz"] },
        public: { http: ["https://rpc-nebulas-testnet.uniultra.xyz"] },
    },
    blockExplorers: {
        default: { name: "U2U Explorer (testnet)", url: "https://uniultra.xyz/explorer" },
    },
} as const;


