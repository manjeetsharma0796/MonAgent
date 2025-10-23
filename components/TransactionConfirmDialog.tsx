"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isAddress } from "viem";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chainLabel: string;
    defaultRecipient: `0x${string}`;
    defaultAmount: string | number;
    onConfirm: (recipient: `0x${string}`, amount: string | number) => Promise<void> | void;
    onSwitchAndConfirm?: (recipient: `0x${string}`, amount: string | number) => Promise<void> | void;
    loading?: boolean;
};

export function TransactionConfirmDialog({ open, onOpenChange, chainLabel, defaultRecipient, defaultAmount, onConfirm, onSwitchAndConfirm, loading }: Props) {
    const [recipient, setRecipient] = useState<string>(defaultRecipient);
    const [amount, setAmount] = useState<string>(String(defaultAmount));

    const valid = isAddress(recipient as `0x${string}`) && Number(amount) > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Transfer</DialogTitle>
                    <DialogDescription>
                        You are about to send funds on {chainLabel}. Please review and confirm.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <div>
                        <label className="text-sm">Recipient</label>
                        <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
                    </div>
                    <div>
                        <label className="text-sm">Amount (native)</label>
                        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.01" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    {onSwitchAndConfirm && (
                        <Button variant="ghost" onClick={() => onSwitchAndConfirm(recipient as `0x${string}`, amount)} disabled={!valid || loading}>
                            {loading ? "Processing..." : "Switch & Send"}
                        </Button>
                    )}
                    <Button onClick={() => onConfirm(recipient as `0x${string}`, amount)} disabled={!valid || loading}>
                        {loading ? "Processing..." : "Send on current network"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


