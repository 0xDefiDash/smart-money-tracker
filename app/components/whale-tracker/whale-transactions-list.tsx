
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ExternalLink, ArrowRightIcon, AlertTriangle, Copy, Eye } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'

// Mock whale transactions data with current timestamps (August 29, 2025)
const baseTimestamp = new Date('2025-08-29T04:15:00Z').getTime();
const mockTransactions = [
  {
    id: '1',
    txHash: '0x8a3f5e2b1d4c9a7f2e8b5c1d9a6f3e7b2c5d8a1f4e9b6c2d5a8f1e4b7c3d6a9f',
    fromAddress: '0x8a3f5e2b1d4c9a7f2e8b5c1d9a6f3e7b',
    toAddress: '0x2c5d8a1f4e9b6c2d5a8f1e4b7c3d6a9f',
    fromLabel: 'Binance 14',
    toLabel: 'Institutional Custody',
    value: '1,847.23',
    valueUsd: 5125000,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 900000), // 15 minutes ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '2',
    txHash: '0xf7d2b8e4a1c5f9b3d6a2e8c4f1b7d3a9c6f2b8e5a1d4c7f3b6a9e2c8f5b1d7a4',
    fromAddress: '0xf7d2b8e4a1c5f9b3d6a2e8c4f1b7d3a9',
    toAddress: '0xc6f2b8e5a1d4c7f3b6a9e2c8f5b1d7a4',
    fromLabel: 'Coinbase Prime',
    toLabel: 'Whale Address #1234',
    value: '1,892.67',
    valueUsd: 5283760,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
    blockchain: 'Ethereum',
    gasUsed: '21000',
    gasPrice: '18',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '3',
    txHash: '0x3e9c5a1f8b2d6f4a7c3e9b1d5f8a2c6f9b3e7a1d4c8f2b5a9e3c7f1b4d6a8c2e',
    fromAddress: '0x3e9c5a1f8b2d6f4a7c3e9b1d5f8a2c6f',
    toAddress: '0x9b3e7a1d4c8f2b5a9e3c7f1b4d6a8c2e',
    fromLabel: 'Jump Trading',
    toLabel: 'Unknown Wallet',
    value: '125,850',
    valueUsd: 11450000,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 2700000), // 45 minutes ago
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '4',
    txHash: '0x4f1a7c3e9b5d2f8a6c4e1b7d9f3a5c2e8b4f7a1d3c9f2b6e5a8c1f4b7d2a9c6f',
    fromAddress: '0x4f1a7c3e9b5d2f8a6c4e1b7d9f3a5c2e',
    toAddress: '0x8b4f7a1d3c9f2b6e5a8c1f4b7d2a9c6f',
    fromLabel: 'OKX Exchange',
    toLabel: 'DeFi Treasury',
    value: '8,234.45',
    valueUsd: 2635024,
    cryptocurrency: 'BNB',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'BSC',
    gasUsed: '21000',
    gasPrice: '3',
    isAlert: false,
    status: 'confirmed',
  },
  {
    id: '5',
    txHash: '0x7b2e5a8c1f4d9a3f6c2e8b5a1d7f3c9b6e4a2f8c5a1d4f7b3e6c9a2f5b8d1c4e',
    fromAddress: '0x7b2e5a8c1f4d9a3f6c2e8b5a1d7f3c9b',
    toAddress: '0x6e4a2f8c5a1d4f7b3e6c9a2f5b8d1c4e',
    fromLabel: 'Uniswap V3: USDC-ETH',
    toLabel: 'Arbitrage Bot',
    value: '3,456.78',
    valueUsd: 9654332,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 5400000), // 1.5 hours ago
    blockchain: 'Ethereum',
    gasUsed: '284000',
    gasPrice: '22',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '6',
    txHash: '0x9c4f1a3e7b2d8f5a1c6e9b3d2f7a4c8e1b5d9f2a6c3e7b4f1a8d2c5f9b6e3a7c',
    fromAddress: '0x9c4f1a3e7b2d8f5a1c6e9b3d2f7a4c8e',
    toAddress: '0x1b5d9f2a6c3e7b4f1a8d2c5f9b6e3a7c',
    fromLabel: 'BlackRock Bitcoin ETF',
    toLabel: 'Custody Vault',
    value: '3,247.89',
    valueUsd: 9012500,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 7200000), // 2 hours ago
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '7',
    txHash: '0x2d8f5a1c6e3b9f4a7c2e5d8a1f3c6b9e4a7c2d5f8a1c3e6b9f4a2d7c5e8b1f6a',
    fromAddress: '0x2d8f5a1c6e3b9f4a7c2e5d8a1f3c6b9e',
    toAddress: '0x4a7c2d5f8a1c3e6b9f4a2d7c5e8b1f6a',
    fromLabel: 'Bybit Hot Wallet',
    toLabel: 'Cold Storage',
    value: '67,340',
    valueUsd: 6125800,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 10800000), // 3 hours ago
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
