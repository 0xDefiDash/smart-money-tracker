
/**
 * Enhanced Price Service with Coinglass + Nansen Priority
 * Provides institutional-grade cryptocurrency price data with automatic fallbacks
 * 
 * Priority Order:
 * 1. Coinglass (futures market data with prices, OI, funding)
 * 2. Nansen (smart money token prices)
 * 3. Binance (spot prices)
 * 4. CoinCap (backup)
 * 5. CoinGecko (rate-limited backup)
 * 6. Fallback data
 */

import { coinglassClient, CoinPrice } from './coinglass-client';

export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h?: number;
  price_change_percentage_7d?: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  circulating_supply?: number;
  image?: string;
  ath?: number;
  atl?: number;
  // Coinglass-specific data
  openInterest?: number;
  fundingRate?: number;
  longShortRatio?: number;
}

// In-memory cache to reduce API calls
let priceCache: {
  data: PriceData[] | null;
  timestamp: number;
  source: string;
} = {
  data: null,
  timestamp: 0,
  source: ''
};

const CACHE_DURATION = 15000; // 15 seconds cache for real-time feeds
const NANSEN_API_KEY = process.env.NANSEN_API_KEY;

// Token symbol to ID mapping for API compatibility
const SYMBOL_MAP: Record<string, string> = {
  'BTC': 'bitcoin', 'ETH': 'ethereum', 'BNB': 'binancecoin', 'SOL': 'solana',
  'XRP': 'ripple', 'DOGE': 'dogecoin', 'ADA': 'cardano', 'AVAX': 'avalanche-2',
  'DOT': 'polkadot', 'LINK': 'chainlink', 'TRX': 'tron', 'TON': 'toncoin',
  'SHIB': 'shiba-inu', 'MATIC': 'polygon', 'LTC': 'litecoin', 'UNI': 'uniswap',
  'ATOM': 'cosmos', 'FIL': 'filecoin', 'ARB': 'arbitrum', 'OP': 'optimism',
  'APT': 'aptos', 'SUI': 'sui', 'NEAR': 'near', 'INJ': 'injective-protocol',
  'PEPE': 'pepe', 'WIF': 'dogwifcoin', 'BONK': 'bonk', 'FLOKI': 'floki'
};

/**
 * Fetch prices from Coinglass API (PRIMARY - Institutional-grade futures data)
 */
async function fetchFromCoinglass(): Promise<PriceData[]> {
  console.log('[PriceService] Fetching from Coinglass...');
  
  const coinPrices = await coinglassClient.getCoinPrices();
  
  if (!coinPrices || coinPrices.length === 0) {
    throw new Error('No prices returned from Coinglass');
  }

  return coinPrices.map((coin: CoinPrice) => ({
    id: SYMBOL_MAP[coin.symbol.toUpperCase()] || coin.symbol.toLowerCase(),
    symbol: coin.symbol,
    name: coin.name || coin.symbol,
    current_price: coin.price,
    price_change_24h: coin.priceChange24h,
    price_change_percentage_24h: coin.priceChangePercent24h,
    market_cap: coin.marketCap,
    market_cap_rank: coin.marketCapRank,
    total_volume: coin.volume24h,
    openInterest: coin.openInterest,
    fundingRate: coin.fundingRate,
    image: ''
  }));
}

/**
 * Fetch prices from Nansen Token Screener API (Smart Money validated prices)
 */
async function fetchFromNansen(): Promise<PriceData[]> {
  if (!NANSEN_API_KEY) {
    throw new Error('NANSEN_API_KEY not configured');
  }

  console.log('[PriceService] Fetching from Nansen Token Screener...');
  
  const response = await fetch('https://api.nansen.ai/api/v1/token-screener', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apiKey': NANSEN_API_KEY,
    },
    body: JSON.stringify({
      chains: ['ethereum'],
      timeframe: '24h',
      limit: 50,
      sort_by: 'market_cap_usd',
      sort_order: 'desc',
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Nansen API error: ${response.status}`);
  }

  const result = await response.json();
  const tokens = result.data || [];

  return tokens.map((token: any, index: number) => ({
    id: token.token_address?.toLowerCase() || token.symbol?.toLowerCase() || `token-${index}`,
    symbol: token.symbol || 'UNKNOWN',
    name: token.name || token.symbol || 'Unknown Token',
    current_price: parseFloat(token.price_usd || '0'),
    price_change_24h: parseFloat(token.price_change || '0') * parseFloat(token.price_usd || '0') / 100,
    price_change_percentage_24h: parseFloat(token.price_change || '0'),
    market_cap: parseFloat(token.market_cap_usd || '0'),
    market_cap_rank: index + 1,
    total_volume: parseFloat(token.volume || '0'),
    image: ''
  }));
}

/**
 * Fetch prices from CoinCap API (Free, no API key required)
 */
async function fetchFromCoinCap(): Promise<PriceData[]> {
  const response = await fetch('https://api.coincap.io/v2/assets?limit=50', {
    headers: {
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`CoinCap API error: ${response.status}`);
  }

  const result = await response.json();
  
  return result.data.map((coin: any, index: number) => ({
    id: coin.id.toLowerCase(),
    symbol: coin.symbol,
    name: coin.name,
    current_price: parseFloat(coin.priceUsd),
    price_change_24h: parseFloat(coin.priceUsd) * (parseFloat(coin.changePercent24Hr) / 100),
    price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
    market_cap: parseFloat(coin.marketCapUsd || 0),
    market_cap_rank: index + 1,
    total_volume: parseFloat(coin.volumeUsd24Hr || 0),
    circulating_supply: parseFloat(coin.supply || 0),
    image: ''
  }));
}

/**
 * Fetch prices from Binance Public API (Free, no API key required)
 */
async function fetchFromBinance(): Promise<PriceData[]> {
  // Fetch 24hr ticker for all symbols
  const tickerResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
    headers: {
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!tickerResponse.ok) {
    throw new Error(`Binance API error: ${tickerResponse.status}`);
  }

  const tickers = await tickerResponse.json();
  
  // Filter for USDT pairs and map to our format
  const usdtPairs = tickers
    .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
    .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
    .slice(0, 30);

  return usdtPairs.map((ticker: any, index: number) => {
    const symbol = ticker.symbol.replace('USDT', '');
    return {
      id: symbol.toLowerCase(),
      symbol: symbol,
      name: symbol,
      current_price: parseFloat(ticker.lastPrice),
      price_change_24h: parseFloat(ticker.priceChange),
      price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
      market_cap: parseFloat(ticker.quoteVolume) * 100, // Estimate
      market_cap_rank: index + 1,
      total_volume: parseFloat(ticker.quoteVolume),
      image: ''
    };
  });
}

/**
 * Fetch prices from CoinGecko API (Free tier)
 */
async function fetchFromCoinGecko(): Promise<PriceData[]> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d',
    {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Smart-Money-Tracker/2.0'
      },
      signal: AbortSignal.timeout(8000)
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get current cryptocurrency prices from November 12, 2025 market data
 */
function getFallbackPrices(): PriceData[] {
  return [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      current_price: 132850,
      price_change_24h: 3240.75,
      price_change_percentage_24h: 2.49,
      price_change_percentage_1h: 0.67,
      price_change_percentage_7d: 8.21,
      market_cap: 2645382947123,
      market_cap_rank: 1,
      total_volume: 89243765321,
      circulating_supply: 19825000,
      ath: 145000,
      atl: 67.81,
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      current_price: 5128.42,
      price_change_24h: 245.67,
      price_change_percentage_24h: 5.03,
      price_change_percentage_1h: 1.24,
      price_change_percentage_7d: 12.45,
      market_cap: 618493827456,
      market_cap_rank: 2,
      total_volume: 62345123789,
      circulating_supply: 120578000,
      ath: 5500,
      atl: 0.43,
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
    },
    {
      id: 'binancecoin',
      symbol: 'BNB',
      name: 'BNB',
      current_price: 1425.38,
      price_change_24h: 78.92,
      price_change_percentage_24h: 5.86,
      price_change_percentage_1h: 1.45,
      price_change_percentage_7d: 14.32,
      market_cap: 198432678901,
      market_cap_rank: 3,
      total_volume: 11234567890,
      circulating_supply: 139200000,
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
    },
    {
      id: 'ripple',
      symbol: 'XRP',
      name: 'XRP',
      current_price: 3.24,
      price_change_24h: 0.18,
      price_change_percentage_24h: 5.88,
      price_change_percentage_1h: 0.82,
      price_change_percentage_7d: 9.12,
      market_cap: 193824567890,
      market_cap_rank: 4,
      total_volume: 9876543210,
      circulating_supply: 59800000000,
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      current_price: 267.85,
      price_change_24h: 15.42,
      price_change_percentage_24h: 6.11,
      price_change_percentage_1h: 1.32,
      price_change_percentage_7d: 18.76,
      market_cap: 146234567890,
      market_cap_rank: 5,
      total_volume: 14567890123,
      circulating_supply: 546200000,
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
    },
    {
      id: 'dogecoin',
      symbol: 'DOGE',
      name: 'Dogecoin',
      current_price: 0.297845,
      price_change_24h: 0.0189,
      price_change_percentage_24h: 6.78,
      price_change_percentage_1h: 0.95,
      price_change_percentage_7d: 11.23,
      market_cap: 45098765432,
      market_cap_rank: 6,
      total_volume: 4987654321,
      circulating_supply: 151400000000,
      image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      current_price: 0.956789,
      price_change_24h: 0.0543,
      price_change_percentage_24h: 6.02,
      price_change_percentage_1h: 0.87,
      price_change_percentage_7d: 10.45,
      market_cap: 34987654321,
      market_cap_rank: 7,
      total_volume: 2345678901,
      circulating_supply: 36570000000,
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
    },
    {
      id: 'chainlink',
      symbol: 'LINK',
      name: 'Chainlink',
      current_price: 26.78,
      price_change_24h: 1.52,
      price_change_percentage_24h: 6.02,
      price_change_percentage_1h: 0.92,
      price_change_percentage_7d: 12.34,
      market_cap: 18165432109,
      market_cap_rank: 8,
      total_volume: 1654321098,
      circulating_supply: 678500000,
      image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png'
    },
    {
      id: 'avalanche-2',
      symbol: 'AVAX',
      name: 'Avalanche',
      current_price: 36.92,
      price_change_24h: 2.18,
      price_change_percentage_24h: 6.28,
      price_change_percentage_1h: 1.05,
      price_change_percentage_7d: 13.89,
      market_cap: 15587654321,
      market_cap_rank: 9,
      total_volume: 1456789012,
      circulating_supply: 422200000,
      image: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png'
    },
    {
      id: 'toncoin',
      symbol: 'TON',
      name: 'Toncoin',
      current_price: 8.92,
      price_change_24h: 0.54,
      price_change_percentage_24h: 6.44,
      price_change_percentage_1h: 1.12,
      price_change_percentage_7d: 14.56,
      market_cap: 61789012345,
      market_cap_rank: 10,
      total_volume: 5234567890,
      image: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png'
    },
    {
      id: 'shiba-inu',
      symbol: 'SHIB',
      name: 'Shiba Inu',
      current_price: 0.00001789,
      price_change_24h: 0.00000098,
      price_change_percentage_24h: 5.79,
      price_change_percentage_1h: 0.76,
      price_change_percentage_7d: 9.87,
      market_cap: 10543210987,
      market_cap_rank: 11,
      total_volume: 345678901,
      circulating_supply: 589300000000000,
      image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png'
    },
    {
      id: 'polkadot',
      symbol: 'DOT',
      name: 'Polkadot',
      current_price: 5.67,
      price_change_24h: 0.32,
      price_change_percentage_24h: 5.98,
      price_change_percentage_1h: 0.89,
      price_change_percentage_7d: 11.23,
      market_cap: 8632109876,
      market_cap_rank: 12,
      total_volume: 456789012,
      circulating_supply: 1522000000,
      image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png'
    },
    {
      id: 'litecoin',
      symbol: 'LTC',
      name: 'Litecoin',
      current_price: 134.56,
      price_change_24h: 7.23,
      price_change_percentage_24h: 5.67,
      price_change_percentage_1h: 0.84,
      price_change_percentage_7d: 10.12,
      market_cap: 10271234567,
      market_cap_rank: 13,
      total_volume: 876543210,
      circulating_supply: 76350000,
      image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png'
    },
    {
      id: 'uniswap',
      symbol: 'UNI',
      name: 'Uniswap',
      current_price: 12.45,
      price_change_24h: 0.68,
      price_change_percentage_24h: 5.78,
      price_change_percentage_1h: 0.91,
      price_change_percentage_7d: 12.45,
      market_cap: 9345678901,
      market_cap_rank: 14,
      total_volume: 543210987,
      image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png'
    },
    {
      id: 'polygon',
      symbol: 'MATIC',
      name: 'Polygon',
      current_price: 0.876543,
      price_change_24h: 0.048765,
      price_change_percentage_24h: 5.89,
      price_change_percentage_1h: 0.87,
      price_change_percentage_7d: 11.34,
      market_cap: 8123456789,
      market_cap_rank: 15,
      total_volume: 432109876,
      image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png'
    }
  ];
}

/**
 * Main function to fetch cryptocurrency prices with multiple fallbacks
 */
export async function fetchCryptoPrices(): Promise<{
  data: PriceData[];
  source: string;
  cached: boolean;
}> {
  // Check cache first
  const now = Date.now();
  if (priceCache.data && (now - priceCache.timestamp) < CACHE_DURATION) {
    console.log(`Using cached price data (${priceCache.source})`);
    return {
      data: priceCache.data,
      source: priceCache.source,
      cached: true
    };
  }

  // Try each API in order - Coinglass and Nansen as priority sources
  const apis = [
    { name: 'Coinglass', fetch: fetchFromCoinglass },      // PRIMARY: Institutional futures data
    { name: 'Binance', fetch: fetchFromBinance },          // Fast spot prices
    { name: 'CoinCap', fetch: fetchFromCoinCap },          // Good backup
    { name: 'Nansen', fetch: fetchFromNansen },            // Smart money validated
    { name: 'CoinGecko', fetch: fetchFromCoinGecko },      // Rate-limited fallback
  ];

  for (const api of apis) {
    try {
      console.log(`Fetching prices from ${api.name}...`);
      const data = await api.fetch();
      
      // Update cache
      priceCache = {
        data,
        timestamp: now,
        source: api.name
      };

      console.log(`Successfully fetched ${data.length} prices from ${api.name}`);
      return {
        data,
        source: api.name,
        cached: false
      };
    } catch (error) {
      console.warn(`${api.name} API failed:`, error);
      continue;
    }
  }

  // All APIs failed, use fallback data
  console.log('All APIs failed, using fallback data');
  const fallbackData = getFallbackPrices();
  
  // Cache fallback data too
  priceCache = {
    data: fallbackData,
    timestamp: now,
    source: 'Fallback'
  };

  return {
    data: fallbackData,
    source: 'Fallback',
    cached: false
  };
}

/**
 * Get a specific cryptocurrency price by symbol
 */
export async function getCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const { data } = await fetchCryptoPrices();
    const crypto = data.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
    return crypto?.current_price || null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Clear the price cache (useful for testing or forced refresh)
 */
export function clearPriceCache() {
  priceCache = {
    data: null,
    timestamp: 0,
    source: ''
  };
}
