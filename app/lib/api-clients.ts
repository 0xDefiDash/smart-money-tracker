
import { CryptoData, WhaleTransaction } from './types';

// CoinGecko API client
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
