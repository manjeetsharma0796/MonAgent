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

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ConnectButton } from "@/components/ConnectButton"
import { useAccount } from "wagmi"
import { formatAddress } from "@/lib/utils"
import { DailyClaim } from "@/components/DailyClaim"
import {
  Brain,
  RefreshCw,
  Send,
  BarChart3,
  FileText,
  Wallet,
  Blocks,
  MessageCircle,
  ArrowRight,
  Star,
  Github,
  Twitter,
  MessageSquare,
  Zap,
  Shield,
  Sparkles,
  ChevronDown,
} from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function LandingPage() {
  useKeepAIBackendAwake();
  const { address, isConnected: walletConnected } = useAccount();
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // User ID initialization
  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem("user_id");
      if (!storedUserId) {
        // Get user_id from balance-search-agent /start endpoint
        try {
          const startResponse = await fetch("https://balance-search-agent.onrender.com/start", {
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
    };

    initializeUser();
  }, []);

  // Send wallet address info to AI when wallet connects
  const sendWalletInfoToAI = async (walletAddress: string) => {
    try {
      const sentKey = `wallet_info_sent_${walletAddress}`;
      const alreadySent = localStorage.getItem(sentKey);

      if (alreadySent) {
        console.log("Wallet info already sent for this address");
        return;
      }

      console.log(`Sending wallet address ${walletAddress} to AI from landing page...`);

      // First ensure we have a user_id
      let currentUserId = userId;
      if (!currentUserId) {
        // Get user_id from localStorage or create new one
        currentUserId = localStorage.getItem("user_id");
        if (!currentUserId) {
          // Get user_id from balance-search-agent /start endpoint
          const startResponse = await fetch("https://balance-search-agent.onrender.com/start", {
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
      const queryResponse = await fetch("https://balance-search-agent.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          input: `My wallet address is ${walletAddress}`
        }),
      });

      if (queryResponse.ok) {
        const data = await queryResponse.json();
        console.log("Wallet info sent successfully to balance-search-agent from landing page:", data);
        localStorage.setItem(sentKey, "1");
      } else {
        console.error("Failed to send wallet info to balance-search-agent");
      }
    } catch (e) {
      console.error("Error sending wallet address to AI from landing page:", e);
    }
  }

  // Send wallet info to AI when wallet connects
  useEffect(() => {
    if (walletConnected && address) {
      sendWalletInfoToAI(address);
    }
  }, [walletConnected, address]);

  const demoMessages = [
    { type: "user", text: "How do I swap ETH for USDC?" },
    { type: "ai", text: "I'll help you swap ETH for USDC! First, let me check current rates and gas fees..." },
  ]

  const features = [
    { icon: Brain, title: "Learn blockchain concepts", desc: "in simple terms", color: "from-purple-500 to-pink-500" },
    { icon: RefreshCw, title: "Swap tokens", desc: "across chains", color: "from-blue-500 to-cyan-500" },
    { icon: Send, title: "Send crypto", desc: "to anyone, safely", color: "from-emerald-500 to-teal-500" },
    { icon: BarChart3, title: "Track wallet balances", desc: "& transactions", color: "from-orange-500 to-red-500" },
    {
      icon: FileText,
      title: "Understand smart contracts",
      desc: "with AI guidance",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Wallet,
      title: "Works with all wallets",
      desc: "MetaMask, WalletConnect, Ledger",
      color: "from-indigo-500 to-blue-500",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Ask Anything",
      description: "Swap tokens, send funds, check gas fees – just ask in plain English.",
      icon: MessageCircle,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      number: "02",
      title: "Get Smart Guidance",
      description: "AI guides you through secure actions or teaches you the concepts behind them.",
      icon: Brain,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      number: "03",
      title: "Act with Confidence",
      description: "Connect your wallet to send, swap, or interact with contracts – all with AI's help.",
      icon: Zap,
      gradient: "from-orange-500 to-red-500",
    },
  ]

  const testimonials = [
    {
      text: "Finally understood bridging thanks to this AI! The explanations are so clear.",
      author: "Sarah K.",
      role: "DeFi Beginner",
      avatar: "👩‍💻",
    },
    {
      text: "Swapped tokens without touching a DEX UI! This is the future of crypto.",
      author: "Mike R.",
      role: "Crypto Trader",
      avatar: "👨‍💼",
    },
    {
      text: "I use it daily to check and send crypto. It's like having a blockchain expert in my pocket.",
      author: "Alex T.",
      role: "Web3 Developer",
      avatar: "👨‍🔬",
    },
  ]

  // Ensure dark mode is applied by default
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
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
          style={{ y: y2 }}
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
          style={{ y: y1 }}
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
        {[...Array(20)].map((_, i) => (
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

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-sm"
      >
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
        <div className="hidden md:flex items-center space-x-8">
          <motion.a
            href="#features"
            className="hover:text-purple-400 transition-colors relative group"
            whileHover={{ y: -2 }}
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full"></span>
          </motion.a>
          <motion.a
            href="#how-it-works"
            className="hover:text-purple-400 transition-colors relative group"
            whileHover={{ y: -2 }}
          >
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full"></span>
          </motion.a>
          <motion.a
            href="#demo"
            className="hover:text-purple-400 transition-colors relative group"
            whileHover={{ y: -2 }}
          >
            Demo
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full"></span>
          </motion.a>
          <Link href="/chat">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent backdrop-blur-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Try Chat
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {/* <Button
              variant="outline"
              className="border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-transparent backdrop-blur-sm"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button> */}
            <ConnectButton />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <DailyClaim />
          </motion.div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* U2U integration tag (top-right, above the fold) */}
        <div className="pointer-events-none">
          <div className="absolute right-6 top-6 z-50 pointer-events-auto">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm" style={{background: 'linear-gradient(90deg, rgba(124,58,237,0.18), rgba(14,165,233,0.12))', backdropFilter: 'blur(6px)'}}>
              <span className="text-white text-[14px] leading-none">🌐 Integrated with U2U Mainnet</span>
            </div>
          </div>
        </div>
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="text-center">
          <motion.div variants={fadeInUp} className="mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Badge className="bg-gradient-to-r from-purple-500/20 to-emerald-500/20 text-purple-600 border-purple-500/30 mb-4 px-6 py-2 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Powered by AI + Web3
              </Badge>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-emerald-200 bg-clip-text text-transparent leading-tight"
          >
            Your AI Copilot for
            <br />
            <motion.span
              className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              Everything Blockchain
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Learn, send, swap, and manage your crypto – just by chatting with our intelligent AI assistant.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/chat">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white px-10 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Chat with the Agent
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-10 py-6 text-xl rounded-full bg-transparent backdrop-blur-sm"
              >
                See What It Can Do
                <ChevronDown className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Floating Cards Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-24 relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {["ETH → USDC Swap", "Send 0.05 ETH", "Check Gas Fees"].map((text, index) => (
              <Link key={text} href="/chat">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="w-4 h-4 bg-emerald-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <span className="text-gray-300 text-lg group-hover:text-white transition-colors">{text}</span>
                  </div>
                  <motion.div
                    className="mt-4 text-sm text-gray-500 group-hover:text-gray-400 transition-colors"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    Click to try this query →
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
              Three simple steps to master blockchain with AI guidance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 backdrop-blur-lg hover:from-white/10 hover:to-white/15 transition-all duration-500 h-full group-hover:scale-105">
                  <CardContent className="p-10">
                    <div className="flex items-center mb-8">
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center mr-6 shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <span className="text-4xl font-bold text-gray-500">{step.number}</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-6 text-white">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-emerald-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Feature Highlights
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to navigate the blockchain world with confidence
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group cursor-pointer"
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 backdrop-blur-lg hover:from-white/10 hover:to-white/15 transition-all duration-500 h-full overflow-hidden relative">
                  <CardContent className="p-10 text-center relative z-10">
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-gray-400 text-lg">{feature.desc}</p>
                  </CardContent>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Supported Chains */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
            <h3 className="text-3xl font-bold mb-12 text-white">Supports Major Chains</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {["Ethereum", "Polygon", "Linea", "Solana", "Arbitrum", "Optimism", "Base", "Avalanche"].map(
                (chain, index) => (
                  <motion.div
                    key={chain}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -5 }}
                  >
                    <Badge className="bg-white/10 text-white border-white/20 px-6 py-3 text-lg hover:bg-white/20 transition-all duration-300 cursor-pointer">
                      {chain}
                    </Badge>
                  </motion.div>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Live Demo Section */}
      <section id="demo" className="relative z-10 py-32 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
              Try our AI assistant with real blockchain queries
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-lg overflow-hidden">
              <CardContent className="p-10">
                <div className="space-y-6 mb-8 h-80 overflow-y-auto">
                  {demoMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: message.type === "user" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md px-6 py-4 rounded-3xl text-lg ${message.type === "user"
                          ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white"
                          : "bg-white/10 text-gray-200 border border-white/20"
                          }`}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Ask about swapping, sending, or learning..."
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 flex-1 text-lg py-6 rounded-2xl"
                    readOnly
                  />
                  <Link href="/chat">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 px-8 py-6 rounded-2xl">
                        <MessageCircle className="w-6 h-6 mr-2" />
                        Start Chatting
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Wallet Connection CTA */}
      <section className="relative z-10 py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-emerald-600/20 border border-purple-500/30 rounded-3xl p-16 backdrop-blur-lg relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-emerald-600/10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Shield className="w-20 h-20 text-emerald-400 mx-auto mb-8" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
                <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                  Wallet connection is non-custodial & secure. Your keys, your crypto, your control.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/chat">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white px-16 py-6 text-2xl font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <MessageCircle className="w-6 h-6 mr-3" />
                        Start Chatting Now
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-transparent backdrop-blur-sm px-16 py-6 text-2xl font-semibold rounded-full"
                    >
                      <Wallet className="w-6 h-6 mr-3" />
                      Connect Wallet
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="relative z-10 py-32 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              What Users Say
            </h2>
            <p className="text-2xl text-gray-400">Real feedback from our community</p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.05, y: -10 }}>
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 backdrop-blur-lg h-full hover:from-white/10 hover:to-white/15 transition-all duration-500">
                  <CardContent className="p-10">
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-300 mb-8 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{testimonial.author}</p>
                        <p className="text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-24 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/">
                <motion.div className="flex items-center space-x-3 mb-6 cursor-pointer" whileHover={{ scale: 1.05 }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Blocks className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    ChainPilot
                  </span>
                </motion.div>
              </Link>
              <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
                Powered by AI + Web3. Built for curious minds who want to master blockchain technology with confidence
                and ease.
              </p>
              <div className="flex space-x-4">
                {[Twitter, MessageSquare, Github].map((Icon, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.2, y: -5 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-card w-12 h-12 rounded-full"
                    >
                      <Icon className="w-6 h-6" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 text-xl">Product</h4>
              <ul className="space-y-4 text-muted-foreground">
                {[
                  { name: "Features", href: "#features" },
                  { name: "How It Works", href: "#how-it-works" },
                  { name: "Chat Interface", href: "/chat" },
                  { name: "Documentation", href: "#" },
                ].map((item) => (
                  <motion.li key={item.name} whileHover={{ x: 5 }}>
                    <Link href={item.href} className="hover:text-foreground transition-colors text-lg">
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 text-xl">Company</h4>
              <ul className="space-y-4 text-muted-foreground">
                {["Privacy Policy", "Terms of Service", "Support", "Contact"].map((item) => (
                  <motion.li key={item} whileHover={{ x: 5 }}>
                    <a href="#" className="hover:text-foreground transition-colors text-lg">
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-lg">© 2025 ChainPilot | Powered by AI + Web3 | 🌐 Integrated with U2U Mainnet</p>
              <div className="flex items-center space-x-4 mt-6 md:mt-0">
                <Input
                  placeholder="Enter your email for updates"
                  className="bg-muted border-border text-foreground placeholder-muted-foreground w-80 text-lg py-3 rounded-2xl"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 px-8 py-3 rounded-2xl text-lg">
                    Subscribe
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
