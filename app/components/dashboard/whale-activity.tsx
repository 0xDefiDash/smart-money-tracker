
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Mock whale transaction data with deterministic timestamps
const baseTimestamp = new Date('2025-08-27T15:30:00Z').getTime();
const mockWhaleTransactions = [
  {
    id: '1',
    txHash: '0x742d35cc652c2dcbf9d5d3cf2c5c1b8f5e4f8e2a1b3c4d5e6f7g8h9i0j1k2l',
    fromAddress: '0x742d35cc652c2dcbf9d5d3cf2c5c1b8f5e4f8e2a',
    toAddress: '0x1b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
    value: '2,450.65',
    valueUsd: 2450650,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 1200000), // 20 minutes ago
    blockchain: 'bitcoin',
    isAlert: true,
  },
  {
    id: '2',
    txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    fromAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
    toAddress: '0x7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i',
    value: '1,285.34',
    valueUsd: 3325884,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 2400000), // 40 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '3',
    txHash: '0x9f8e7d6c5b4a3928374656283947562834756283475628347562',
    fromAddress: '0x9f8e7d6c5b4a392837465628394756283475',
    toAddress: '0x2834756283475628347562834756283475628',
    value: '50,000',
    valueUsd: 1550000,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'solana',
    isAlert: false,
  },
  {
    id: '4',
    txHash: '0x5d4c3b2a19283746572836475628374562837456283745628374',
    fromAddress: '0x5d4c3b2a1928374657283647562837456283',
    toAddress: '0x7456283745628374562837456283745628374',
    value: '125,430.50',
    valueUsd: 1880457,
    cryptocurrency: 'BNB',
    timestamp: new Date(baseTimestamp - 4800000), // 80 minutes ago
    blockchain: 'bsc',
    isAlert: false,
  },
]

export function WhaleActivity() {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Whale Activity</span>
        </CardTitle>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
          {mockWhaleTransactions.filter(tx => tx.isAlert).length} Active Alerts
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {mockWhaleTransactions.map((tx, index) => (
            <div 
              key={tx.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                tx.isAlert 
                  ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20' 
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge variant={tx.isAlert ? 'destructive' : 'secondary'} className="text-xs">
                    {tx.cryptocurrency}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {tx.blockchain}
                  </span>
                  {tx.isAlert && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                      Alert
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {getTimeAgo(tx.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">
                    {truncateAddress(tx.fromAddress)}
                  </span>
                  <ArrowRightIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {truncateAddress(tx.toAddress)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(tx.valueUsd)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.value} {tx.cryptocurrency}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>View Transaction</span>
                </button>
                <div className="text-xs text-muted-foreground">
                  Hash: {truncateAddress(tx.txHash, 8)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All Whale Transactions →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
