
/**
 * BSC Network RPC Client using Ankr
 * Handles on-chain data fetching from Binance Smart Chain
 */

interface RPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface RPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

class BSCRPCClient {
  private rpcUrl: string;
  private requestId: number = 1;

  constructor() {
    this.rpcUrl = process.env.BSC_RPC_URL || '';
    if (!this.rpcUrl) {
      console.warn('BSC_RPC_URL not configured');
    }
  }

  private async makeRequest(method: string, params: any[] = []): Promise<any> {
    if (!this.rpcUrl) {
      throw new Error('BSC_RPC_URL not configured');
    }

    const request: RPCRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++,
    };

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
      }

      const data: RPCResponse = await response.json();

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('BSC RPC request failed:', error);
      throw error;
    }
  }

  /**
   * Get the current block number
   */
  async getBlockNumber(): Promise<number> {
    const result = await this.makeRequest('eth_blockNumber');
    return parseInt(result, 16);
  }

  /**
   * Get balance of an address in wei
   */
  async getBalance(address: string): Promise<string> {
    const result = await this.makeRequest('eth_getBalance', [address, 'latest']);
    return result;
  }

  /**
   * Get balance in BNB (converted from wei)
   */
  async getBalanceInBNB(address: string): Promise<number> {
    const weiBalance = await this.getBalance(address);
    const wei = BigInt(weiBalance);
    return Number(wei) / 1e18;
  }

  /**
   * Get transaction count (nonce) for an address
   */
  async getTransactionCount(address: string): Promise<number> {
    const result = await this.makeRequest('eth_getTransactionCount', [
      address,
      'latest',
    ]);
    return parseInt(result, 16);
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<any> {
    return await this.makeRequest('eth_getTransactionByHash', [hash]);
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: string): Promise<any> {
    return await this.makeRequest('eth_getTransactionReceipt', [hash]);
  }

  /**
   * Get block by number
   */
  async getBlockByNumber(
    blockNumber: number,
    includeTransactions: boolean = false
  ): Promise<any> {
    const blockHex = '0x' + blockNumber.toString(16);
    return await this.makeRequest('eth_getBlockByNumber', [
      blockHex,
      includeTransactions,
    ]);
  }

  /**
   * Get logs (events) filtered by parameters
   */
  async getLogs(params: {
    fromBlock?: string | number;
    toBlock?: string | number;
    address?: string | string[];
    topics?: (string | string[] | null)[];
  }): Promise<any[]> {
    const formattedParams = {
      ...params,
      fromBlock:
        typeof params.fromBlock === 'number'
          ? '0x' + params.fromBlock.toString(16)
          : params.fromBlock || 'latest',
      toBlock:
        typeof params.toBlock === 'number'
          ? '0x' + params.toBlock.toString(16)
          : params.toBlock || 'latest',
    };

    return await this.makeRequest('eth_getLogs', [formattedParams]);
  }

  /**
   * Call a contract method (read-only)
   */
  async call(transaction: {
    to: string;
    data: string;
    from?: string;
  }): Promise<string> {
    return await this.makeRequest('eth_call', [transaction, 'latest']);
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    return await this.makeRequest('eth_gasPrice');
  }

  /**
   * Get BEP20 token balance
   */
  async getBEP20Balance(tokenAddress: string, walletAddress: string): Promise<string> {
    // BEP20 balanceOf function signature (same as ERC20)
    const data =
      '0x70a08231' +
      walletAddress.slice(2).padStart(64, '0');

    try {
      const result = await this.call({
        to: tokenAddress,
        data,
      });
      return result;
    } catch (error) {
      console.error('Failed to get BEP20 balance:', error);
      return '0x0';
    }
  }

  /**
   * Get multiple wallet balances in parallel
   */
  async getMultipleBalances(addresses: string[]): Promise<
    Array<{
      address: string;
      balance: number;
      transactions: number;
    }>
  > {
    const promises = addresses.map(async (address) => {
      try {
        const [balance, txCount] = await Promise.all([
          this.getBalanceInBNB(address),
          this.getTransactionCount(address),
        ]);

        return {
          address,
          balance,
          transactions: txCount,
        };
      } catch (error) {
        console.error(`Failed to get data for ${address}:`, error);
        return {
          address,
          balance: 0,
          transactions: 0,
        };
      }
    });

    return await Promise.all(promises);
  }

  /**
   * Monitor large transactions (whale activity)
   */
  async getRecentLargeTransactions(
    minValueInBNB: number = 100,
    blockCount: number = 10
  ): Promise<any[]> {
    try {
      const currentBlock = await this.getBlockNumber();
      const largeTransactions: any[] = [];

      for (let i = 0; i < blockCount; i++) {
        const blockNumber = currentBlock - i;
        const block = await this.getBlockByNumber(blockNumber, true);

        if (block?.transactions) {
          for (const tx of block.transactions) {
            if (tx.value) {
              const valueInBNB = Number(BigInt(tx.value)) / 1e18;
              if (valueInBNB >= minValueInBNB) {
                largeTransactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: valueInBNB,
                  blockNumber,
                  timestamp: parseInt(block.timestamp, 16),
                });
              }
            }
          }
        }
      }

      return largeTransactions;
    } catch (error) {
      console.error('Failed to get recent large transactions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const bscRPCClient = new BSCRPCClient();

// Export types
export interface WalletData {
  address: string;
  balance: number;
  transactions: number;
  lastActivity?: number;
}

export interface LargeTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  blockNumber: number;
  timestamp: number;
}
