import { createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { mainnet, linea, lineaSepolia } from 'wagmi/chains';

const nextConfig = {
  /* config options here */
  ssr: true, // Enable for server-side rendering
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  chains: [mainnet, linea, lineaSepolia],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
  },
};

export default nextConfig;

