"use client"
// Keep AI backend awake by pinging every 20 minutes
function useKeepAIBackendAwake() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/start", {
        method: "GET",
      });
    };
    // Initial ping
    ping();
    // Set interval for every 20 minutes
    const interval = setInterval(ping, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}

import { ConnectButton } from "@/components/ConnectButton";
import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/utils";

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DailyClaim } from "@/components/DailyClaim"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { useToast } from "@/hooks/use-toast"
import { getChainIdByName } from "@/lib/utils/chainMapping";
import { useSwitchChain } from "wagmi";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog"
import { useTransactionHandler } from "@/hooks/use-transaction-handler"
import type { BackendResponseEnvelope } from "@/types/transaction"

import {
  Bot,
  User,
  Send,
  Loader2,
  ArrowLeft,
  Blocks,
  Wallet,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  text: string
  timestamp: Date
  isTyping?: boolean
}

const suggestedQueries = [
  {
    text: "How do I swap ETH for USDC?",
    icon: RefreshCw,
    category: "Swapping",
  },
  {
    text: "What are the current gas fees?",
    icon: Zap,
    category: "Gas Fees",
  },
  {
    text: "Send 0.1 ETH to my friend",
    icon: Send,
    category: "Transfers",
  },
  {
    text: "Check my wallet balance",
    icon: Wallet,
    category: "Portfolio",
  },
  {
    text: "Explain DeFi yield farming",
    icon: TrendingUp,
    category: "Learning",
  },
  {
    text: "How to bridge tokens to Polygon?",
    icon: Shield,
    category: "Bridging",
  },
]

const aiResponses = [
  "I can help you with that! Let me break down the process step by step...",
  "Great question! Here's what you need to know about blockchain transactions...",
  "I'll guide you through this safely. First, let's check the current gas fees...",
  "That's a smart move! Here are the best practices for this operation...",
  "Let me explain this concept in simple terms and show you how to do it...",
  "Perfect! I'll help you understand this and walk you through the process...",
  "Excellent question! This is a common scenario in DeFi. Here's how to approach it...",
  "I'll help you with that transaction. Let me first verify the details and check for any potential issues...",
]

export default function ChatPage() {
  useKeepAIBackendAwake();
  const { address, isConnected: walletConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Remove unused isConnected state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { handle: handleTx, loading: txLoading } = useTransactionHandler();
  const { switchChainAsync } = useSwitchChain();
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [pendingEnvelope, setPendingEnvelope] = useState<BackendResponseEnvelope | null>(null);
  const [pendingDefaults, setPendingDefaults] = useState<{ chainLabel: string; chainValue: string; recipient: `0x${string}`; amount: string | number } | null>(null);
  const [txInProgress, setTxInProgress] = useState(false);

  // User ID initialization and welcome message setup
  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem("user_id");
      if (!storedUserId) {
        // Get user_id from balance-search-agent /start endpoint
        try {
          const startResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://mon-agent-jade.vercel.app"}/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });

          if (startResponse.ok) {
            const startData = await startResponse.json();
            storedUserId = startData.user_id;
            if (storedUserId) {
              localStorage.setItem("user_id", storedUserId);
              setUserId(storedUserId);
            }
          }
        } catch (error) {
          console.error("Failed to get user_id from balance-search-agent:", error);
        }
      } else {
        setUserId(storedUserId);
      }

      // Set initial welcome message based on wallet connection status
      const welcomeMessage = walletConnected && address
        ? `👋 Welcome to MonAgent! I'm your AI blockchain assistant. I can see you're connected with wallet ${formatAddress(address)}. 

I can help you with:
🔍 Real-time web search (crypto prices, news, market data)
💰 Check wallet balances and transactions
🔄 Swap tokens and manage DeFi protocols
📚 Explain blockchain concepts and DeFi strategies
⛽ Check gas fees and optimize transactions
🔐 Secure wallet management and best practices

What would you like to know?`
        : `👋 Welcome to MonAgent! I'm your AI blockchain assistant.

I can help you with:
🔍 Real-time web search (crypto prices, news, market data)
💰 Check wallet balances and transactions
🔄 Swap tokens and manage DeFi protocols
📚 Explain blockchain concepts and DeFi strategies
⛽ Check gas fees and optimize transactions
🔐 Secure wallet management and best practices

Connect your wallet to get personalized assistance with your specific wallet address. What would you like to know?`;

      setMessages([{
        id: "welcome",
        type: "ai",
        text: welcomeMessage,
        timestamp: new Date(),
      }]);
    };

    initializeUser();
  }, [walletConnected, address]);

  // Send wallet address info to AI (not shown in frontend) when wallet connects
  const sendWalletInfoToAI = async (walletAddress: string) => {
    try {
      const sentKey = `wallet_info_sent_${walletAddress}`;
      const alreadySent = localStorage.getItem(sentKey);

      if (alreadySent) {
        console.log("Wallet info already sent for this address");
        return;
      }

      console.log(`Sending wallet address ${walletAddress} to AI...`);

      // First ensure we have a user_id
      let currentUserId = userId;
      if (!currentUserId) {
        // Get user_id from localStorage or create new one
        currentUserId = localStorage.getItem("user_id");
        if (!currentUserId) {
          // Get user_id from balance-search-agent /start endpoint
          const startResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://mon-agent-jade.vercel.app"}/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });

          if (startResponse.ok) {
            const startData = await startResponse.json();
            currentUserId = startData.user_id;
            if (currentUserId) {
              localStorage.setItem("user_id", currentUserId);
              setUserId(currentUserId);
            }
          } else {
            console.error("Failed to get user_id from balance-search-agent");
            return;
          }
        }
      }

      // Now send wallet info to balance-search-agent /query endpoint
      const queryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://mon-agent-jade.vercel.app"}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          input: `My wallet address is ${walletAddress}`
        }),
      });

      if (queryResponse.ok) {
        console.log("queryResponse=============", queryResponse)
        const data = await queryResponse.json();
        console.log("Wallet info sent successfully to balance-search-agent:", data);
        localStorage.setItem(sentKey, "1");

        // Update the welcome message to show wallet is connected
        setMessages(prev => prev.map(msg =>
          msg.id === "welcome"
            ? { ...msg, text: `👋 Welcome to MonAgent! I'm your AI blockchain assistant. I can see you're connected with wallet ${formatAddress(walletAddress)}. I can help you swap tokens, send crypto, check balances, explain DeFi concepts, and much more. What would you like to know?` }
            : msg
        ));
      } else {
        console.error("Failed to send wallet info to balance-search-agent");
      }
    } catch (e) {
      console.error("Error sending wallet address to AI:", e);
    }
  }

  // Send wallet address info to AI when wallet connects
  useEffect(() => {
    if (walletConnected && address) {
      sendWalletInfoToAI(address);
    }
  }, [walletConnected, address]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send chat message to API - FIXED: Send user input exactly as typed without modification
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || !userId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Send user input exactly as typed
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://balance-search-agent.onrender.com"}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          input: textToSend,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Backend raw response:", data);

      // Parse the inner JSON string from `output`
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(data.output);
      } catch (parseError) {
        console.error("Failed to parse output JSON:", parseError);
        throw new Error("Invalid response format from backend");
      }

      const { action_type, message, transaction } = parsedOutput;

      if (action_type === "chat") {
        // Display the AI message
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          text: message || "Sorry, I couldn't generate a response.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
      else if (action_type === "transaction") {
        // Step 1: Show "Transaction Initiating..." message
        const initiatingMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          text: "🔄 Transaction initiating... Please confirm in your wallet.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, initiatingMessage]);

        // Step 2: Prepare transaction envelope in expected format
        // Handle both nested and flat transaction structures
        const transactionData = transaction || parsedOutput;
        if (!transactionData.recipient || !transactionData.amount || !transactionData.chain) {
          toast({ title: "Error", description: "Missing transaction details.", variant: "destructive" });
          return;
        }

        const { recipient, amount, chain } = transactionData;
        const chainLabelMap: Record<string, string> = {
          bnb: "BNB Smart Chain",
          bsc: "BNB Smart Chain",
          eth: "Ethereum",
          matic: "Polygon",
          "monad_testnet": "Monad Testnet",
          "monad-testnet": "Monad Testnet", // handle both formats
          u2u: "U2U Network",
        };

        const chainLabel = chainLabelMap[chain] || chain;

        // Create envelope matching your expected type
        const envelope: BackendResponseEnvelope = {
          output: data.output, // original string
          action_type: "transaction",
        };

        setPendingEnvelope(envelope);
        setPendingDefaults({ chainLabel, chainValue: chain, recipient, amount });

        // Step 3: Open confirmation dialog so user explicitly confirms (prevents accidental double-sends)
        // If you prefer automatic send, replace the next line with the commented setTimeout call.
        setTxDialogOpen(true);
        // To auto-send without dialog, use:
        // setTimeout(() => { confirmAndSendTx(recipient, amount); }, 500);
      }
      else {
        // Unknown action type
        const aiMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: "ai",
          text: "I received an unexpected response type. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          type: "ai",
          text: "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const confirmAndSendTx = async (recipient: `0x${string}`, amount: string | number) => {
    if (!pendingEnvelope || !pendingDefaults) return;
    if (txInProgress) return; // prevent duplicate sends
    setTxInProgress(true);
    setTxDialogOpen(false);
    toast({ title: "Sending transaction", description: `To ${formatAddress(recipient)} on ${pendingDefaults.chainLabel}` });
    const res = await handleTx(pendingEnvelope, { recipient, amount });
    if ((res as any).ok) {
      const hash = (res as any).hash as `0x${string}` | undefined;
      toast({ title: "Transaction sent", description: hash ? `Hash: ${hash}` : "Submitted in wallet" });
      setMessages(prev => [...prev, {
        id: (Date.now() + 3).toString(),
        type: "ai",
        text: `Transaction sent on ${pendingDefaults.chainLabel} to ${formatAddress(recipient)} for ${amount}.`,
        timestamp: new Date(),
      }]);
    } else {
      const errorMsg = (res as any).errorMessage || (res as any).error?.message || (res as any).error?.shortMessage || "Please try again";
      toast({ title: "Transaction failed", description: errorMsg, variant: "destructive" });
      setMessages(prev => [...prev, {
        id: (Date.now() + 4).toString(),
        type: "ai",
        text: `❌ Transaction failed: ${errorMsg}`,
        timestamp: new Date(),
      }]);
    }
    setPendingEnvelope(null);
    setPendingDefaults(null);
    setTxInProgress(false);
  }

  // Called when user chooses to switch wallet network to the backend's target chain and then send
  const handleSwitchAndSend = async (recipient: `0x${string}`, amount: string | number) => {
    if (!pendingDefaults) return;
    const backendChain = (pendingDefaults.chainLabel || "").toString();
    // Try to map label back to a chain id; chainLabel is a friendly label, so prefer using the pendingEnvelope transaction.chain if available
    let targetChainId: number | undefined;
    try {
      // If pendingEnvelope exists, try to parse the transaction.chain from it
      if (pendingEnvelope) {
        const parsed = JSON.parse(pendingEnvelope.output);
        const transaction = (parsed as any).transaction;
        if (transaction && transaction.chain) {
          targetChainId = getChainIdByName(transaction.chain);
        }
      }
    } catch (e) {
      // noop
    }

    // Use the original chain value if available (most reliable)
    if (!targetChainId && pendingDefaults.chainValue) {
      targetChainId = getChainIdByName(pendingDefaults.chainValue);
    }

    // Fallback: try to infer from the friendly label (lowercased)
    if (!targetChainId) {
      targetChainId = getChainIdByName(backendChain.replace(/ /g, "").toLowerCase());
    }

    if (!targetChainId) {
      toast({ title: "Unable to determine target chain", description: `Can't resolve a chain id for ${backendChain}`, variant: 'destructive' });
      return;
    }

    try {
      // Attempt to switch the wallet network
      if (!switchChainAsync) {
        toast({ title: "Switch not supported", description: "This wallet doesn't support programmatic network switching.", variant: 'destructive' });
        return;
      }
      toast({ title: "Switching network", description: `Requesting wallet to switch to chain id ${targetChainId}...` });
      await switchChainAsync({ chainId: targetChainId });
      // After successful switch, call confirmAndSendTx which will send
      await confirmAndSendTx(recipient, amount);
    } catch (e: any) {
      console.error('Network switch failed:', e);
      toast({ title: 'Network switch failed', description: e?.message || String(e), variant: 'destructive' });
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuery = (query: string) => {
    handleSendMessage(query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/">
                <motion.div
                  className="flex items-center space-x-3 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Blocks className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    MonAgent
                  </span>
                </motion.div>
              </Link>
              <div className="hidden md:flex items-center space-x-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  <Bot className="w-4 h-4 mr-1" />
                  AI Assistant
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Beta
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ConnectButton />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <DailyClaim />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block w-80 border-r border-white/10 bg-black/20 backdrop-blur-lg"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 text-white">Suggested Queries</h3>
            <div className="space-y-3">
              {suggestedQueries.map((query, index) => (
                <motion.div
                  key={query.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="cursor-pointer"
                  onClick={() => handleSuggestedQuery(query.text)}
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <query.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white group-hover:text-purple-300 transition-colors">
                            {query.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{query.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-600/20 to-emerald-600/20 border border-purple-500/30 rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Security Notice</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Always verify transaction details before confirming. MonAgent never stores your private keys.
              </p>
            </div>
          </div>
        </motion.aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-4 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                  >
                    {/* Avatar */}
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user"
                        ? "bg-gradient-to-r from-purple-600 to-emerald-600"
                        : "bg-gradient-to-r from-gray-600 to-gray-700"
                        }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {message.type === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </motion.div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div
                        className={`px-6 py-4 rounded-3xl ${message.type === "user"
                          ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white"
                          : "bg-white/10 text-gray-200 border border-white/20"
                          }`}
                      >
                        {message.type === "ai" ? (
                          <MarkdownRenderer
                            content={message.text}
                            className="text-sm leading-relaxed"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        )}
                      </div>

                      {/* Message Actions */}
                      <div className="flex items-center justify-between mt-2 px-2">
                        <p className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {message.type === "ai" && (
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-500 hover:text-emerald-400 transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(message.text);
                                toast({
                                  title: "Copied!",
                                  description: "Message copied to clipboard",
                                });
                              }}
                              title="Copy message"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-500 hover:text-emerald-400 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-3xl">
                        <div className="flex space-x-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>
          </ScrollArea>

          {/* Chat Input */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="border-t border-white/10 bg-black/20 backdrop-blur-lg p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about blockchain, crypto, DeFi, or Web3..."
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-2xl py-4 px-6 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    disabled={isTyping}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">Enter</kbd>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-2xl h-auto"
                  >
                    {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {["💱 Swap", "📤 Send", "⛽ Gas Fees", "📊 Portfolio", "🎓 Learn"].map((action) => (
                  <motion.button
                    key={action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestedQuery(action.split(" ")[1])}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-300"
                  >
                    {action}
                  </motion.button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                MonAgent AI can make mistakes. Please verify important information and never share private keys.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {pendingDefaults && (
        <TransactionConfirmDialog
          open={txDialogOpen}
          onOpenChange={setTxDialogOpen}
          chainLabel={pendingDefaults.chainLabel}
          defaultRecipient={pendingDefaults.recipient}
          defaultAmount={pendingDefaults.amount}
          onConfirm={confirmAndSendTx}
          onSwitchAndConfirm={handleSwitchAndSend}
          loading={txLoading}
        />
      )}
    </div>
  )
}