
import { CryptoData, WhaleTransaction } from './types';

// TokenMetrics API client
export class TokenMetricsAPI {
  private baseURL = 'https://api.tokenmetrics.com/v1';
  private apiKey = process.env.TOKENMETRICS_API_KEY || '';

  async getTopCryptocurrencies(limit = 20): Promise<CryptoData[]> {
    try {
      const headers = {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      console.log('Calling TokenMetrics API with key:', this.apiKey.substring(0, 10) + '...');
      
      // Try various TokenMetrics endpoints
      let response;
      let data;
      
      // First try market-data endpoint
      try {
        response = await fetch(`${this.baseURL}/market-data?limit=${limit}&sort=market_cap_desc`, { 
          headers,
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        
        if (response.ok) {
          data = await response.json();
          if (data.success !== false) {
            return this.formatTokenMetricsData(data.data || data.results || data);
          }
        } else {
          const errorData = await response.json();
          console.log('TokenMetrics market-data error:', errorData.message);
        }
      } catch (err) {
        console.log('TokenMetrics market-data endpoint failed:', err);
      }
      
      // Try alternative endpoints
      const endpoints = [
        'coins',
        'prices',
        'tokens',
        'crypto/prices',
        'market/coins'
      ];
      
      for (const endpoint of endpoints) {
        try {
          response = await fetch(`${this.baseURL}/${endpoint}?limit=${limit}`, { 
            headers,
            next: { revalidate: 300 }
          });
          
          if (response.ok) {
            data = await response.json();
            if (data.success !== false && (data.data || data.results || Array.isArray(data))) {
              console.log(`TokenMetrics ${endpoint} endpoint worked!`);
              return this.formatTokenMetricsData(data.data || data.results || data);
            }
          }
        } catch (err) {
          // Continue to next endpoint
        }
      }
      
      console.log('All TokenMetrics endpoints failed, using enhanced fallback data');
      return this.getEnhancedFallbackData();
      
    } catch (error) {
      console.error('Error fetching top cryptocurrencies from TokenMetrics:', error);
      return this.getEnhancedFallbackData();
    }
  }

  private formatTokenMetricsData(data: any[]): CryptoData[] {
    return data.map((item: any, index: number) => ({
      id: item.symbol?.toLowerCase() || item.name?.toLowerCase().replace(/ /g, '-') || `crypto-${index}`,
      symbol: item.symbol || item.ticker || '',
      name: item.name || item.symbol || '',
      current_price: item.price || item.current_price || item.last_price || 0,
      market_cap: item.market_cap || item.marketCap || item.market_cap_usd || 0,
      market_cap_rank: item.rank || item.market_cap_rank || index + 1,
      total_volume: item.volume_24h || item.volume || item.volume_usd || 0,
      price_change_percentage_24h: item.change_24h || item.price_change_24h || item.percent_change_24h || 0,
      price_change_24h: item.price_change_24h || 0,
      image: item.logo || item.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    }));
  }

  private getFallbackCryptoData(): CryptoData[] {
    // Fallback data for major cryptocurrencies when API fails
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 43000,
        market_cap: 843000000000,
        market_cap_rank: 1,
        total_volume: 20000000000,
        price_change_percentage_24h: 2.5,
        price_change_24h: 1075,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 2600,
        market_cap: 312000000000,
        market_cap_rank: 2,
        total_volume: 15000000000,
        price_change_percentage_24h: 1.8,
        price_change_24h: 47,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
    ];
  }

  private getEnhancedFallbackData(): CryptoData[] {
    // More comprehensive fallback data with deterministic market values (no random to avoid hydration issues)
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 43750, 
        market_cap: 850000000000,
        market_cap_rank: 1,
        total_volume: 25000000000,
        price_change_percentage_24h: 3.2,
        price_change_24h: 1350,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 2685,
        market_cap: 318000000000,
        market_cap_rank: 2,
        total_volume: 12000000000,
        price_change_percentage_24h: 2.8,
        price_change_24h: 75,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        current_price: 1.00,
        market_cap: 95000000000,
        market_cap_rank: 3,
        total_volume: 45000000000,
        price_change_percentage_24h: 0.05,
        price_change_24h: 0.0005,
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'
      },
      {
        id: 'binancecoin',
        symbol: 'BNB',
        name: 'BNB',
        current_price: 315.50,
        market_cap: 46000000000,
        market_cap_rank: 4,
        total_volume: 1200000000,
        price_change_percentage_24h: 1.8,
        price_change_24h: 5.6,
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        current_price: 98.75,
        market_cap: 42000000000,
        market_cap_rank: 5,
        total_volume: 2800000000,
        price_change_percentage_24h: 4.5,
        price_change_24h: 4.25,
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
      },
      {
        id: 'usd-coin',
        symbol: 'USDC',
        name: 'USDC',
        current_price: 1.00,
        market_cap: 33000000000,
        market_cap_rank: 6,
        total_volume: 5200000000,
        price_change_percentage_24h: 0.02,
        price_change_24h: 0.0002,
        image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
      },
      {
        id: 'xrp',
        symbol: 'XRP',
        name: 'XRP',
        current_price: 0.585,
        market_cap: 31000000000,
        market_cap_rank: 7,
        total_volume: 1800000000,
        price_change_percentage_24h: 2.1,
        price_change_24h: 0.012,
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        current_price: 0.425,
        market_cap: 14800000000,
        market_cap_rank: 8,
        total_volume: 520000000,
        price_change_percentage_24h: 1.7,
        price_change_24h: 0.007,
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
      },
      {
        id: 'dogecoin',
        symbol: 'DOGE',
        name: 'Dogecoin',
        current_price: 0.087,
        market_cap: 12200000000,
        market_cap_rank: 9,
        total_volume: 890000000,
        price_change_percentage_24h: 3.8,
        price_change_24h: 0.0032,
        image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
      },
      {
        id: 'avalanche-2',
        symbol: 'AVAX',
        name: 'Avalanche',
        current_price: 29.50,
        market_cap: 11000000000,
        market_cap_rank: 10,
        total_volume: 420000000,
        price_change_percentage_24h: 2.5,
        price_change_24h: 0.72,
        image: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png'
      }
    ];
  }

  async getCryptocurrencyPrice(symbol: string): Promise<number | null> {
    try {
      const headers = {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${this.baseURL}/price?symbol=${symbol.toUpperCase()}`, { headers });
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.price || data.data?.price || null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalData(symbol: string, days = 7): Promise<Array<[number, number]>> {
    try {
      const headers = {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${this.baseURL}/historical-data?symbol=${symbol.toUpperCase()}&days=${days}`, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      
      // Convert TokenMetrics historical format to [timestamp, price] array
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((item: any) => [
          new Date(item.date || item.timestamp).getTime(),
          item.price || item.close || 0
        ]);
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async getMarketOverview(): Promise<any> {
    try {
      const headers = {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${this.baseURL}/market-overview`, { headers });
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return null;
    }
  }
}

// Legacy CoinGecko API client (kept as fallback)
export class CoinGeckoAPI {
  private baseURL = 'https://api.coingecko.com/api/v3';
  private apiKey = process.env.COINGECKO_API_KEY || '';

  async getTopCryptocurrencies(limit = 20): Promise<CryptoData[]> {
    try {
      const url = `${this.baseURL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x_cg_demo_api_key'] = this.apiKey;
      }
      
      const response = await fetch(url, { 
        headers,
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching top cryptocurrencies:', error);
      return [];
    }
  }

  async getCryptocurrencyPrice(id: string): Promise<number | null> {
    try {
      const url = `${this.baseURL}/simple/price?ids=${id}&vs_currencies=usd`;
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x_cg_demo_api_key'] = this.apiKey;
      }
      
      const response = await fetch(url, { headers });
      if (!response.ok) return null;
      
      const data = await response.json();
      return data[id]?.usd || null;
    } catch (error) {
      console.error(`Error fetching price for ${id}:`, error);
      return null;
    }
  }

  async getHistoricalData(id: string, days = 7): Promise<Array<[number, number]>> {
    try {
      const url = `${this.baseURL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x_cg_demo_api_key'] = this.apiKey;
      }
      
      const response = await fetch(url, { headers });
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${id}:`, error);
      return [];
    }
  }
}

// Blockchain.com API client for Bitcoin data
export class BlockchainAPI {
  private baseURL = 'https://blockchain.info';

  async getRecentTransactions(limit = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/unconfirmed-transactions?format=json&limit=${limit}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.txs || [];
    } catch (error) {
      console.error('Error fetching Bitcoin transactions:', error);
      return [];
    }
  }

  async getLargeTransactions(minValue = 100): Promise<any[]> {
    try {
      const transactions = await this.getRecentTransactions();
      return transactions.filter((tx: any) => {
        const outputValue = tx.out?.reduce((sum: number, output: any) => sum + (output.value || 0), 0) || 0;
        return (outputValue / 100000000) >= minValue; // Convert satoshis to BTC
      });
    } catch (error) {
      console.error('Error filtering large Bitcoin transactions:', error);
      return [];
    }
  }
}

// Etherscan API client for Ethereum data
export class EtherscanAPI {
  private baseURL = 'https://api.etherscan.io/api';
  private apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';

  async getRecentBlocks(limit = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseURL}?module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`
      );
      if (!response.ok) return [];
      
      const data = await response.json();
      const latestBlock = parseInt(data.result, 16);
      
      const blocks = [];
      for (let i = 0; i < limit; i++) {
        const blockNumber = latestBlock - i;
        const blockResponse = await fetch(
          `${this.baseURL}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${this.apiKey}`
        );
        if (blockResponse.ok) {
          const blockData = await blockResponse.json();
          blocks.push(blockData.result);
        }
      }
      
      return blocks;
    } catch (error) {
      console.error('Error fetching Ethereum blocks:', error);
      return [];
    }
  }

  async getTransactionsByAddress(address: string, page = 1): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseURL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=10&sort=desc&apikey=${this.apiKey}`
      );
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);
      return [];
    }
  }
}

// Utility functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(2);
};

export const truncateAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
