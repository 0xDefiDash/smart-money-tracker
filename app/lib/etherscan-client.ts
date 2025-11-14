
/**
 * Etherscan Multi-Chain Client
 * Works across all EVM chains using Etherscan API family
 */

interface EtherscanConfig {
  apiUrl: string;
  name: string;
  nativeCurrency: string;
  explorer: string;
}

export const ETHERSCAN_CONFIGS: Record<string, EtherscanConfig> = {
  ethereum: {
    apiUrl: 'https://api.etherscan.io/api',
    name: 'Ethereum',
    nativeCurrency: 'ETH',
    explorer: 'https://etherscan.io'
  },
  base: {
    apiUrl: 'https://api.basescan.org/api',
    name: 'Base',
    nativeCurrency: 'ETH',
    explorer: 'https://basescan.org'
  },
  bnb: {
    apiUrl: 'https://api.bscscan.com/api',
    name: 'BSC',
    nativeCurrency: 'BNB',
    explorer: 'https://bscscan.com'
  },
  polygon: {
    apiUrl: 'https://api.polygonscan.com/api',
    name: 'Polygon',
    nativeCurrency: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    apiUrl: 'https://api.arbiscan.io/api',
    name: 'Arbitrum',
    nativeCurrency: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  optimism: {
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    name: 'Optimism',
    nativeCurrency: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  }
};

export class EtherscanClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ETHERSCAN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ETHERSCAN_API_KEY not configured');
    }
  }

  private getConfig(chain: string): EtherscanConfig {
    const config = ETHERSCAN_CONFIGS[chain];
    if (!config) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return config;
  }

  private async makeRequest(chain: string, params: Record<string, any>): Promise<any> {
    const config = this.getConfig(chain);
    const url = new URL(config.apiUrl);
    
    // Add API key and params
    url.searchParams.append('apikey', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 10 } // Cache for 10 seconds
      });

      if (!response.ok) {
        throw new Error(`Etherscan API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === '0' && data.message !== 'No transactions found') {
        throw new Error(data.message || 'Etherscan API error');
      }

      return data;
    } catch (error: any) {
      console.error(`Etherscan ${chain} request failed:`, error);
      throw error;
    }
  }

  /**
   * Get native balance (ETH, BNB, etc.)
   */
  async getBalance(address: string, chain: string = 'ethereum'): Promise<{
    balance: string;
    balanceWei: string;
  }> {
    const result = await this.makeRequest(chain, {
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest'
    });

    const balanceWei = result.result || '0';
    const balance = (parseFloat(balanceWei) / 1e18).toFixed(8);

    return {
      balance,
      balanceWei
    };
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(
    address: string,
    contractAddress: string,
    chain: string = 'ethereum'
  ): Promise<string> {
    const result = await this.makeRequest(chain, {
      module: 'account',
      action: 'tokenbalance',
      contractaddress: contractAddress,
      address,
      tag: 'latest'
    });

    return result.result || '0';
  }

  /**
   * Get list of ERC20 token transfers for an address
   */
  async getTokenTransfers(
    address: string,
    chain: string = 'ethereum',
    options: {
      contractAddress?: string;
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const params: Record<string, any> = {
      module: 'account',
      action: 'tokentx',
      address,
      page: options.page || 1,
      offset: options.offset || 100,
      sort: 'desc'
    };

    if (options.contractAddress) {
      params.contractaddress = options.contractAddress;
    }
    if (options.startBlock) {
      params.startblock = options.startBlock;
    }
    if (options.endBlock) {
      params.endblock = options.endBlock;
    }

    const result = await this.makeRequest(chain, params);
    return result.result || [];
  }

  /**
   * Get normal transactions for an address
   */
  async getTransactions(
    address: string,
    chain: string = 'ethereum',
    options: {
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const params: Record<string, any> = {
      module: 'account',
      action: 'txlist',
      address,
      page: options.page || 1,
      offset: options.offset || 100,
      sort: 'desc'
    };

    if (options.startBlock) {
      params.startblock = options.startBlock;
    }
    if (options.endBlock) {
      params.endblock = options.endBlock;
    }

    const result = await this.makeRequest(chain, params);
    return result.result || [];
  }

  /**
   * Get internal transactions for an address
   */
  async getInternalTransactions(
    address: string,
    chain: string = 'ethereum',
    options: {
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const params: Record<string, any> = {
      module: 'account',
      action: 'txlistinternal',
      address,
      page: options.page || 1,
      offset: options.offset || 100,
      sort: 'desc'
    };

    if (options.startBlock) {
      params.startblock = options.startBlock;
    }
    if (options.endBlock) {
      params.endblock = options.endBlock;
    }

    const result = await this.makeRequest(chain, params);
    return result.result || [];
  }

  /**
   * Get all transactions (normal + token transfers + internal) for comprehensive tracking
   */
  async getAllTransactions(
    address: string,
    chain: string = 'ethereum',
    limit: number = 50
  ): Promise<any[]> {
    try {
      const [normalTxs, tokenTxs, internalTxs] = await Promise.all([
        this.getTransactions(address, chain, { offset: limit }),
        this.getTokenTransfers(address, chain, { offset: limit }),
        this.getInternalTransactions(address, chain, { offset: limit })
      ]);

      // Combine and sort by timestamp
      const allTxs = [
        ...normalTxs.map((tx: any) => ({ ...tx, type: 'normal' })),
        ...tokenTxs.map((tx: any) => ({ ...tx, type: 'token' })),
        ...internalTxs.map((tx: any) => ({ ...tx, type: 'internal' }))
      ].sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

      return allTxs.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching all transactions for ${chain}:`, error);
      return [];
    }
  }

  /**
   * Get contract ABI (for advanced interactions)
   */
  async getContractABI(contractAddress: string, chain: string = 'ethereum'): Promise<string> {
    const result = await this.makeRequest(chain, {
      module: 'contract',
      action: 'getabi',
      address: contractAddress
    });

    return result.result || '';
  }

  /**
   * Get transaction receipt status
   */
  async getTransactionStatus(txHash: string, chain: string = 'ethereum'): Promise<{
    isError: string;
    errDescription: string;
  }> {
    const result = await this.makeRequest(chain, {
      module: 'transaction',
      action: 'getstatus',
      txhash: txHash
    });

    return result.result || { isError: '1', errDescription: 'Unknown' };
  }

  /**
   * Get gas oracle (current gas prices)
   */
  async getGasOracle(chain: string = 'ethereum'): Promise<{
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee?: string;
    gasUsedRatio?: string;
  }> {
    const result = await this.makeRequest(chain, {
      module: 'gastracker',
      action: 'gasoracle'
    });

    return result.result || {
      SafeGasPrice: '0',
      ProposeGasPrice: '0',
      FastGasPrice: '0'
    };
  }

  /**
   * Get latest block number
   */
  async getLatestBlock(chain: string = 'ethereum'): Promise<number> {
    const result = await this.makeRequest(chain, {
      module: 'proxy',
      action: 'eth_blockNumber'
    });

    return parseInt(result.result, 16);
  }

  /**
   * Format transaction for display
   */
  formatTransaction(tx: any, chain: string) {
    const config = this.getConfig(chain);
    const value = tx.value ? (parseFloat(tx.value) / 1e18).toFixed(6) : '0';
    const timestamp = new Date(parseInt(tx.timeStamp) * 1000).toISOString();

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || tx.contractAddress,
      value,
      timestamp,
      blockNumber: tx.blockNumber,
      type: tx.type || 'normal',
      isError: tx.isError === '1',
      tokenSymbol: tx.tokenSymbol,
      tokenName: tx.tokenName,
      tokenDecimal: tx.tokenDecimal,
      explorerUrl: `${config.explorer}/tx/${tx.hash}`
    };
  }
}

// Export singleton instance
export const etherscanClient = new EtherscanClient();
