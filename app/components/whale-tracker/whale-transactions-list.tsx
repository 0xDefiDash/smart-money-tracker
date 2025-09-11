

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ExternalLink, ArrowRightIcon, AlertTriangle, Copy, Eye } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'

// Updated whale transactions data for September 11, 2025
const baseTimestamp = new Date('2025-09-11T18:15:00Z').getTime();
const mockTransactions = [
  {
    id: '1',
    txHash: '0x8a2f5d7c9e4b1f6a8d3c5e7b2f9a6d4c1e8b3f7a5d2c9e6b4f1a8d7c2e5b9f3',
    fromAddress: '0x8a2f5d7c9e4b1f6a8d3c5e7b2f9a6d4c',
    toAddress: '0x1e8b3f7a5d2c9e6b4f1a8d7c2e5b9f3',
    fromLabel: 'BlackRock Digital Assets Ultra',
    toLabel: 'MicroStrategy Corporate Treasury',
    value: '9,876.45',
    valueUsd: 28945600,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 180000), // 3 minutes ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '2',
    txHash: '0xb5f8a3d6c1e9b4f7a2d5c8e3b6f9a1d4c7e2b5f8a3d6c9e1b4f7a2d5c8e3b6f9',
    fromAddress: '0xb5f8a3d6c1e9b4f7a2d5c8e3b6f9a1d4',
    toAddress: '0xc7e2b5f8a3d6c9e1b4f7a2d5c8e3b6f9',
    fromLabel: 'Coinbase Custody Prime',
    toLabel: 'Ethereum Foundation Treasury',
    value: '12,389.67',
    valueUsd: 32145780,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 420000), // 7 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '21000',
    gasPrice: '42',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '3',
    txHash: '0xd3c7e1b4f9a6d2c5e8b3f7a1d4c9e6b2f5a8d3c7e1b4f9a6d2c5e8b3f7a1d4c9',
    fromAddress: '0xd3c7e1b4f9a6d2c5e8b3f7a1d4c9e6b2',
    toAddress: '0xf5a8d3c7e1b4f9a6d2c5e8b3f7a1d4c9',
    fromLabel: 'Jump Trading Sigma',
    toLabel: 'Alameda Reserve Fund',
    value: '567,890.12',
    valueUsd: 34256700,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 840000), // 14 minutes ago
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '4',
    txHash: '0xe6b2f5a8d3c7e1b4f9a6d2c5e8b3f7a1d4c9e6b2f5a8d3c7e1b4f9a6d2c5e8b3',
    fromAddress: '0xe6b2f5a8d3c7e1b4f9a6d2c5e8b3f7a1',
    toAddress: '0xd4c9e6b2f5a8d3c7e1b4f9a6d2c5e8b3',
    fromLabel: 'Grayscale Holdings Prime',
    toLabel: 'Institutional Cold Storage',
    value: '234,567.89',
    valueUsd: 18967340,
    cryptocurrency: 'TON',
    timestamp: new Date(baseTimestamp - 1260000), // 21 minutes ago
    blockchain: 'TON',
    gasUsed: '21000',
    gasPrice: '15',
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

