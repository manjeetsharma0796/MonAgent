"use client";
import { useMemo, useState, useCallback } from "react";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { isAddress, parseEther } from "viem";
import type { BackendResponseEnvelope, ParsedBackendOutput, BackendTransactionDetails } from "@/types/transaction";
import { getChainIdByName } from "@/lib/utils/chainMapping";

type HandleResult = {
    status: "idle" | "ready" | "switched" | "sent" | "error";
    hash?: `0x${string}`;
    error?: string;
};

export function useTransactionHandler() {
    const { isConnected, chainId, address } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();

    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<HandleResult>({ status: "idle" });

    const parseEnvelope = useCallback((envelope: BackendResponseEnvelope): ParsedBackendOutput | undefined => {
        try {
            // Prefer top-level action_type when present
            const parsedOutput = JSON.parse(envelope.output);
            // If top-level says chat, treat as chat
            if (envelope.action_type === "chat") {
                return { action_type: "chat", message: typeof parsedOutput === "string" ? parsedOutput : JSON.stringify(parsedOutput) } as any;
            }
            return parsedOutput as ParsedBackendOutput;
        } catch {
            return undefined;
        }
    }, []);

    const handle = useCallback(async (envelope: BackendResponseEnvelope, overrides?: { recipient?: `0x${string}`; amount?: string | number }) => {
        console.log("🔍 Transaction Handler - Starting with envelope:", envelope);

        const parsed = parseEnvelope(envelope);
        console.log("🔍 Parsed envelope:", parsed);

        if (!parsed) {
            console.log("❌ Failed to parse envelope");
            setLastResult({ status: "error", error: "Unable to parse backend output" });
            return { ok: false as const };
        }
        if (parsed.action_type !== "transaction") {
            console.log("ℹ️ Not a transaction, action_type:", parsed.action_type);
            setLastResult({ status: "ready" });
            return { ok: true as const, nonTx: true as const };
        }

        if (!isConnected) {
            console.log("❌ Wallet not connected");
            setLastResult({ status: "error", error: "Wallet not connected" });
            return { ok: false as const };
        }

        // Handle both flat transaction objects and backends that wrap details
        // inside a `transaction` field: { action_type: 'transaction', transaction: { ... } }
        let tx: BackendTransactionDetails;
        if ((parsed as any).transaction) {
            tx = (parsed as any).transaction as BackendTransactionDetails;
            console.log("🔍 Normalized nested transaction object:", tx);
        } else {
            tx = parsed as BackendTransactionDetails;
            console.log("🔍 Transaction details:", tx);
        }

        const targetChainId = getChainIdByName(tx.chain as any);
        console.log("🔍 Target chain:", tx.chain, "Chain ID:", targetChainId);

        if (!targetChainId) {
            console.log("❌ Unsupported chain:", tx.chain);
            setLastResult({ status: "error", error: `Unsupported chain: ${tx.chain}` });
            return { ok: false as const };
        }

        setLoading(true);
        console.log("🔄 Starting transaction process...");

        try {
            console.log("🔍 Current chain ID:", chainId, "Target chain ID:", targetChainId);

            if (chainId !== targetChainId) {
                // Don't force the user's wallet to switch networks.
                // Instead, we'll attempt to execute the transaction on whatever network the wallet is currently connected to.
                console.log("⚠️ Target chain (", targetChainId, ") differs from wallet chain (", chainId, "). Will NOT programmatically switch. Attempting to send on current network instead.");
            } else {
                console.log("✅ Already on correct chain");
            }

            const to = (overrides?.recipient ?? tx.recipient) as `0x${string}`;
            const amount = overrides?.amount ?? tx.amount;
            console.log("🔍 Transaction details - To:", to, "Amount:", amount);

            if (!isAddress(to)) {
                console.log("❌ Invalid recipient address:", to);
                setLastResult({ status: "error", error: "Invalid recipient address" });
                return { ok: false as const };
            }

            const value = parseEther(String(amount));
            console.log("🔍 Parsed value:", value.toString());

            console.log("🚀 Sending transaction to MetaMask...");
            // Simple transaction - let MetaMask handle gas estimation
                try {
                    const res = await sendTransactionAsync({ to, value });
                    console.log("✅ Transaction sent successfully, hash:", res);
                    setLastResult({ status: "sent", hash: res });
                    return { ok: true as const, hash: res };
                } catch (sendErr: any) {
                    const name = sendErr?.name || sendErr?.code || "";
                    const shortMessage = sendErr?.shortMessage ?? sendErr?.message ?? "";
                    console.error("❌ sendTransactionAsync error:", name, shortMessage);

                    // If wagmi prevented sending due to connector/connection mismatch, try a raw provider request so MetaMask will prompt on the current network.
                    if ((name === "ConnectorChainMismatchError" || /chain mismatch/i.test(shortMessage)) && typeof window !== "undefined") {
                        const provider = (window as any).ethereum;
                        if (provider?.request && address) {
                            try {
                                console.log("🔁 Falling back to provider.request('eth_sendTransaction') on current network");
                                // value is a bigint from parseEther - convert to hex wei string
                                const hexValue = `0x${value.toString(16)}`;
                                const providerRes = await provider.request({
                                    method: "eth_sendTransaction",
                                    params: [{ from: address, to, value: hexValue }],
                                });
                                console.log("✅ Provider sent transaction, hash:", providerRes);
                                setLastResult({ status: "sent", hash: providerRes });
                                return { ok: true as const, hash: providerRes };
                            } catch (provErr: any) {
                                console.error("❌ Provider eth_sendTransaction failed:", provErr?.message ?? provErr);
                                throw provErr;
                            }
                        } else {
                            console.warn("⚠️ No provider or no account address available for fallback provider request");
                        }
                    }

                    // Re-throw original error for outer handler to catch
                    throw sendErr;
                }
        } catch (e: any) {
            console.error("❌ Transaction error:", e);
            console.error("❌ Error details:", {
                message: e?.message,
                shortMessage: e?.shortMessage,
                reason: e?.reason,
                code: e?.code,
                name: e?.name
            });
            const errorMessage = e?.shortMessage ?? e?.message ?? e?.reason ?? "Transaction failed";
            setLastResult({ status: "error", error: errorMessage });
            return { ok: false as const, error: e, errorMessage };
        } finally {
            console.log("🏁 Transaction process completed");
            setLoading(false);
        }
    }, [parseEnvelope, isConnected, chainId, switchChainAsync, sendTransactionAsync]);

    return useMemo(() => ({ handle, loading, lastResult }), [handle, loading, lastResult]);
}


