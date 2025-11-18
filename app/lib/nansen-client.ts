
/**
 * Nansen API Client
 * 
 * Provides access to institutional-grade blockchain intelligence including:
 * - Smart Money tracking (top 5,000 performing wallets)
 * - Token God Mode analytics
 * - Wallet profiling and PnL tracking
 * - Whale movement detection
 * 
 * Documentation: https://docs.nansen.ai/
 */

const NANSEN_API_KEY = process.env.NANSEN_API_KEY;
const NANSEN_BASE_URL = 'https://api.nansen.ai/api/v1';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Base request function with error handling and caching
 */
async function nansenRequest<T>(
  endpoint: string,
  body: any = {},
  skipCache = false
): Promise<T> {
  if (!NANSEN_API_KEY) {
    throw new Error('NANSEN_API_KEY is not configured');
  }

  const cacheKey = `${endpoint}:${JSON.stringify(body)}`;

  // Check cache first
  if (!skipCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[Nansen] Cache hit for ${endpoint}`);
      return cached.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${NANSEN_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NANSEN_API_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Nansen API error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();

    // Cache successful responses
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Nansen API request timeout after ${REQUEST_TIMEOUT}ms`);
    }
    throw error;
  }
}

/**
 * Clear the cache
 */
export function clearNansenCache(): void {
  cache.clear();
  console.log('[Nansen] Cache cleared');
}

// ============================================================================
// SMART MONEY API
// ============================================================================

export interface SmartMoneyNetflow {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: string;
  netflow: number;
  inflow: number;
  outflow: number;
  smartMoneyCount: number;
  priceUsd?: number;
  marketCap?: number;
}

/**
 * Get Smart Money netflows - tracks what tokens Smart Money wallets are buying/selling
 * 
 * @param chain - Blockchain network (e.g., 'ethereum', 'solana', 'base')
 * @param timeframe - Time period (e.g., '24h', '7d', '30d')
 * @param limit - Number of results (default: 50)
 */
export async function getSmartMoneyNetflows(
  chain: string = 'ethereum',
  timeframe: string = '24h',
  limit: number = 50
): Promise<SmartMoneyNetflow[]> {
  const data = await nansenRequest<any>('/smart-money/netflows', {
    chain,
    timeframe,
    limit,
  });

  return data.data || [];
}

export interface SmartMoneyHolding {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: string;
  totalHoldings: number;
  totalHoldingsUsd: number;
  smartMoneyCount: number;
  avgHoldingPerWallet: number;
}

/**
 * Get Smart Money holdings - what tokens Smart Money wallets currently hold
 */
export async function getSmartMoneyHoldings(
  chain: string = 'ethereum',
  limit: number = 50
): Promise<SmartMoneyHolding[]> {
  const data = await nansenRequest<any>('/smart-money/holdings', {
    chain,
    limit,
  });

  return data.data || [];
}

export interface SmartMoneyDexTrade {
  timestamp: string;
  walletAddress: string;
  walletLabel?: string;
  tokenAddress: string;
  tokenSymbol: string;
  type: 'BUY' | 'SELL';
  amountUsd: number;
  amount: number;
  priceUsd: number;
  dex: string;
  txHash: string;
}

/**
 * Get Smart Money DEX trades - recent trading activity from Smart Money wallets
 */
export async function getSmartMoneyDexTrades(
  chain: string = 'ethereum',
  timeframe: string = '24h',
  limit: number = 100
): Promise<SmartMoneyDexTrade[]> {
  const data = await nansenRequest<any>('/smart-money/dex-trades', {
    chain,
    timeframe,
    limit,
  });

  return data.data || [];
}

// ============================================================================
// TOKEN GOD MODE (TGM) API
// ============================================================================

export interface TokenScreenerResult {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: string;
  marketCap: number;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  holders: number;
  smartMoneyHolders: number;
  smartMoneyNetflow24h: number;
  age: number;
  liquidity?: number;
}

/**
 * Token Screener - discover new and trending tokens
 * 
 * @param filters - Screening filters
 */
export async function tokenScreener(filters: {
  chain?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume24h?: number;
  minPriceChange24h?: number;
  minSmartMoneyHolders?: number;
  limit?: number;
}): Promise<TokenScreenerResult[]> {
  const data = await nansenRequest<any>('/tgm/token-screener', {
    chain: filters.chain || 'ethereum',
    minMarketCap: filters.minMarketCap,
    maxMarketCap: filters.maxMarketCap,
    minVolume24h: filters.minVolume24h,
    minPriceChange24h: filters.minPriceChange24h,
    minSmartMoneyHolders: filters.minSmartMoneyHolders,
    limit: filters.limit || 50,
  });

  return data.data || [];
}

export interface FlowIntelligence {
  tokenAddress: string;
  tokenSymbol: string;
  chain: string;
  flows: {
    smartMoney: { inflow: number; outflow: number; netflow: number };
    exchanges: { inflow: number; outflow: number; netflow: number };
    whales: { inflow: number; outflow: number; netflow: number };
    freshWallets: { inflow: number; outflow: number; netflow: number };
  };
  timestamp: string;
}

/**
 * Flow Intelligence - comprehensive token flow analysis
 */
export async function getFlowIntelligence(
  tokenAddress: string,
  chain: string = 'ethereum',
  timeframe: string = '24h'
): Promise<FlowIntelligence> {
  const data = await nansenRequest<any>('/tgm/flow-intelligence', {
    tokenAddress,
    chain,
    timeframe,
  });

  return data.data;
}

export interface TokenHolder {
  address: string;
  label?: string;
  balance: number;
  balanceUsd: number;
  percentage: number;
  type: 'smart_money' | 'exchange' | 'whale' | 'regular';
}

/**
 * Get top holders of a token
 */
export async function getTokenHolders(
  tokenAddress: string,
  chain: string = 'ethereum',
  limit: number = 100
): Promise<TokenHolder[]> {
  const data = await nansenRequest<any>('/tgm/holders', {
    tokenAddress,
    chain,
    limit,
  });

  return data.data || [];
}

export interface WhoBoughtSold {
  tokenAddress: string;
  tokenSymbol: string;
  chain: string;
  buyers: {
    address: string;
    label?: string;
    amount: number;
    amountUsd: number;
    timestamp: string;
  }[];
  sellers: {
    address: string;
    label?: string;
    amount: number;
    amountUsd: number;
    timestamp: string;
  }[];
}

/**
 * Who bought/sold - recent buyers and sellers of a token
 */
export async function getWhoBoughtSold(
  tokenAddress: string,
  chain: string = 'ethereum',
  timeframe: string = '24h',
  limit: number = 50
): Promise<WhoBoughtSold> {
  const data = await nansenRequest<any>('/tgm/who-bought-sold', {
    tokenAddress,
    chain,
    timeframe,
    limit,
  });

  return data.data;
}

export interface TokenTransfer {
  timestamp: string;
  from: string;
  fromLabel?: string;
  to: string;
  toLabel?: string;
  amount: number;
  amountUsd: number;
  txHash: string;
}

/**
 * Get top token transfers
 */
export async function getTokenTransfers(
  tokenAddress: string,
  chain: string = 'ethereum',
  timeframe: string = '24h',
  limit: number = 100
): Promise<TokenTransfer[]> {
  const data = await nansenRequest<any>('/tgm/transfers', {
    tokenAddress,
    chain,
    timeframe,
    limit,
  });

  return data.data || [];
}

export interface PnLLeaderboardEntry {
  address: string;
  label?: string;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  roi: number;
  winRate: number;
  totalTrades: number;
}

/**
 * PnL Leaderboard - top traders by profit/loss
 */
export async function getPnLLeaderboard(
  tokenAddress?: string,
  chain: string = 'ethereum',
  timeframe: string = '30d',
  limit: number = 100
): Promise<PnLLeaderboardEntry[]> {
  const data = await nansenRequest<any>('/tgm/pnl-leaderboard', {
    tokenAddress,
    chain,
    timeframe,
    limit,
  });

  return data.data || [];
}

// ============================================================================
// PROFILER API - Address/Wallet Analysis
// ============================================================================

export interface WalletBalance {
  address: string;
  chain: string;
  balances: {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    balance: number;
    balanceUsd: number;
    priceUsd: number;
  }[];
  totalValueUsd: number;
}

/**
 * Get current balance of a wallet
 */
export async function getWalletBalance(
  address: string,
  chain: string = 'ethereum'
): Promise<WalletBalance> {
  const data = await nansenRequest<any>('/address/current-balance', {
    address,
    chain,
  });

  return data.data;
}

export interface WalletTransaction {
  timestamp: string;
  txHash: string;
  from: string;
  to: string;
  value: number;
  valueUsd: number;
  gasUsed: number;
  type: string;
  status: 'success' | 'failed';
}

/**
 * Get wallet transaction history
 */
export async function getWalletTransactions(
  address: string,
  chain: string = 'ethereum',
  limit: number = 100
): Promise<WalletTransaction[]> {
  const data = await nansenRequest<any>('/profiler/address/transactions', {
    address,
    chain,
    limit,
  });

  return data.data || [];
}

export interface WalletPnLSummary {
  address: string;
  chain: string;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnl: number;
  roi: number;
  winRate: number;
  totalTrades: number;
  topTrades: {
    tokenSymbol: string;
    pnl: number;
    roi: number;
  }[];
}

/**
 * Get wallet PnL summary
 */
export async function getWalletPnLSummary(
  address: string,
  chain: string = 'ethereum',
  timeframe: string = '30d'
): Promise<WalletPnLSummary> {
  const data = await nansenRequest<any>('/profiler/address/pnl-summary', {
    address,
    chain,
    timeframe,
  });

  return data.data;
}

export interface WalletLabel {
  address: string;
  labels: string[];
  entityName?: string;
  isSmartMoney: boolean;
  isExchange: boolean;
  isWhale: boolean;
}

/**
 * Get labels for a wallet address
 */
export async function getWalletLabels(
  address: string,
  chain: string = 'ethereum'
): Promise<WalletLabel> {
  const data = await nansenRequest<any>('/profiler/address/labels', {
    address,
    chain,
  });

  return data.data;
}

export interface RelatedWallet {
  address: string;
  label?: string;
  relationship: string;
  transactionCount: number;
  totalValueUsd: number;
}

/**
 * Get related wallets (first-degree connections)
 */
export async function getRelatedWallets(
  address: string,
  chain: string = 'ethereum',
  limit: number = 50
): Promise<RelatedWallet[]> {
  const data = await nansenRequest<any>('/profiler/address/related-wallets', {
    address,
    chain,
    limit,
  });

  return data.data || [];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format chain name for Nansen API
 */
export function formatChainName(chain: string): string {
  const chainMap: { [key: string]: string } = {
    eth: 'ethereum',
    ethereum: 'ethereum',
    bsc: 'bnb',
    bnb: 'bnb',
    base: 'base',
    polygon: 'polygon',
    arbitrum: 'arbitrum',
    optimism: 'optimism',
    solana: 'solana',
    sol: 'solana',
  };

  return chainMap[chain.toLowerCase()] || chain.toLowerCase();
}

/**
 * Check if Nansen API is properly configured
 */
export function isNansenConfigured(): boolean {
  return !!NANSEN_API_KEY;
}

/**
 * Get Nansen API status
 */
export async function getNansenStatus(): Promise<{
  configured: boolean;
  working: boolean;
  error?: string;
}> {
  if (!NANSEN_API_KEY) {
    return { configured: false, working: false, error: 'API key not configured' };
  }

  try {
    // Test with a simple Smart Money netflows request
    await getSmartMoneyNetflows('ethereum', '24h', 10);
    return { configured: true, working: true };
  } catch (error: any) {
    return {
      configured: true,
      working: false,
      error: error.message || 'Unknown error',
    };
  }
}

// Export all functions
export default {
  // Smart Money
  getSmartMoneyNetflows,
  getSmartMoneyHoldings,
  getSmartMoneyDexTrades,
  
  // Token God Mode
  tokenScreener,
  getFlowIntelligence,
  getTokenHolders,
  getWhoBoughtSold,
  getTokenTransfers,
  getPnLLeaderboard,
  
  // Profiler
  getWalletBalance,
  getWalletTransactions,
  getWalletPnLSummary,
  getWalletLabels,
  getRelatedWallets,
  
  // Utilities
  formatChainName,
  isNansenConfigured,
  getNansenStatus,
  clearNansenCache,
};
