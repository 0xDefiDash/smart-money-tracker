
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { getCryptoPrice } from './price-service';

// Chain configurations
export const CHAIN_CONFIGS: Record<string, {
  network: Network;
  nativeCurrency: string;
  explorer: string;
}> = {
  ethereum: {
    network: Network.ETH_MAINNET,
    nativeCurrency: 'ETH',
    explorer: 'https://etherscan.io'
  },
  bnb: {
    network: Network.BNB_MAINNET,
    nativeCurrency: 'BNB',
    explorer: 'https://bscscan.com'
  },
  polygon: {
    network: Network.MATIC_MAINNET,
    nativeCurrency: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  base: {
    network: Network.BASE_MAINNET,
    nativeCurrency: 'ETH',
    explorer: 'https://basescan.org'
  },
  optimism: {
    network: Network.OPT_MAINNET,
    nativeCurrency: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  },
  arbitrum: {
    network: Network.ARB_MAINNET,
    nativeCurrency: 'ETH',
    explorer: 'https://arbiscan.io'
  }
};

// Get Alchemy instance for specific chain
export function getAlchemy(chain: string = 'ethereum') {
  const config = CHAIN_CONFIGS[chain];
  if (!config) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY not configured');
  }

  return new Alchemy({
    apiKey,
    network: config.network
  });
}

// Fetch wallet balance
export async function getWalletBalance(address: string, chain: string = 'ethereum') {
  const alchemy = getAlchemy(chain);
  const config = CHAIN_CONFIGS[chain];

  try {
    // Get native balance
    const balance = await alchemy.core.getBalance(address, 'latest');
    const balanceInEther = parseFloat(balance.toString()) / 1e18;

    // Get price using our price service
    let priceUSD = 0;
    try {
      const priceData = await getCryptoPrice(config.nativeCurrency);
      priceUSD = priceData || 0;
    } catch {
      priceUSD = 0;
    }
    const balanceUSD = balanceInEther * priceUSD;

    return {
      address,
      chain,
      balance: balanceInEther.toFixed(8),
      balanceUSD: balanceUSD.toFixed(2),
      currency: config.nativeCurrency
    };
  } catch (error: any) {
    console.error(`Error fetching balance for ${chain}:`, error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

// Fetch token balances
export async function getTokenBalances(address: string, chain: string = 'ethereum') {
  const alchemy = getAlchemy(chain);

  try {
    const balances = await alchemy.core.getTokenBalances(address);
    const tokens = [];

    for (const token of balances.tokenBalances) {
      if (token.tokenBalance === '0x0') continue;

      try {
        // Get token metadata
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const balance = parseInt(token.tokenBalance || '0', 16);
        const decimals = metadata.decimals || 18;
        const formattedBalance = balance / Math.pow(10, decimals);

        // Skip if balance is essentially zero
        if (formattedBalance < 0.0001) continue;

        // Get token price (fallback to 0 if not found)
        let priceUSD = 0;
        try {
          const priceData = await getCryptoPrice(metadata.symbol || '');
          priceUSD = priceData || 0;
        } catch {
          priceUSD = 0;
        }

        tokens.push({
          address: token.contractAddress,
          symbol: metadata.symbol || 'Unknown',
          name: metadata.name || 'Unknown Token',
          balance: formattedBalance.toFixed(4),
          decimals,
          price: priceUSD,
          valueUSD: (formattedBalance * priceUSD).toFixed(2)
        });
      } catch (error) {
        console.error(`Error processing token ${token.contractAddress}:`, error);
        continue;
      }
    }

    return tokens;
  } catch (error: any) {
    console.error(`Error fetching token balances for ${chain}:`, error);
    throw new Error(`Failed to fetch token balances: ${error.message}`);
  }
}

// Fetch transaction history
export async function getWalletTransactions(
  address: string,
  chain: string = 'ethereum',
  limit: number = 20
) {
  const alchemy = getAlchemy(chain);

  try {
    const transfers = await alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155
      ],
      maxCount: limit,
      order: SortingOrder.DESCENDING
    });

    const receivedTransfers = await alchemy.core.getAssetTransfers({
      toAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155
      ],
      maxCount: limit,
      order: SortingOrder.DESCENDING
    });

    // Combine and sort by timestamp
    const allTransfers = [...transfers.transfers, ...receivedTransfers.transfers]
      .sort((a, b) => {
        const timeA = new Date((a as any).metadata?.blockTimestamp || 0).getTime();
        const timeB = new Date((b as any).metadata?.blockTimestamp || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);

    return allTransfers.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value?.toString() || '0',
      timestamp: (tx as any).metadata?.blockTimestamp || new Date().toISOString(),
      blockNumber: tx.blockNum,
      blockTimestamp: (tx as any).metadata?.blockTimestamp || new Date().toISOString(),
      tokenTransfers: tx.asset ? [{
        asset: tx.asset,
        value: tx.value,
        valueFormatted: tx.value?.toString() || '0',
        rawContract: tx.rawContract,
        contractAddress: tx.rawContract?.address,
        tokenSymbol: tx.asset,
        decimals: tx.rawContract?.decimal || 18
      }] : []
    }));
  } catch (error: any) {
    console.error(`Error fetching transactions for ${chain}:`, error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
}
