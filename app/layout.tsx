"use client"
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import { mainnet, linea, lineaSepolia } from "wagmi/chains";
import { u2uMainnet } from "@/lib/chains/u2u";
import { metaMask } from "wagmi/connectors";
import { Toaster } from "@/components/ui/toaster";

const metadata: Metadata = {
  title: "ChainPilot - AI Blockchain Assistant",
  description: "Manage wallets, check balances, analyze portfolios across any blockchain with AI assistance",
  generator: "v0.dev",
}
// ✅ Create Wagmi config here
const config = createConfig({
  chains: [mainnet, linea, lineaSepolia, u2uMainnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
    [u2uMainnet.id]: http("https://rpc-mainnet.u2u.xyz"),
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
