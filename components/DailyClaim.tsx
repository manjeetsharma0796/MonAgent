"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { toast } from "@/components/ui/use-toast"
import { Coins, ChevronDown, Loader2, Wallet } from "lucide-react"
import { DAILY_CLAIM_ABI, DAILY_CLAIM_CONTRACT } from "@/lib/contracts"
import { parseUnits } from "viem"

export function DailyClaim() {
    const { isConnected, address } = useAccount()
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
    const { writeContractAsync, isPending } = useWriteContract()

    const contractReady = useMemo(() => {
        return Boolean(DAILY_CLAIM_CONTRACT && DAILY_CLAIM_ABI && DAILY_CLAIM_ABI.length > 0)
    }, [])

    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isReceiptError } = useWaitForTransactionReceipt({
        hash: txHash,
    })

    const disabledReason = useMemo(() => {
        if (!isConnected) return "Connect wallet"
        if (!contractReady) return "Contract not configured"
        return undefined
    }, [isConnected, contractReady])

    const handleClaim = async () => {
        if (!contractReady) {
            toast({
                title: "Daily Claim unavailable",
                description: "Contract address or ABI not configured.",
                variant: "destructive",
            })
            return
        }
        if (!address) {
            toast({ title: "Connect wallet", description: "Please connect your wallet first." })
            return
        }
        try {
            const submitting = toast({
                title: "Initiating claim",
                description: "Minting 10 CP (18 decimals). Confirm in your wallet...",
            })
            const hash = await writeContractAsync({
                abi: DAILY_CLAIM_ABI as any,
                address: DAILY_CLAIM_CONTRACT as `0x${string}`,
                functionName: "mint",
                args: [address, parseUnits("10", 18)],
            })
            submitting.update({ title: "Transaction submitted", description: `Hash: ${hash.slice(0, 10)}…` })
            setTxHash(hash)
        } catch (e: any) {
            toast({
                title: "Transaction failed to submit",
                description: e?.shortMessage || e?.message || "User rejected or RPC error",
                variant: "destructive",
            })
        }
    }

    const handleWithdraw = async () => {
        toast({
            title: "Withdraw not supported",
            description: "The provided contract does not implement withdraw().",
        })
    }

    if (isConfirmed) {
        toast({ title: "Transaction confirmed", description: "Success on-chain ✅" })
    } else if (isReceiptError) {
        toast({ title: "Transaction failed", description: "Receipt indicated failure", variant: "destructive" })
    } else if (isConfirming) {
        toast({ title: "Pending confirmation", description: "Waiting for finality..." })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="bg-card text-card-foreground h-fit md:px-3 py-2 rounded-2xl font-semibold flex items-center gap-2 border border-white/10">
                <Coins className="w-4 h-4" />
                Daily Claim
                <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl bg-popover text-popover-foreground">
                <DropdownMenuItem asChild>
                    <button
                        onClick={handleClaim}
                        disabled={Boolean(disabledReason) || isPending}
                        className="w-full flex items-center gap-2 p-2 disabled:opacity-50"
                        title={disabledReason}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                        Claim 10 CP (18 dp)
                    </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <button
                        onClick={handleWithdraw}
                        disabled={Boolean(disabledReason) || isPending}
                        className="w-full flex items-center gap-2 p-2 disabled:opacity-50"
                        title={disabledReason}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                        Withdraw
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


