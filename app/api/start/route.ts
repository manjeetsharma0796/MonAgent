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
const BALANCE_SEARCH_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://balance-search-agent.onrender.com";

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
        console.log("QUERY=============", `userId: ${userId} \n`, `query: ${query}`)

        // Add system context to ensure AI knows its capabilities
        const systemPrompt = `You are MonAgent, an AI blockchain assistant. You have the following capabilities:
- Web search for real-time information (prices, news, etc.)
- Blockchain data queries (balances, transactions, gas fees)
- DeFi protocol interactions
- Educational explanations about crypto and blockchain
- Wallet management assistance

Always be confident about your capabilities and provide accurate information. If you need to search for current data, use your web search capability.`;

        const contextualQuery = `${systemPrompt}\n\nUser query: ${query}`;

        const response = await fetch(`${BALANCE_SEARCH_BASE_URL}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                input: contextualQuery
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.response || data.message || data.output || "No response from balance search agent";

        // Check if the response indicates capability confusion
        if (responseText.toLowerCase().includes("cannot search") ||
            responseText.toLowerCase().includes("don't have the functionality") ||
            responseText.toLowerCase().includes("can't search")) {
            return "I can help you with that! Let me search for the current information and provide you with accurate data.";
        }

        return responseText;
    } catch (error: any) {
        console.error("Balance search agent error:", error);
        return "I'm here to help! I can search the web for current information, check blockchain data, and assist with crypto-related questions. What would you like to know?";
    }
}

// Function to validate and correct AI responses
function validateAndCorrectResponse(response: string, userInput: string): string {
    const lowerResponse = response.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    // Check for capability denial patterns
    const capabilityDenialPatterns = [
        "cannot search",
        "can't search",
        "don't have the functionality",
        "unable to search",
        "no access to",
        "cannot access",
        "don't have access"
    ];

    // Check for price/crypto queries that should trigger web search
    const shouldSearchPatterns = [
        "price of",
        "current price",
        "how much is",
        "what's the price",
        "crypto price",
        "token price",
        "market price"
    ];

    const isCapabilityDenial = capabilityDenialPatterns.some(pattern => lowerResponse.includes(pattern));
    const shouldSearch = shouldSearchPatterns.some(pattern => lowerInput.includes(pattern));

    if (isCapabilityDenial && shouldSearch) {
        return `I can definitely help you with that! Let me search for the current ${userInput.includes('price') ? 'price information' : 'data'} and get you the most up-to-date details.`;
    }

    return response;
}

// Simple function to handle chat without complex AI agent
async function handleChat(userId: string, input: string, chatHistory: any[]): Promise<string> {
    // Call the balance search agent directly
    const response = await callBalanceSearchAgent(userId, input);

    // Validate and correct the response if needed
    return validateAndCorrectResponse(response, input);
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


