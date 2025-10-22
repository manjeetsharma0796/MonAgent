import type { Chain } from "wagmi";

export const monadTestnet: Chain = {
    id: 39,
    name: "Monad Testnet",
    network: "monad-testnet",
    nativeCurrency: {
        name: "MON",
        symbol: "MON",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://rpc-testnet.monad.xyz"] },
        public: { http: ["https://rpc-testnet.monad.xyz"] },
    },
    blockExplorers: {
        default: { name: "MonadScan", url: "https://monad-testnet.socialscan.io" },
    },
} as const;


