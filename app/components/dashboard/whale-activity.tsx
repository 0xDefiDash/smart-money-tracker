
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Mock whale transaction data with current timestamps for September 2, 2025
const baseTimestamp = new Date('2025-09-02T15:30:00Z').getTime();
const mockWhaleTransactions = [
  {
    id: '1',
    txHash: '0x8f2a9c6b4e7d3a5b8f2c9e6d4a7b5f8c2e9a6d3b5f8c2e9a6d3b7f8c2e9a6d',
    fromAddress: '0x8f2a9c6b4e7d3a5b8f2c9e6d4a7b5f8c2e9a',
    toAddress: '0x3b5f8c2e9a6d3b7f8c2e9a6d3b5f8c2e9a6d',
    value: '3,456.75',
    valueUsd: 4892450,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 600000), // 10 minutes ago
    blockchain: 'bitcoin',
    isAlert: true,
  },
  {
    id: '2',
    txHash: '0x5c8f2e9b6a4d7c5f8b2e9c6a4d7b5f8c2e9a6d3b5f8c2e9a6d3b7f8c2e9a6d',
    fromAddress: '0x5c8f2e9b6a4d7c5f8b2e9c6a4d7b5f8c',
    toAddress: '0xe9a6d3b5f8c2e9a6d3b7f8c2e9a6d3b5',
    value: '1,847.92',
    valueUsd: 4563280,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 1200000), // 20 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '3',
    txHash: '0xa7f9c2b5e8d4a7c5f8b2e9c6a4d7b5f8c2e9a6d3b5f8c2e9a6d3b7f8c2e9a6',
    fromAddress: '0xa7f9c2b5e8d4a7c5f8b2e9c6a4d7b5f8',
    toAddress: '0xc2e9a6d3b5f8c2e9a6d3b7f8c2e9a6d3',
    value: '78,432.15',
    valueUsd: 3685537,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
    blockchain: 'solana',
    isAlert: true,
  },
  {
    id: '4',
    txHash: '0x3e6d9c2f5b8a4e7d2f5b8a4e7d2f5b8a4e7d2f5b8a4e7d2f5b8a4e7d2f5b8',
    fromAddress: '0x3e6d9c2f5b8a4e7d2f5b8a4e7d2f5b8a',
    toAddress: '0x4e7d2f5b8a4e7d2f5b8a4e7d2f5b8a4e',
    value: '218,750.80',
    valueUsd: 2325438,
    cryptocurrency: 'BNB',
    timestamp: new Date(baseTimestamp - 2700000), // 45 minutes ago
    blockchain: 'bsc',
    isAlert: false,
  },
  {
    id: '5',
    txHash: '0xb4d7a3f6c9e2b4d7a3f6c9e2b4d7a3f6c9e2b4d7a3f6c9e2b4d7a3f6c9e2b4',
    fromAddress: '0xb4d7a3f6c9e2b4d7a3f6c9e2b4d7a3f6',
    toAddress: '0xc9e2b4d7a3f6c9e2b4d7a3f6c9e2b4d7',
    value: '12.45',
    valueUsd: 1978000,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'ethereum',
    isAlert: false,
  },
  {
    id: '6',
    txHash: '0xf8c5b2e9a6d3f8c5b2e9a6d3f8c5b2e9a6d3f8c5b2e9a6d3f8c5b2e9a6d3f8',
    fromAddress: '0xf8c5b2e9a6d3f8c5b2e9a6d3f8c5b2e9',
    toAddress: '0xa6d3f8c5b2e9a6d3f8c5b2e9a6d3f8c5',
    value: '1,567,890',
    valueUsd: 1534200,
    cryptocurrency: 'USDC',
    timestamp: new Date(baseTimestamp - 5400000), // 1.5 hours ago
    blockchain: 'ethereum',
    isAlert: true,
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
