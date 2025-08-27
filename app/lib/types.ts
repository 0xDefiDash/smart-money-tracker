
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  image: string;
}

export interface WhaleTransaction {
  id: string;
  txHash: string;
  blockNumber?: string;
  cryptoId: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  valueUsd: number;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: Date;
  blockchain: string;
  isAlert: boolean;
  alertThreshold?: number;
  cryptocurrency?: {
    symbol: string;
    name: string;
  };
}

export interface ExchangeFlow {
  id: string;
  exchangeName: string;
  cryptocurrency: string;
  flowType: 'inflow' | 'outflow';
  amount: string;
  amountUsd: number;
  timestamp: Date;
}

export interface DailyReportData {
  id: string;
  date: Date;
  totalWhaleTransactions: number;
  totalWhaleVolumeUsd: number;
  topCryptoByVolume?: string;
  largestTransactionUsd?: number;
  topExchangeInflow?: string;
  topExchangeOutflow?: string;
  marketSentiment?: 'bullish' | 'bearish' | 'neutral';
  reportData?: any;
  createdAt: Date;
}

export interface MarketStats {
  totalMarketCap: number;
  totalVolume: number;
  dominance: {
    bitcoin: number;
    ethereum: number;
  };
  whaleActivityCount: number;
  largeTransactionValue: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  volume?: number;
  transactions?: number;
}

export interface AlertConfig {
  id?: string;
  email: string;
  alertType: 'whale_transaction' | 'exchange_flow' | 'daily_report';
  thresholdUsd?: number;
  cryptocurrencies: string[];
  isActive: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}
