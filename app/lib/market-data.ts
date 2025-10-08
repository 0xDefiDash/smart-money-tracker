
// Enhanced market data utilities for AI agent
export interface MarketData {
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  symbol: string;
  name: string;
  priceHistory: PricePoint[];
  supportLevel?: number;
  resistanceLevel?: number;
  rsi?: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  usdValue: number;
  token: string;
  timestamp: Date;
  type: 'buy' | 'sell' | 'transfer';
  exchange?: string;
  impact: 'high' | 'medium' | 'low';
  walletLabel?: string;
}

export interface TrendingToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  platform: 'pump.fun' | 'zora' | 'bonk.fun';
  marketCap: number;
  holders: number;
  liquidity: number;
  riskLevel: 'low' | 'medium' | 'high';
  socialScore: number;
}

export interface DeFiProtocol {
  name: string;
  tvl: number;
  apy: number;
  category: string;
  chain: string;
  riskScore: number;
  change24h: number;
}

export interface OnChainMetrics {
  activeAddresses: number;
  transactionCount: number;
  networkHashRate?: number;
  gasPrice: number;
  dexVolume: number;
  bridgeInflows: number;
  bridgeOutflows: number;
}

export interface AIMarketInsight {
  type: 'opportunity' | 'warning' | 'trend' | 'alert';
  title: string;
  description: string;
  confidence: number;
  relatedTokens: string[];
  timeframe: 'short' | 'medium' | 'long';
}

// Enhanced mock data with technical analysis - in production, these would connect to real APIs
export const getTopCryptos = async (): Promise<MarketData[]> => {
  const now = Date.now();
  const hour = 3600000;
  
  return [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin',
      price: 121470, 
      change24h: -2.27, 
      change7d: -1.8,
      volume24h: 77457181529, 
      marketCap: 2421063383823,
      priceHistory: Array.from({length: 24}, (_, i) => ({
        timestamp: now - (23-i) * hour,
        price: 121470 + (Math.random() - 0.5) * 3200,
        volume: 3200000000 + Math.random() * 800000000
      })),
      supportLevel: 118000,
      resistanceLevel: 125000,
      rsi: 48.5,
      sentiment: 'neutral' as const
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum',
      price: 4442.52, 
      change24h: -5.21, 
      change7d: -2.3,
      volume24h: 51552953255, 
      marketCap: 536510427363,
      priceHistory: Array.from({length: 24}, (_, i) => ({
        timestamp: now - (23-i) * hour,
        price: 4442.52 + (Math.random() - 0.5) * 220,
        volume: 2150000000 + Math.random() * 500000000
      })),
      supportLevel: 4200,
      resistanceLevel: 4600,
      rsi: 43.8,
      sentiment: 'bearish' as const
    },
    { 
      symbol: 'SOL', 
      name: 'Solana',
      price: 219.25, 
      change24h: -6.02, 
      change7d: -4.1,
      volume24h: 9672562305, 
      marketCap: 119725546634,
      priceHistory: Array.from({length: 24}, (_, i) => ({
        timestamp: now - (23-i) * hour,
        price: 219.25 + (Math.random() - 0.5) * 28,
        volume: 400000000 + Math.random() * 150000000
      })),
      supportLevel: 210,
      resistanceLevel: 230,
      rsi: 39.2,
      sentiment: 'bearish' as const
    },
    { 
      symbol: 'BNB', 
      name: 'BNB',
      price: 1274.99, 
      change24h: 3.85, 
      change7d: 6.2,
      volume24h: 10433000157, 
      marketCap: 177322781508,
      priceHistory: Array.from({length: 24}, (_, i) => ({
        timestamp: now - (23-i) * hour,
        price: 1274.99 + (Math.random() - 0.5) * 60,
        volume: 435000000 + Math.random() * 100000000
      })),
      supportLevel: 1240,
      resistanceLevel: 1300,
      rsi: 67.1,
      sentiment: 'bullish' as const
    },
    { 
      symbol: 'XRP', 
      name: 'XRP',
      price: 2.85, 
      change24h: -4.56, 
      change7d: -3.2,
      volume24h: 7181503772, 
      marketCap: 170648139474,
      priceHistory: Array.from({length: 24}, (_, i) => ({
        timestamp: now - (23-i) * hour,
        price: 2.85 + (Math.random() - 0.5) * 0.15,
        volume: 300000000 + Math.random() * 80000000
      })),
      supportLevel: 2.70,
      resistanceLevel: 3.00,
      rsi: 44.3,
      sentiment: 'bearish' as const
    },
  ];
};

export const getRecentWhaleTransactions = async (): Promise<WhaleTransaction[]> => {
  // Enhanced whale data with more context
  return [
    {
      hash: '0x1234...abcd',
      from: '0x1234567890abcdef',
      to: '0xabcdef1234567890',
      value: 1000000,
      usdValue: 1000000,
      token: 'USDC',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      type: 'buy',
      exchange: 'Binance',
      impact: 'medium',
      walletLabel: 'Institutional Investor'
    },
    {
      hash: '0x5678...efgh',
      from: '0x9876543210fedcba',
      to: '0xfedcba0987654321',
      value: 500,
      usdValue: 1225000,
      token: 'ETH',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      type: 'sell',
      exchange: 'Uniswap',
      impact: 'high',
      walletLabel: 'DeFi Whale'
    },
    {
      hash: '0x9abc...wxyz',
      from: '0xabcdef9876543210',
      to: '0x1357924680acbdef',
      value: 3000000,
      usdValue: 435000,
      token: 'SOL',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      type: 'transfer',
      exchange: 'FTX',
      impact: 'high',
      walletLabel: 'Exchange Hot Wallet'
    }
  ];
};

export const getTrendingTokens = async (): Promise<TrendingToken[]> => {
  return [
    {
      symbol: 'PEPE',
      name: 'Pepe',
      price: 0.00000895,
      change24h: 15.7,
      volume24h: 45000000,
      platform: 'pump.fun',
      marketCap: 3750000000,
      holders: 142000,
      liquidity: 12500000,
      riskLevel: 'high',
      socialScore: 8.3
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.000028,
      change24h: 22.3,
      volume24h: 78000000,
      platform: 'bonk.fun',
      marketCap: 1890000000,
      holders: 89000,
      liquidity: 25600000,
      riskLevel: 'medium',
      socialScore: 7.8
    },
    {
      symbol: 'WIF',
      name: 'Dogwifhat',
      price: 1.85,
      change24h: -5.2,
      volume24h: 156000000,
      platform: 'pump.fun',
      marketCap: 1850000000,
      holders: 67000,
      liquidity: 45000000,
      riskLevel: 'high',
      socialScore: 6.9
    }
  ];
};

export const getMarketSentiment = async () => {
  return {
    fearGreedIndex: 72,
    sentiment: 'Greed',
    dominance: {
      btc: 52.3,
      eth: 17.8,
      others: 29.9
    },
    totalMarketCap: 2450000000000,
    totalVolume24h: 89500000000,
    marketCapChange24h: 1.8,
    altcoinSeason: true,
    defiTvl: 67800000000,
    nftVolume24h: 23400000
  };
};

export const getDeFiProtocols = async (): Promise<DeFiProtocol[]> => {
  return [
    {
      name: 'Uniswap',
      tvl: 5420000000,
      apy: 15.8,
      category: 'DEX',
      chain: 'Ethereum',
      riskScore: 2,
      change24h: 2.3
    },
    {
      name: 'Aave',
      tvl: 8960000000,
      apy: 8.5,
      category: 'Lending',
      chain: 'Ethereum',
      riskScore: 1,
      change24h: 1.7
    },
    {
      name: 'PancakeSwap',
      tvl: 3450000000,
      apy: 28.2,
      category: 'DEX',
      chain: 'BSC',
      riskScore: 3,
      change24h: -0.5
    },
    {
      name: 'JupiterAG',
      tvl: 1280000000,
      apy: 45.6,
      category: 'DEX',
      chain: 'Solana',
      riskScore: 4,
      change24h: 8.9
    }
  ];
};

export const getOnChainMetrics = async (): Promise<OnChainMetrics> => {
  return {
    activeAddresses: 892000,
    transactionCount: 1450000,
    networkHashRate: 520000000,
    gasPrice: 25,
    dexVolume: 8900000000,
    bridgeInflows: 125000000,
    bridgeOutflows: 98000000
  };
};

export const getAIMarketInsights = async (): Promise<AIMarketInsight[]> => {
  return [
    {
      type: 'opportunity',
      title: 'Solana Ecosystem Surge',
      description: 'SOL showing strong momentum with RSI at 71.3 and increased DEX volume. Jupiter DEX TVL up 8.9% in 24h.',
      confidence: 0.87,
      relatedTokens: ['SOL', 'RAY', 'JTO'],
      timeframe: 'short'
    },
    {
      type: 'warning',
      title: 'DOGE Overbought Territory',
      description: 'DOGE RSI at 78.9 indicates potential correction. High social score suggests retail FOMO.',
      confidence: 0.76,
      relatedTokens: ['DOGE', 'SHIB'],
      timeframe: 'short'
    },
    {
      type: 'trend',
      title: 'Institutional ETH Accumulation',
      description: 'Large ETH transfers to cold storage wallets detected. Whale activity up 45% this week.',
      confidence: 0.92,
      relatedTokens: ['ETH'],
      timeframe: 'medium'
    },
    {
      type: 'alert',
      title: 'Bridge Activity Spike',
      description: 'Cross-chain bridge inflows exceed outflows by $27M, indicating capital rotation to Ethereum.',
      confidence: 0.83,
      relatedTokens: ['ETH', 'MATIC', 'ARB'],
      timeframe: 'short'
    }
  ];
};

export const formatPrice = (price: number): string => {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
};

export const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) {
    return `$${(volume / 1000000000).toFixed(2)}B`;
  } else if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(2)}K`;
  } else {
    return `$${volume.toFixed(2)}`;
  }
};
