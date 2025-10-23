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
    const { isConnected, chainId } = useAccount();
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
        const parsed = parseEnvelope(envelope);
        if (!parsed) {
            setLastResult({ status: "error", error: "Unable to parse backend output" });
            return { ok: false as const };
        }
        if (parsed.action_type !== "transaction") {
            // not a transaction
            setLastResult({ status: "ready" });
            return { ok: true as const, nonTx: true as const };
        }

        if (!isConnected) {
            setLastResult({ status: "error", error: "Wallet not connected" });
            return { ok: false as const };
        }

        const tx: BackendTransactionDetails = parsed;
        const targetChainId = getChainIdByName(tx.chain as any);
        if (!targetChainId) {
            setLastResult({ status: "error", error: `Unsupported chain: ${tx.chain}` });
            return { ok: false as const };
        }

        setLoading(true);
        try {
            if (chainId !== targetChainId) {
                await switchChainAsync({ chainId: targetChainId });
                setLastResult({ status: "switched" });
            }

            const to = (overrides?.recipient ?? tx.recipient) as `0x${string}`;
            const amount = overrides?.amount ?? tx.amount;
            if (!isAddress(to)) {
                setLastResult({ status: "error", error: "Invalid recipient address" });
                return { ok: false as const };
            }
            const value = parseEther(String(amount));

            const res = await sendTransactionAsync({ to, value });
            setLastResult({ status: "sent", hash: res.hash });
            return { ok: true as const, hash: res.hash };
        } catch (e: any) {
            setLastResult({ status: "error", error: e?.shortMessage ?? e?.message ?? "Transaction failed" });
            return { ok: false as const, error: e };
        } finally {
            setLoading(false);
        }
    }, [parseEnvelope, isConnected, chainId, switchChainAsync, sendTransactionAsync]);

    return useMemo(() => ({ handle, loading, lastResult }), [handle, loading, lastResult]);
}


