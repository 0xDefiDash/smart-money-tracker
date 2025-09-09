

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ExternalLink, ArrowRightIcon, AlertTriangle, Copy, Eye } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'

// Mock whale transactions data with current timestamps (September 9, 2025)
const baseTimestamp = new Date('2025-09-09T15:45:00Z').getTime();
const mockTransactions = [
  {
    id: '1',
    txHash: '0x6e9a4d2f8c5b1e7a3d6c9e2b5f8a1d4c7e3b9f6a2d5c8e1b4f7a9d3c6e8b5f1a',
    fromAddress: '0x6e9a4d2f8c5b1e7a3d6c9e2b5f8a1d4c',
    toAddress: '0x7e3b9f6a2d5c8e1b4f7a9d3c6e8b5f1a',
    fromLabel: 'BlackRock Digital Assets',
    toLabel: 'Strategic Reserve Vault',
    value: '7,234.89',
    valueUsd: 19456780,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 300000), // 5 minutes ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '2',
    txHash: '0x8f3c6a9d2e5b8f1a4d7c3e9b6f2a5d8c1e4b7f9a3d6c2e5b8f1a7d4c9e6b3f2a',
    fromAddress: '0x8f3c6a9d2e5b8f1a4d7c3e9b6f2a5d8c',
    toAddress: '0x1e4b7f9a3d6c2e5b8f1a7d4c9e6b3f2a',
    fromLabel: 'Coinbase Custody Prime',
    toLabel: 'Whale Address #9876',
    value: '8,456.12',
    valueUsd: 22709340,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 600000), // 10 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '21000',
    gasPrice: '35',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '3',
    txHash: '0xa5d8c2e6b9f3a7d1c4e8b5f2a9d6c3e1b7f4a8d2c5e9b6f3a1d4c7e2b8f5a9d6',
    fromAddress: '0xa5d8c2e6b9f3a7d1c4e8b5f2a9d6c3e1',
    toAddress: '0xb7f4a8d2c5e9b6f3a1d4c7e2b8f5a9d6',
    fromLabel: 'Jump Trading Alpha',
    toLabel: 'Solana DeFi Protocols',
    value: '389,567.23',
    valueUsd: 24890340,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 960000), // 16 minutes ago
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '4',
    txHash: '0xc2e5b8f1a6d9c3e4b7f2a8d5c1e9b6f3a2d7c4e1b8f5a9d6c3e7b2f4a1d8c5e9',
    fromAddress: '0xc2e5b8f1a6d9c3e4b7f2a8d5c1e9b6f3',
    toAddress: '0xa2d7c4e1b8f5a9d6c3e7b2f4a1d8c5e9',
    fromLabel: 'Fidelity Digital Treasury',
    toLabel: 'Institutional Cold Storage',
    value: '198,734.56',
    valueUsd: 14234560,
    cryptocurrency: 'AVAX',
    timestamp: new Date(baseTimestamp - 1440000), // 24 minutes ago
    blockchain: 'Avalanche',
    gasUsed: '21000',
    gasPrice: '28',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '5',
    txHash: '0xe4b7f2a9d5c8e1b6f3a4d7c2e8b5f1a9d6c3e2b7f4a1d8c5e9b3f6a2d4c7e8b',
    fromAddress: '0xe4b7f2a9d5c8e1b6f3a4d7c2e8b5f1a9',
    toAddress: '0xd6c3e2b7f4a1d8c5e9b3f6a2d4c7e8b1',
    fromLabel: 'Uniswap V3: WBTC-USDC',
    toLabel: 'Liquidity Provider Alpha',
    value: '134.67',
    valueUsd: 19340560,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 2100000), // 35 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '295000',
    gasPrice: '38',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '6',
    txHash: '0xf6a3d8c5e2b9f4a7d1c6e9b2f5a8d4c1e7b3f9a6d2c5e8b1f4a7d9c3e6b8f2a5',
    fromAddress: '0xf6a3d8c5e2b9f4a7d1c6e9b2f5a8d4c1',
    toAddress: '0xe7b3f9a6d2c5e8b1f4a7d9c3e6b8f2a5',
    fromLabel: 'Grayscale Holdings Vault',
    toLabel: 'Trust Portfolio Rebalance',
    value: '9,876.54',
    valueUsd: 26890450,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 2700000), // 45 minutes ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '7',
    txHash: '0x3a7d4c1e8b5f2a9d6c3e5b8f1a4d7c2e9b6f3a1d5c8e4b7f2a6d9c8e5b3f1a7d',
    fromAddress: '0x3a7d4c1e8b5f2a9d6c3e5b8f1a4d7c2e',
    toAddress: '0x9b6f3a1d5c8e4b7f2a6d9c8e5b3f1a7d',
    fromLabel: 'Binance Ultra HNW Custody',
    toLabel: 'Enterprise Treasury Fund',
    value: '234,567.89',
    valueUsd: 12890340,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: false,
    status: 'confirmed',
  },
]

export function WhaleTransactionsList() {
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const handleViewTransaction = (txHash: string) => {
    // In real app, this would open the transaction in a blockchain explorer
    console.log('View transaction:', txHash)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span>Recent Whale Transactions</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
            {mockTransactions.filter(tx => tx.isAlert).length} Alerts
          </Badge>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            Export CSV
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full space-y-4">
            {mockTransactions.map((tx) => (
              <div 
                key={tx.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  tx.isAlert 
                    ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' 
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant={tx.isAlert ? 'destructive' : 'secondary'}>
                      {tx.cryptocurrency}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tx.blockchain}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        tx.status === 'confirmed' 
                          ? 'border-green-500 text-green-600' 
                          : 'border-yellow-500 text-yellow-600'
                      }`}
                    >
                      {tx.status}
                    </Badge>
                    {tx.isAlert && (
                      <Badge variant="outline" className="text-xs border-red-500 text-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Alert
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(tx.valueUsd)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.value} {tx.cryptocurrency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  {/* From Address */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">From</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-muted/50 rounded px-2 py-1">
                        <span className="text-sm font-mono">
                          {truncateAddress(tx.fromAddress, 8)}
                        </span>
                        <button 
                          onClick={() => handleCopyAddress(tx.fromAddress)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {tx.fromLabel && (
                        <Badge variant="outline" className="text-xs">
                          {tx.fromLabel}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* To Address */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">To</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-muted/50 rounded px-2 py-1">
                        <span className="text-sm font-mono">
                          {truncateAddress(tx.toAddress, 8)}
                        </span>
                        <button 
                          onClick={() => handleCopyAddress(tx.toAddress)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {tx.toLabel && (
                        <Badge variant="outline" className="text-xs">
                          {tx.toLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{getTimeAgo(tx.timestamp)}</span>
                    {tx.gasUsed && (
                      <span>Gas: {tx.gasUsed} @ {tx.gasPrice} Gwei</span>
                    )}
                    <span>Hash: {truncateAddress(tx.txHash, 10)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewTransaction(tx.txHash)}
                      className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>Explorer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {mockTransactions.length} of 2,847 transactions
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors">
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

