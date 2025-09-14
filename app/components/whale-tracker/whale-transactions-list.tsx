


'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ExternalLink, ArrowRightIcon, AlertTriangle, Copy, Eye } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'

// Updated whale transactions data for September 14, 2025
const baseTimestamp = new Date('2025-09-14T16:30:00Z').getTime();
const mockTransactions = [
  {
    id: '1',
    txHash: '0x9a2f5d7c9e4b1f6a8d3c5e7b2f9a6d4c1e8b3f7a5d2c9e6b4f1a8d7c2e5b9f3a6',
    fromAddress: '0x9a2f5d7c9e4b1f6a8d3c5e7b2f9a6d4c',
    toAddress: '0x1e8b3f7a5d2c9e6b4f1a8d7c2e5b9f3',
    fromLabel: 'BlackRock Ultra Digital Vault',
    toLabel: 'MicroStrategy Treasury Prime',
    value: '12,456.78',
    valueUsd: 36789450,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 240000), // 4 minutes ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '2',
    txHash: '0xc5f8a3d6c1e9b4f7a2d5c8e3b6f9a1d4c7e2b5f8a3d6c9e1b4f7a2d5c8e3b6f9d2',
    fromAddress: '0xc5f8a3d6c1e9b4f7a2d5c8e3b6f9a1d4',
    toAddress: '0xc7e2b5f8a3d6c9e1b4f7a2d5c8e3b6f9',
    fromLabel: 'Coinbase Prime Ultra Custody',
    toLabel: 'Ethereum Foundation Strategic',
    value: '15,678.90',
    valueUsd: 42890780,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 480000), // 8 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '21000',
    gasPrice: '45',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '3',
    txHash: '0xe3c7e1b4f9a6d2c5e8b3f7a1d4c9e6b2f5a8d3c7e1b4f9a6d2c5e8b3f7a1d4c9e6',
    fromAddress: '0xe3c7e1b4f9a6d2c5e8b3f7a1d4c9e6b2',
    toAddress: '0xf5a8d3c7e1b4f9a6d2c5e8b3f7a1d4c9',
    fromLabel: 'Jump Trading Alpha Fund',
    toLabel: 'Solana Foundation Reserve',
    value: '678,901.23',
    valueUsd: 45678900,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 900000), // 15 minutes ago
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '4',
    txHash: '0xa6b2f5a8d3c7e1b4f9a6d2c5e8b3f7a1d4c9e6b2f5a8d3c7e1b4f9a6d2c5e8b3f7',
    fromAddress: '0xa6b2f5a8d3c7e1b4f9a6d2c5e8b3f7a1',
    toAddress: '0xd4c9e6b2f5a8d3c7e1b4f9a6d2c5e8b3',
    fromLabel: 'Grayscale Ultra Holdings',
    toLabel: 'Institutional Multi-Sig Vault',
    value: '345,678.90',
    valueUsd: 28456780,
    cryptocurrency: 'TON',
    timestamp: new Date(baseTimestamp - 1440000), // 24 minutes ago
    blockchain: 'TON',
    gasUsed: '21000',
    gasPrice: '18',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '5',
    txHash: '0xf4b7f2a9d5c8e1b6f3a4d7c2e8b5f1a9d6c3e2b7f4a1d8c5e9b3f6a2d4c7e8b1f5',
    fromAddress: '0xf4b7f2a9d5c8e1b6f3a4d7c2e8b5f1a9',
    toAddress: '0xd6c3e2b7f4a1d8c5e9b3f6a2d4c7e8b1',
    fromLabel: 'Uniswap V4: WBTC-USDC Pool',
    toLabel: 'DeFi Yield Farming Protocol',
    value: '189.45',
    valueUsd: 28934560,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 2100000), // 35 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '315000',
    gasPrice: '42',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '6',
    txHash: '0xb6a3d8c5e2b9f4a7d1c6e9b2f5a8d4c1e7b3f9a6d2c5e8b1f4a7d9c3e6b8f2a5d1',
    fromAddress: '0xb6a3d8c5e2b9f4a7d1c6e9b2f5a8d4c1',
    toAddress: '0xe7b3f9a6d2c5e8b1f4a7d9c3e6b8f2a5',
    fromLabel: 'Fidelity Digital Asset Vault',
    toLabel: 'Corporate Treasury Rebalancing',
    value: '13,456.78',
    valueUsd: 41234560,
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
    txHash: '0xc3a7d4c1e8b5f2a9d6c3e5b8f1a4d7c2e9b6f3a1d5c8e4b7f2a6d9c8e5b3f1a7d4',
    fromAddress: '0xc3a7d4c1e8b5f2a9d6c3e5b8f1a4d7c2e',
    toAddress: '0x9b6f3a1d5c8e4b7f2a6d9c8e5b3f1a7d',
    fromLabel: 'Binance Ultra HNW Custody',
    toLabel: 'Enterprise Portfolio Manager',
    value: '456,789.12',
    valueUsd: 19876540,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 4200000), // 1.2 hours ago
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
            Showing {mockTransactions.length} of 3,247 transactions
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

