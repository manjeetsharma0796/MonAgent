import { mainnet } from "wagmi/chains";
import { bnb } from "@/lib/chains/bnb";
import { polygon } from "@/lib/chains/polygon";
import { monadTestnet } from "@/lib/chains/monad";
import { u2u } from "@/lib/chains/u2u";

export type SupportedChainName = "eth" | "bnb" | "matic" | "monad-testnet" | "u2u";

export const chainNameToId: Record<SupportedChainName, number> = {
    eth: mainnet.id,
    bnb: bnb.id,
    matic: polygon.id,
    "monad-testnet": monadTestnet.id,
    u2u: u2u.id,
};

// Support both "bsc" and "bnb" for BNB Smart Chain
const chainAliases: Record<string, SupportedChainName> = {
    "bsc": "bnb",
};

export function getChainIdByName(name: string): number | undefined {
    const normalizedName = chainAliases[name] || name as SupportedChainName;
    return chainNameToId[normalizedName];
}


