"use client"
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import { mainnet, linea, lineaSepolia } from "wagmi/chains";
import { monadTestnet } from "@/lib/chains/monad";
import { bnb } from "@/lib/chains/bnb";
import { polygon } from "@/lib/chains/polygon";
import { u2u, u2uTestnet } from "@/lib/chains/u2u";
import { metaMask } from "wagmi/connectors";
import { Toaster } from "@/components/ui/toaster";

const metadata: Metadata = {
  title: "MonAgent - AI Blockchain Assistant",
  description: "Manage wallets, check balances, analyze portfolios across any blockchain with AI assistance",
  generator: "v0.dev",
}
// ✅ Create Wagmi config here
const config = createConfig({
  chains: [mainnet, bnb, polygon, u2u, u2uTestnet, linea, lineaSepolia, monadTestnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [bnb.id]: http("https://bsc-dataseed.binance.org"),
    [polygon.id]: http("https://polygon-rpc.com"),
  [u2u.id]: http("https://rpc-mainnet.u2u.xyz"),
  [u2uTestnet.id]: http("https://rpc-nebulas-testnet.uniultra.xyz"),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
    [monadTestnet.id]: http("https://rpc-testnet.monad.xyz"),
  },
  ssr: true,
});

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  const client = new QueryClient();
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={client}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
