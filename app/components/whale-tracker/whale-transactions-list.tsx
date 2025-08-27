
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ExternalLink, ArrowRightIcon, AlertTriangle, Copy, Eye } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'

// Mock whale transactions data with deterministic timestamps
const baseTimestamp = new Date('2025-08-27T15:30:00Z').getTime();
const mockTransactions = [
  {
    id: '1',
    txHash: '0x742d35cc652c2dcbf9d5d3cf2c5c1b8f5e4f8e2a1b3c4d5e6f7g8h9i0j1k2l',
    fromAddress: '0x742d35cc652c2dcbf9d5d3cf2c5c1b8f5e4f8e2a',
    toAddress: '0x1b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
    fromLabel: 'Binance Hot Wallet',
    toLabel: 'Unknown Wallet',
    value: '2,450.65',
    valueUsd: 2450650,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 1200000),
    blockchain: 'Bitcoin',
    gasUsed: null,
    gasPrice: null,
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '2',
    txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    fromAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
    toAddress: '0x7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i',
    fromLabel: 'Coinbase Pro',
    toLabel: 'Whale Wallet #47',
    value: '1,285.34',
    valueUsd: 3325884,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 2400000),
    blockchain: 'Ethereum',
    gasUsed: '21000',
    gasPrice: '25',
    isAlert: true,
    status: 'confirmed',
  },
  {
    id: '3',
    txHash: '0x9f8e7d6c5b4a3928374656283947562834756283475628347562',
    fromAddress: '0x9f8e7d6c5b4a392837465628394756283475',
    toAddress: '0x2834756283475628347562834756283475628',
    fromLabel: 'DeFi Protocol',
    toLabel: 'Unknown Wallet',
    value: '50,000',
    valueUsd: 1550000,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 3600000),
    blockchain: 'Solana',
    gasUsed: null,
    gasPrice: null,
    isAlert: false,
    status: 'confirmed',
  },
  {
    id: '4',
    txHash: '0x5d4c3b2a19283746572836475628374562837456283745628374',
    fromAddress: '0x5d4c3b2a1928374657283647562837456283',
    toAddress: '0x7456283745628374562837456283745628374',
    fromLabel: 'Kraken Exchange',
    toLabel: 'Institutional Wallet',
    value: '125,430.50',
    valueUsd: 1880457,
    cryptocurrency: 'BNB',
    timestamp: new Date(baseTimestamp - 4800000),
    blockchain: 'BSC',
    gasUsed: '21000',
    gasPrice: '5',
    isAlert: false,
    status: 'pending',
  },
  {
    id: '5',
    txHash: '0xa1b2c3d4e5f6789012345678901234567890123456789012345678',
    fromAddress: '0xa1b2c3d4e5f67890123456789012345678901234',
    toAddress: '0x5678901234567890123456789012345678901234',
    fromLabel: 'Uniswap V3',
    toLabel: 'MEV Bot',
    value: '2,890.75',
    valueUsd: 7485950,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 6000000),
    blockchain: 'Ethereum',
    gasUsed: '150000',
    gasPrice: '35',
    isAlert: true,
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
            Showing {mockTransactions.length} of 1,247 transactions
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
