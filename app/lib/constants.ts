
export const WHALE_THRESHOLDS = {
  BTC: 10, // 10 BTC
  ETH: 100, // 100 ETH
  USD: 1000000, // $1M USD equivalent
};

export const TOP_CRYPTOCURRENCIES = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
];

export const EXCHANGES = [
  'Binance',
  'Coinbase',
  'Kraken',
  'Bitfinex',
  'Huobi',
  'OKX',
  'KuCoin',
  'Gate.io',
  'Gemini',
  'Bitstamp'
];

export const BLOCKCHAIN_NETWORKS = {
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
  BINANCE_SMART_CHAIN: 'bsc',
  POLYGON: 'polygon',
  SOLANA: 'solana',
  AVALANCHE: 'avalanche',
};

export const CHART_COLORS = [
  '#60B5FF', '#FF9149', '#FF9898', '#FF90BB', 
  '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'
];

export const REFRESH_INTERVALS = {
  REAL_TIME: 15000, // 15 seconds
  MARKET_DATA: 300000, // 5 minutes  
  WHALE_TRANSACTIONS: 600000, // 10 minutes
  DAILY_REPORTS: 3600000, // 1 hour
};

export const API_ENDPOINTS = {
  COINGECKO: 'https://api.coingecko.com/api/v3',
  BLOCKCHAIN_INFO: 'https://blockchain.info',
  ETHERSCAN: 'https://api.etherscan.io/api',
};

export const MARKET_SENTIMENT = {
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  NEUTRAL: 'neutral',
} as const;
