import { MarkdownRenderer } from './MarkdownRenderer';

const testMarkdown = `# How to Swap Tokens on Uniswap

Here's a step-by-step guide to swap tokens:

## Steps:

1. **Go to Uniswap:** Navigate to the Uniswap web interface.
2. **Connect Wallet:** Connect your MetaMask or other Web3 wallet.
3. **Select Tokens:** Choose the token you want to swap from and to.
4. **Enter Amount:** Input the amount you want to swap.
5. **Review:** Carefully review the transaction details, including the gas fees and the estimated USDC amount.

### Important Considerations:

- **Slippage:** Slippage is the difference between the expected price and the actual price you get due to market fluctuations. Uniswap allows you to set a slippage tolerance. A higher slippage tolerance increases the chance of your transaction going through but might result in a less favorable price.

### Code Example:

\`\`\`javascript
const swapTokens = async () => {
  const tx = await uniswapRouter.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    to,
    deadline
  );
  return tx;
};
\`\`\`

**Note:** Always double-check the contract address and verify you're on the correct network!`;

export function MarkdownTest() {
    return (
        <div className="p-8 bg-gray-900 text-white">
            <h2 className="text-2xl font-bold mb-4">Markdown Rendering Test</h2>
            <MarkdownRenderer content={testMarkdown} />
        </div>
    );
}
