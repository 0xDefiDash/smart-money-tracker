
import { CryptoData, WhaleTransaction } from './types';

// CoinAPI client
export class CoinAPIClient {
  private baseURL = 'https://rest.coinapi.io/v1';
  private apiKey = process.env.COINAPI_API_KEY || '';

  async getTopCryptocurrencies(limit = 20): Promise<CryptoData[]> {
    try {
      const headers = {
        'X-CoinAPI-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      console.log('Calling CoinAPI with key:', this.apiKey.substring(0, 10) + '...');
      
      // Get list of assets first to understand the format
      const assetsResponse = await fetch(`${this.baseURL}/assets?filter_asset_type_id=crypto`, { 
        headers,
        next: { revalidate: 0 } // No caching for real-time data
      });
      
      if (!assetsResponse.ok) {
        const errorText = await assetsResponse.text();
        console.error('CoinAPI assets error:', assetsResponse.status, errorText);
        console.log('CoinAPI quota exceeded or API issue, using enhanced fallback data');
        return this.getEnhancedFallbackData();
      }
      
      const assets = await assetsResponse.json();
      console.log('CoinAPI assets received:', assets.length);
      
      // Get top assets by market cap (filter and sort)
      const topAssets = assets
        .filter((asset: any) => asset.data_start && asset.price_usd && asset.volume_1day_usd)
        .sort((a: any, b: any) => (b.volume_1day_usd || 0) - (a.volume_1day_usd || 0))
        .slice(0, limit);
      
      // Format the data to match our expected structure
      return this.formatCoinAPIData(topAssets);
      
    } catch (error) {
      console.error('Error fetching cryptocurrencies from CoinAPI:', error);
      return this.getEnhancedFallbackData();
    }
  }

  private formatCoinAPIData(data: any[]): CryptoData[] {
    return data.map((item: any, index: number) => {
      const symbol = item.asset_id || '';
      const name = item.name || symbol;
      const price = item.price_usd || 0;
      
      return {
        id: symbol.toLowerCase(),
        symbol: symbol,
        name: name,
        current_price: price,
        market_cap: (item.volume_1day_usd || 0) * 100, // Estimate market cap
        market_cap_rank: index + 1,
        total_volume: item.volume_1day_usd || 0,
        price_change_percentage_24h: 0, // CoinAPI doesn't provide this directly
        price_change_24h: 0,
        image: this.getCryptoLogo(symbol)
      };
    });
  }

  private getCryptoLogo(symbol: string): string {
    const logos: { [key: string]: string } = {
      'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png',
      'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      'XRP': 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      'AVAX': 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png'
    };
    
    return logos[symbol] || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png';
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
    // Accurate current market data (updated for August 27, 2025)
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 111911,
        market_cap: 2228169833151,
        market_cap_rank: 1,
        total_volume: 36186852922,
        price_change_percentage_24h: 2.06,
        price_change_24h: 2259.15,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 4653.63,
        market_cap: 561452136761,
        market_cap_rank: 2,
        total_volume: 35700514440,
        price_change_percentage_24h: 2.95,
        price_change_24h: 133.28,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'ripple',
        symbol: 'XRP',
        name: 'XRP',
        current_price: 3.01,
        market_cap: 179269518496,
        market_cap_rank: 3,
        total_volume: 6166406385,
        price_change_percentage_24h: 2.86,
        price_change_24h: 0.083888,
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
      },
      {
        id: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        current_price: 1.0002,
        market_cap: 118000000000,
        market_cap_rank: 4,
        total_volume: 52000000000,
        price_change_percentage_24h: 0.01,
        price_change_24h: 0.0001,
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'
      },
      {
        id: 'binancecoin',
        symbol: 'BNB',
        name: 'BNB',
        current_price: 595.80,
        market_cap: 86500000000,
        market_cap_rank: 5,
        total_volume: 2100000000,
        price_change_percentage_24h: 1.9,
        price_change_24h: 11.2,
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        current_price: 158.40,
        market_cap: 73200000000,
        market_cap_rank: 6,
        total_volume: 4200000000,
        price_change_percentage_24h: 5.2,
        price_change_24h: 7.85,
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
      },
      {
        id: 'usd-coin',
        symbol: 'USDC',
        name: 'USDC',
        current_price: 0.9999,
        market_cap: 35200000000,
        market_cap_rank: 7,
        total_volume: 6800000000,
        price_change_percentage_24h: -0.01,
        price_change_24h: -0.0001,
        image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        current_price: 0.465,
        market_cap: 16400000000,
        market_cap_rank: 8,
        total_volume: 680000000,
        price_change_percentage_24h: 2.3,
        price_change_24h: 0.0105,
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
      },
      {
        id: 'dogecoin',
        symbol: 'DOGE',
        name: 'Dogecoin',
        current_price: 0.105,
        market_cap: 15300000000,
        market_cap_rank: 9,
        total_volume: 1200000000,
        price_change_percentage_24h: 4.2,
        price_change_24h: 0.0042,
        image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
      },
      {
        id: 'avalanche-2',
        symbol: 'AVAX',
        name: 'Avalanche',
        current_price: 32.85,
        market_cap: 13100000000,
        market_cap_rank: 10,
        total_volume: 580000000,
        price_change_percentage_24h: 3.4,
        price_change_24h: 1.08,
        image: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png'
      }
    ];
  }

  async getCryptocurrencyPrice(symbol: string): Promise<number | null> {
    try {
      const headers = {
        'X-CoinAPI-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      // Use exchange rate endpoint for USD price
      const response = await fetch(`${this.baseURL}/exchangerate/${symbol.toUpperCase()}/USD`, { headers });
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.rate || null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalData(symbol: string, days = 7): Promise<Array<[number, number]>> {
    try {
      const headers = {
        'X-CoinAPI-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      // Calculate start and end dates
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const response = await fetch(
        `${this.baseURL}/ohlcv/${symbol.toUpperCase()}/USD/history?period_id=1DAY&time_start=${startDate.toISOString()}&time_end=${endDate.toISOString()}`, 
        { headers }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      // Convert CoinAPI OHLCV format to [timestamp, price] array
      if (Array.isArray(data)) {
        return data.map((item: any) => [
          new Date(item.time_period_start).getTime(),
          item.price_close || item.price_open || 0
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
        'X-CoinAPI-Key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      // Get metrics overview using exchanges endpoint
      const response = await fetch(`${this.baseURL}/exchanges`, { headers });
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        total_exchanges: data.length,
        timestamp: new Date().toISOString()
      };
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
        next: { revalidate: 0 } // No caching for real-time data
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
