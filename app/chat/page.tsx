"use client"
// Keep AI backend awake by pinging every 20 minutes
function useKeepAIBackendAwake() {
  useEffect(() => {
    const ping = () => {
      fetch("https://balance-search-agent.onrender.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      text: "👋 Welcome to ChainPilot! I'm your AI blockchain assistant. I can help you swap tokens, send crypto, explain DeFi concepts, check gas fees, and much more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Remove unused isConnected state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // User ID initialization
  useEffect(() => {
    let storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      fetch("https://balance-search-agent.onrender.com/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user_id) {
            localStorage.setItem("user_id", data.user_id);
            setUserId(data.user_id);
            sendInfoToAI();
          }
        });
    } else {
      setUserId(storedUserId);
      sendInfoToAI()
    }
  }, []);

  // Send wallet address info to AI (not shown in frontend) when wallet connects
  const sendInfoToAI = async () => {
    try {
      const sentKey = `wallet_message_sent_on_load_${address}`;
      await fetch("https://balance-search-agent.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `My wallet address is ${address}`,
          user_id: userId,
        }),
      });
      localStorage.setItem(sentKey, "1");
    } catch (e) {
      // Optionally handle error
      console.error("Error sending wallet address to AI:", e);
    }
  }

  // Also send wallet address info to AI on page load (navigation to /chat)
  useEffect(() => {
    // Only send if wallet is connected, address and userId exist, and not already sent
    if (walletConnected && address && userId) {
      const sentKey = `wallet_message_sent_on_load_${address}`;
      if (!localStorage.getItem(sentKey)) {
        (async () => {
          try {
            console.log(`Sending wallet address ${address} to AI on page load...=============================`);
            await fetch("https://balance-search-agent.onrender.com/query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: `My wallet address is ${address}`,
                user_id: userId,
              }),
            });
            localStorage.setItem(sentKey, "1");
          } catch (e) {
            // Optionally handle error
          }
        })();
      }
    }
  }, [walletConnected, address, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send chat message to API
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
      const res = await fetch("https://balance-search-agent.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: textToSend, user_id: userId }),
      });
      const data = await res.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: data.output || "Sorry, I couldn't get a response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "ai",
          text: "Sorry, there was an error connecting to the AI service.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

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
                    ChainPilot
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
                Always verify transaction details before confirming. ChainPilot never stores your private keys.
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
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
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
                ChainPilot AI can make mistakes. Please verify important information and never share private keys.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
