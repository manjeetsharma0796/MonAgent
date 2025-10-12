# ChainPilot 🚀

Welcome to **ChainPilot** — your AI-powered blockchain copilot for the next generation of crypto users!

## What is ChainPilot?

ChainPilot is an intelligent, user-friendly web app that empowers anyone to:

- 💬 **Chat with an AI agent** about blockchain, DeFi, and crypto topics
- 🔄 **Swap tokens** across chains with simple, guided steps
- 📤 **Send crypto** to anyone, safely and easily
- ⛽ **Check live gas fees** and get real-time blockchain data
- 📊 **Track wallet balances** and view transaction history
- 📚 **Learn blockchain concepts** in plain English
- 🦊 **Connect your wallet** (MetaMask)
- 🔒 **Enjoy non-custodial, secure interactions** — your keys, your crypto, your control

All powered by a conversational AI assistant that makes blockchain accessible for everyone.

---

## 🌐 Currently Supported Blockchains

ChainPilot currently supports:

- **Ethereum**
- **U2U Mainnet**
- **Binance Smart Chain (BSC)**
- **Arbitrum**
- **Polygon**

🛠️ *More chains coming soon — stay tuned!*


---

## 📄 Deployed Contract

- **Contract Address (CT/ChainToken)**: `0x8F807631106cb8c070fb488dCe61affD67921cbf`
- **Block Explorer (U2U Solaris Mainnet)**: [View on U2UScan](https://u2uscan.xyz/address/0x8F807631106cb8c070fb488dCe61affD67921cbf)


---

## 🌟 Capabilities

- **AI Chatbot**: Ask anything about crypto, DeFi, NFTs, or smart contracts
- **Guided Actions**: Swap, send, and interact with contracts through natural language
- **Multi-Chain Support**: Ethereum, Polygon, Solana, Arbitrum, Optimism, and more
- **Real-Time Data**: Get up-to-date gas fees, token prices, and wallet info
- **Educational**: Learn as you go, with clear explanations and step-by-step help
- **Modern UI**: Beautiful, responsive, and theme-aware design

---

## 🚧 Future Goals

- **More Chains**: Add support for additional blockchains and L2s
- **Deeper DeFi**: Integrate lending, staking, and yield farming protocols
- **Personalized AI**: Smarter, context-aware assistant with memory
- **Notifications**: Real-time alerts for transactions and market changes
- **Mobile App**: Native mobile experience for on-the-go blockchain management
- **Open Source**: Community-driven features and plugins

---

**ChainPilot** is your trusted guide to the world of blockchain. Whether you're a beginner or a pro, let the AI and 🦊 MetaMask SDK make your crypto journey smarter, safer, and more fun!

---

## API: Chat Agent (`/api/start`)

This project exposes a chat/agent API implemented directly in Next.js, mirroring a Python LangChain agent.

- Endpoint: `POST /api/start`
- Body:

```json
{
  "input": "What balance of 0x... on polygon?",
  "chat_history": [
    { "role": "human", "content": "Hi" },
    { "role": "ai", "content": "Hello!" }
  ]
}
```

- Response:

```json
{
  "output": "Native: 1.23 MATIC\nUSDC: 10.5",
  "intermediate_steps": null
}
```

### Supported Tools

- `add(a,b)`, `sub(a,b)`, `mul(a,b)`
- `web_search(query)` via SerpAPI
- `get_main_balances(address, chain)` for native, USDC, USDT
- `get_wallet_transactions(address, chain, limit)`

### Environment Variables

Create a `.env.local` at the project root with:

```bash
# Google GenAI (Gemini)
GOOGLE_API_KEY=your_google_genai_api_key

# SerpAPI for web search
SERPAPI_API_KEY=your_serpapi_key

# Explorers
POLYGONSCAN_API_KEY=your_polygonscan_key
ETHERSCAN_API_KEY=your_etherscan_key
BSCSCAN_API_KEY=your_bscscan_key
ARBISCAN_API_KEY=your_arbiscan_key
```

Only chains with an explorer key set will return token balances/transactions. Native balances work without explorer keys.

### Test Quickly

```bash
curl -X POST http://localhost:3000/api/start \
  -H "Content-Type: application/json" \
  -d '{"input":"What balance of 0xB702203B9FD0ee85aeDB9d314C075D480d716635 on polygon?"}'
```

You can also check health with:

```bash
curl http://localhost:3000/api/start
```