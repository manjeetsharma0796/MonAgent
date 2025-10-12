import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Simple health check
export async function GET() {
    return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
}

// Balance Search Agent API endpoints
const BALANCE_SEARCH_BASE_URL = "https://balance-search-agent.onrender.com";

async function getUserId(): Promise<string> {
    try {
        const response = await fetch(`${BALANCE_SEARCH_BASE_URL}/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.user_id || data.userId || data.id || "default-user-id";
    } catch (error: any) {
        console.error("Error getting user ID:", error);
        return "default-user-id";
    }
}

async function callBalanceSearchAgent(userId: string, query: string): Promise<string> {
    try {
        console.log("QUERY=============",`userId: ${userId} \n`, `query: ${query}`)
        const response = await fetch("https://balance-search-agent.onrender.com/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                input: query
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || data.message || data.output || "No response from balance search agent";
    } catch (error: any) {
        return `Error calling balance search agent: ${error?.message ?? error}`;
    }
}

// Simple function to handle chat without complex AI agent
async function handleChat(userId: string, input: string, chatHistory: any[]): Promise<string> {
    // Call the balance search agent directly
    return await callBalanceSearchAgent(userId, input);
}

type ChatBody = {
    input: string;
    chat_history?: { role: "human" | "ai"; content: string }[];
    user_id?: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as ChatBody;
        if (!body?.input || typeof body.input !== "string") {
            return new Response(JSON.stringify({ error: "Missing 'input'" }), { status: 400, headers: { "content-type": "application/json" } });
        }

        // Get or create user_id
        let userId = body.user_id;
        if (!userId) {
            userId = await getUserId();
        }

        const chatHistory = Array.isArray(body.chat_history) ? body.chat_history : [];

        // Use the input directly without modification
        let processedInput = body.input;

        const output = await handleChat(userId, processedInput, chatHistory);

        return new Response(
            JSON.stringify({
                output: output,
                user_id: userId
            }),
            { status: 200, headers: { "content-type": "application/json" } }
        );
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
}


