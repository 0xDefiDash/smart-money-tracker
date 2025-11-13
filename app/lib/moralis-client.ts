

import Moralis from 'moralis'

export class MoralisClient {
  private static instance: MoralisClient
  private isInitialized = false

  private constructor() {}

  public static getInstance(): MoralisClient {
    if (!MoralisClient.instance) {
      MoralisClient.instance = new MoralisClient()
    }
    return MoralisClient.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY || "F817rvYr65CreUWHQzIcjcE6fDbmZxnEjYENXmhxLjmLVq1y5wrTdTe7xtmRIl9M"
      })
      this.isInitialized = true
      console.log('Moralis initialized successfully')
    } catch (error) {
      // If already initialized, ignore the error
      if ((error as any)?.message?.includes('already started') || (error as any)?.message?.includes('already been started')) {
        this.isInitialized = true
        console.log('Moralis was already initialized')
        return
      }
      console.error('Error initializing Moralis:', error)
      throw error
    }
  }

  public async getWalletTokenBalances(address: string, chain: string = '0x1') {
    await this.initialize()
    
    return await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: chain,
      address: address
    })
  }

  public async getWalletTransactions(address: string, chain: string = '0x1', limit: number = 20) {
    await this.initialize()
    
    return await Moralis.EvmApi.transaction.getWalletTransactions({
      chain: chain,
      address: address,
      limit: limit
    })
  }

  public async getNativeBalance(address: string, chain: string = '0x1') {
    await this.initialize()
    
    return await Moralis.EvmApi.balance.getNativeBalance({
      chain: chain,
      address: address
    })
  }

  public async getWalletNFTs(address: string, chain: string = '0x1', limit: number = 20) {
    await this.initialize()
    
    return await Moralis.EvmApi.nft.getWalletNFTs({
      chain: chain,
      address: address,
      limit: limit
    })
  }

  public async getTokenPrice(address: string, chain: string = '0x1') {
    await this.initialize()
    
    return await Moralis.EvmApi.token.getTokenPrice({
      chain: chain,
      address: address
    })
  }

  public formatWei(value: string, decimals: number = 18): string {
    try {
      // Manual calculation for Wei conversion
      const num = parseFloat(value) / Math.pow(10, decimals)
      return num.toFixed(6) // Return with 6 decimal places
    } catch (error) {
      console.error('Error formatting Wei:', error)
      return '0'
    }
  }

  public getChainInfo(chainId: string) {
    const chains: { [key: string]: { name: string; symbol: string; explorer: string } } = {
      '0x1': { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
      '0x38': { name: 'BSC', symbol: 'BNB', explorer: 'https://bscscan.com' },
      '0x89': { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
      '0xa86a': { name: 'Avalanche', symbol: 'AVAX', explorer: 'https://snowtrace.io' },
      '0xfa': { name: 'Fantom', symbol: 'FTM', explorer: 'https://ftmscan.com' },
      '0x2105': { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' }
    }
    return chains[chainId] || { name: 'Unknown', symbol: 'ETH', explorer: 'https://etherscan.io' }
  }

  // Helper to convert common chain names to chain IDs
  public getChainId(chainName: string): string {
    const chainMap: { [key: string]: string } = {
      'ethereum': '0x1',
      'eth': '0x1',
      'bsc': '0x38',
      'bnb': '0x38',
      'binance': '0x38',
      'polygon': '0x89',
      'matic': '0x89',
      'avalanche': '0xa86a',
      'avax': '0xa86a',
      'fantom': '0xfa',
      'ftm': '0xfa',
      'base': '0x2105',
      'basechain': '0x2105'
    }
    return chainMap[chainName.toLowerCase()] || '0x1'
  }
}

// Export singleton instance
export const moralisClient = MoralisClient.getInstance()
