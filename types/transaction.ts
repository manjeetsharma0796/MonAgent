export type BackendActionType = "chat" | "transaction";

export type SupportedChainString = "bnb" | "eth" | "matic" | "u2u" | "monad-testnet";

export interface BackendTransactionDetails {
    action_type: "transaction";
    chain: SupportedChainString;
    sender?: `0x${string}`;
    recipient: `0x${string}`;
    amount: number | string; // supports 1e-5
}

export interface BackendChatDetails {
    action_type: "chat";
    message: string;
}

export interface BackendResponseEnvelope {
    output: string; // JSON string
    action_type?: BackendActionType; // optional top-level
}

export type ParsedBackendOutput = BackendTransactionDetails | BackendChatDetails;


