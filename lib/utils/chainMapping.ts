// lib/utils/chainMapping.ts

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
    "monad-testnet": monadTestnet.id, // = 39
    u2u: u2u.id,
};

// Map backend or user-friendly chain names to canonical SupportedChainName
const chainAliases: Record<string, SupportedChainName> = {
    // BNB Smart Chain
    bsc: "bnb",
    "binance-smart-chain": "bnb",
    binance: "bnb",

    // Ethereum
    ethereum: "eth",

    // Polygon
    polygon: "matic",

    // Monad Testnet — critical fix for backend's "monad_testnet"
    "monad_testnet": "monad-testnet",   // ← handles your backend's format
    monad: "monad-testnet",             // shorthand
    "monad testnet": "monad-testnet",   // spaced version

    // U2U (if needed)
    "u2u network": "u2u",
    "u2u_testnet": "u2u",
    "u2u testnet": "u2u",
};

/**
 * Resolves a chain name (from backend or user input) to its chain ID.
 * Case-insensitive and trims whitespace.
 */
export function getChainIdByName(name: string): number | undefined {
    if (!name) return undefined;

    const cleanName = name.trim().toLowerCase();
    const canonicalName = chainAliases[cleanName] || (cleanName as SupportedChainName);
    return chainNameToId[canonicalName];
}