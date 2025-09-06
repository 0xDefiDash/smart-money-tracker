
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Mock whale transaction data with current timestamps for September 6, 2025
const baseTimestamp = new Date('2025-09-06T16:45:00Z').getTime();
const mockWhaleTransactions = [
  {
    id: '1',
    txHash: '0x9d3f7e2a8c5b1f4e9d3f7e2a8c5b1f4e9d3f7e2a8c5b1f4e9d3f7e2a8c5b1f',
    fromAddress: '0x9d3f7e2a8c5b1f4e9d3f7e2a8c5b1f4e',
    toAddress: '0x1f4e9d3f7e2a8c5b1f4e9d3f7e2a8c5b',
    value: '4,892.33',
    valueUsd: 6785420,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 480000), // 8 minutes ago
    blockchain: 'bitcoin',
    isAlert: true,
  },
  {
    id: '2',
    txHash: '0x2c8e5b1a9f6d3c8e5b1a9f6d3c8e5b1a9f6d3c8e5b1a9f6d3c8e5b1a9f6d3c',
    fromAddress: '0x2c8e5b1a9f6d3c8e5b1a9f6d3c8e5b1a',
    toAddress: '0x9f6d3c8e5b1a9f6d3c8e5b1a9f6d3c8e',
    value: '2,347.81',
    valueUsd: 6123890,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 900000), // 15 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '3',
    txHash: '0x7b4e8a2d5f9c7b4e8a2d5f9c7b4e8a2d5f9c7b4e8a2d5f9c7b4e8a2d5f9c7b',
    fromAddress: '0x7b4e8a2d5f9c7b4e8a2d5f9c7b4e8a2d',
    toAddress: '0x5f9c7b4e8a2d5f9c7b4e8a2d5f9c7b4e',
    value: '95,678.50',
    valueUsd: 5234750,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 1440000), // 24 minutes ago
    blockchain: 'solana',
    isAlert: true,
  },
  {
    id: '4',
    txHash: '0x6f1d9a3e7c2b6f1d9a3e7c2b6f1d9a3e7c2b6f1d9a3e7c2b6f1d9a3e7c2b6f',
    fromAddress: '0x6f1d9a3e7c2b6f1d9a3e7c2b6f1d9a3e',
    toAddress: '0x7c2b6f1d9a3e7c2b6f1d9a3e7c2b6f1d',
    value: '156,892.40',
    valueUsd: 4782390,
    cryptocurrency: 'AVAX',
    timestamp: new Date(baseTimestamp - 2100000), // 35 minutes ago
    blockchain: 'avalanche',
    isAlert: true,
  },
  {
    id: '5',
    txHash: '0x4a8c3f6e1b9d4a8c3f6e1b9d4a8c3f6e1b9d4a8c3f6e1b9d4a8c3f6e1b9d4a',
    fromAddress: '0x4a8c3f6e1b9d4a8c3f6e1b9d4a8c3f6e',
    toAddress: '0x1b9d4a8c3f6e1b9d4a8c3f6e1b9d4a8c',
    value: '24.78',
    valueUsd: 3442750,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 2880000), // 48 minutes ago
    blockchain: 'ethereum',
    isAlert: false,
  },
  {
    id: '6',
    txHash: '0x8e5b2f9a4d7c8e5b2f9a4d7c8e5b2f9a4d7c8e5b2f9a4d7c8e5b2f9a4d7c8e',
    fromAddress: '0x8e5b2f9a4d7c8e5b2f9a4d7c8e5b2f9a',
    toAddress: '0x4d7c8e5b2f9a4d7c8e5b2f9a4d7c8e5b',
    value: '2,789,450',
    valueUsd: 2789450,
    cryptocurrency: 'USDC',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'ethereum',
    isAlert: false,
  },
  {
    id: '7',
    txHash: '0x3d9f6c2e8a5b3d9f6c2e8a5b3d9f6c2e8a5b3d9f6c2e8a5b3d9f6c2e8a5b3d',
    fromAddress: '0x3d9f6c2e8a5b3d9f6c2e8a5b3d9f6c2e',
    toAddress: '0x8a5b3d9f6c2e8a5b3d9f6c2e8a5b3d9f',
    value: '67,234.89',
    valueUsd: 2156780,
    cryptocurrency: 'MATIC',
    timestamp: new Date(baseTimestamp - 4320000), // 1.2 hours ago
    blockchain: 'polygon',
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
