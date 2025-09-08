
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ExternalLink, ArrowRightIcon, AlertTriangle, Copy, Eye } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'

// Mock whale transactions data with current timestamps (September 8, 2025)
const baseTimestamp = new Date('2025-09-08T14:30:00Z').getTime();
const mockTransactions = [
  {
    id: '1',
    txHash: '0x4b9e7a2f5c8d1e9b3f6a4d7c2e8b5f1a9d3c6e2f8a5b1d9c4e7b2f5a8d3c6e9b',
    fromAddress: '0x4b9e7a2f5c8d1e9b3f6a4d7c2e8b5f1a',
    toAddress: '0x9d3c6e2f8a5b1d9c4e7b2f5a8d3c6e9b',
    fromLabel: 'Coinbase Prime',
    toLabel: 'Institutional Treasury',
    value: '4,892.34',
    valueUsd: 13456780,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 480000), // 8 minutes ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '2',
    txHash: '0x7c3f8a1d5e9c2f6b4a7d1c8e5b2f9a4d6c3e8b1f5a9d2c6e4b7f1a3d8c5e9b2f',
    fromAddress: '0x7c3f8a1d5e9c2f6b4a7d1c8e5b2f9a4d',
    toAddress: '0x6c3e8b1f5a9d2c6e4b7f1a3d8c5e9b2f',
    fromLabel: 'Binance Ultra HNW',
    toLabel: 'Whale Address #5678',
    value: '5,234.67',
    valueUsd: 14056920,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 960000), // 16 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '21000',
    gasPrice: '28',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '3',
    txHash: '0x8e5b2f9c4a7d1e6b3f8a5d2c9e6b4f7a1d3c8e5b2f9a4d6c1e8b5f2a7d3c9e6b',
    fromAddress: '0x8e5b2f9c4a7d1e6b3f8a5d2c9e6b4f7a',
    toAddress: '0x1d3c8e5b2f9a4d6c1e8b5f2a7d3c9e6b',
    fromLabel: 'Jump Trading',
    toLabel: 'DeFi Protocol Pool',
    value: '234,567.89',
    valueUsd: 16890340,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 1680000), // 28 minutes ago
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '4',
    txHash: '0x3f6a9c2e5d8b1f4a7c3e9b5d2f8a6c1e4b7f3a9d5c2e8b4f1a6d9c3e7b5f2a8d',
    fromAddress: '0x3f6a9c2e5d8b1f4a7c3e9b5d2f8a6c1e',
    toAddress: '0x4b7f3a9d5c2e8b4f1a6d9c3e7b5f2a8d',
    fromLabel: 'Kraken Institutional',
    toLabel: 'Enterprise Treasury',
    value: '156,789.23',
    valueUsd: 8234560,
    cryptocurrency: 'AVAX',
    timestamp: new Date(baseTimestamp - 2400000), // 40 minutes ago
    blockchain: 'Avalanche',
    gasUsed: '21000',
    gasPrice: '25',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '5',
    txHash: '0x9a5d2c8e4b1f7a3d6c9e2b5f8a1d4c7e3b9f5a2d8c6e1b4f7a9d3c5e8b2f6a4d',
    fromAddress: '0x9a5d2c8e4b1f7a3d6c9e2b5f8a1d4c7e',
    toAddress: '0x3b9f5a2d8c6e1b4f7a9d3c5e8b2f6a4d',
    fromLabel: 'Uniswap V3: WBTC-ETH',
    toLabel: 'Liquidity Provider',
    value: '89.45',
    valueUsd: 12340560,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'Ethereum',
    gasUsed: '295000',
    gasPrice: '32',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '6',
    txHash: '0x2c8f5a1d6e9b3f4a7c2e5d8a1f6c9b4e3a7d2c8f5a1e9b6d3c4f7a2d8c5e9b1f',
    fromAddress: '0x2c8f5a1d6e9b3f4a7c2e5d8a1f6c9b4e',
    toAddress: '0x3a7d2c8f5a1e9b6d3c4f7a2d8c5e9b1f',
    fromLabel: 'BlackRock Digital',
    toLabel: 'Strategic Reserve',
    value: '6,789.12',
    valueUsd: 18690450,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 5400000), // 1.5 hours ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '7',
    txHash: '0x5f8a3d6c1e9b4f2a7d5c8e1b6f9a3d2c4e7b5f8a1d6c9e3b2f4a7d1c8e5b9f3a',
    fromAddress: '0x5f8a3d6c1e9b4f2a7d5c8e1b6f9a3d2c',
    toAddress: '0x4e7b5f8a1d6c9e3b2f4a7d1c8e5b9f3a',
    fromLabel: 'OKX Institutional',
    toLabel: 'Cold Vault Storage',
    value: '145,678.90',
    valueUsd: 7890340,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 7200000), // 2 hours ago
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
            Showing {mockTransactions.length} of 2,394 transactions
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
