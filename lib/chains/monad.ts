import type { Chain } from "viem";

export const monadTestnet: Chain = {
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: {
        name: "MON",
        symbol: "MON",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://testnet-rpc.monad.xyz"] },
        public: { http: ["https://testnet-rpc.monad.xyz"] },
    },
    blockExplorers: {
        default: { name: "MonadScan", url: "https://testnet.monadexplorer.com" },
    },
} as const;


