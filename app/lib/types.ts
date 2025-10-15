
import { Prisma } from '@prisma/client'

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
  topCryptocurrencies: string[];
  sentimentScore?: number;
  marketMovers?: string[];
  majorAlerts?: string[];
}

export interface PrismaUserData {
  id: string
  email: string
  name?: string | null
  emailVerified?: Date | null
  image?: string | null
  password?: string | null
  preferences?: Prisma.JsonValue | null
  watchlist?: Prisma.JsonValue | null
  alertsEnabled?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TrendingToken {
  id: string
  name: string
  symbol: string
  address: string
  blockchain: string
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  holders: number
  marketCap: number
  platform: string
  isVerified: boolean
  firstSeen: string
  socialLinks?: {
    twitter?: string
    telegram?: string
    website?: string
  }
}

export interface BlockWarsPlayer {
  id: string
  username: string
  avatar: string
  level: number
  xp: number
  rank: string
  score: number
  wins: number
  losses: number
  winRate: number
  badges: string[]
  joinDate: string
}

// CA Detector Types
export interface ContractInfo {
  name: string
  symbol: string
  totalSupply: string
  decimals: number
  isVerified: boolean
  age: string
}

export interface SecurityCheck {
  name: string
  description: string
  passed: boolean
  severity: 'critical' | 'warning' | 'info'
  details?: string
}

export interface WalletTransaction {
  hash: string
  type: 'buy' | 'sell' | 'transfer'
  amount: string
  amountUsd: string
  timestamp: string
  from: string
  to: string
  gasFee?: string
}

export interface DetailedWalletAnalysis {
  address: string
  fullAddress: string
  totalTransactions: number
  firstTransaction: string
  lastTransaction: string
  totalBought: string
  totalSold: string
  currentProfit: string
  profitPercentage: number
  averageHoldTime: string
  tradingFrequency: string
  suspiciousPatterns: string[]
  recentTransactions: WalletTransaction[]
  riskScore: number
}

export interface TopHolder {
  address: string
  percentage: number
  balance: string
  label?: string
  riskLevel?: 'high' | 'medium' | 'low' | 'clean'
  riskFlags?: string[]
  walletAge?: string
  previousScams?: number
  detailedAnalysis?: DetailedWalletAnalysis
}

export interface HolderAnalysis {
  totalHolders: number
  top10Percentage: number
  contractHoldings: number
  topHolders: TopHolder[]
  holdersDataUnavailable?: boolean
  holdersDataError?: string | null
}

export interface LiquidityPool {
  dex: string
  pair: string
  liquidityUSD: string
  volume24h: string
}

export interface LiquidityInfo {
  totalLiquidityUSD: string
  isLocked: boolean
  lockUntil?: string
  pools: LiquidityPool[]
}

export interface TransactionAnomaly {
  type: string
  description: string
  timestamp: string
  severity?: 'critical' | 'high' | 'medium' | 'low'
  affectedWallets?: string[]
}

export interface WalletPatternAlert {
  alertType: 'pump_dump_wallet' | 'coordinated_trading' | 'wash_trading' | 'suspicious_pattern' | 'insider_wallet' | 'bot_activity'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  wallets: string[]
  evidence: string[]
  timestamp: string
}

export interface KnownScammerWallet {
  address: string
  riskScore: number
  scamCount: number
  totalLoss: string
  lastScam: string
  scamTypes: string[]
}

export interface TransactionAnalysis {
  totalTransactions: number
  uniqueWallets: number
  volume24h: string
  avgBuySize: string
  avgSellSize: string
  buySellRatio: string
  anomalies: TransactionAnomaly[]
  walletPatternAlerts: WalletPatternAlert[]
  knownScammers: KnownScammerWallet[]
}

export interface ContractReport {
  criticalConcerns: string[]
  warnings: string[]
  positiveIndicators: string[]
  recommendation: string
}

export interface ContractAnalysisResult {
  contractAddress: string
  blockchain: string
  riskScore: number
  contractInfo: ContractInfo
  securityChecks: SecurityCheck[]
  holderAnalysis: HolderAnalysis
  liquidityInfo: LiquidityInfo
  transactionAnalysis: TransactionAnalysis
  report: ContractReport
}
