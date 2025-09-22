
// Market data utilities for AI agent
export interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  symbol: string;
}

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  token: string;
  timestamp: Date;
  type: 'buy' | 'sell' | 'transfer';
}

export interface TrendingToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  platform: 'pump.fun' | 'zora' | 'bonk.fun';
}

// Mock data for demonstration - in production, these would connect to real APIs
export const getTopCryptos = async (): Promise<MarketData[]> => {
  // This would normally fetch from CoinGecko, CoinMarketCap, etc.
  return [
    { symbol: 'BTC', price: 67500, change24h: 2.5, volume24h: 28000000000, marketCap: 1330000000000 },
    { symbol: 'ETH', price: 2450, change24h: 1.8, volume24h: 15000000000, marketCap: 295000000000 },
    { symbol: 'SOL', price: 145, change24h: 4.2, volume24h: 2500000000, marketCap: 68000000000 },
    { symbol: 'BNB', price: 585, change24h: 1.2, volume24h: 1800000000, marketCap: 85000000000 },
    { symbol: 'DOGE', price: 0.12, change24h: 8.5, volume24h: 800000000, marketCap: 17000000000 },
  ];
};

export const getRecentWhaleTransactions = async (): Promise<WhaleTransaction[]> => {
  // Mock whale data
  return [
    {
      hash: '0x1234...abcd',
      from: '0x1234567890abcdef',
      to: '0xabcdef1234567890',
      value: 1000000,
      token: 'USDC',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      type: 'buy'
    },
    {
      hash: '0x5678...efgh',
      from: '0x9876543210fedcba',
      to: '0xfedcba0987654321',
      value: 500000,
      token: 'ETH',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      type: 'sell'
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
      platform: 'pump.fun'
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.000028,
      change24h: 22.3,
      volume24h: 78000000,
      platform: 'bonk.fun'
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
    totalMarketCap: 2450000000000
  };
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
