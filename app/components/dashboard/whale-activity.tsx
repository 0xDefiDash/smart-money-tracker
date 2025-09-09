

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Mock whale transaction data with current timestamps for September 9, 2025
const baseTimestamp = new Date('2025-09-09T15:45:00Z').getTime();
const mockWhaleTransactions = [
  {
    id: '1',
    txHash: '0x3f9a8d2c5e7b1f4a6d9c3e8b2f5a7d1c4e9b6f2a8d5c1e7b3f9a6d2c8e4b7f',
    fromAddress: '0x3f9a8d2c5e7b1f4a6d9c3e8b2f5a7d1c',
    toAddress: '0x4e9b6f2a8d5c1e7b3f9a6d2c8e4b7f1a',
    value: '4,567.23',
    valueUsd: 12847590,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 240000), // 4 minutes ago
    blockchain: 'bitcoin',
    isAlert: true,
  },
  {
    id: '2',
    txHash: '0x8c4f7a1e5d9b3f6a2d8c5e1b7f4a9d3c6e2f8a5d1c9b4e7f2a6d8c3e5b9f1a4',
    fromAddress: '0x8c4f7a1e5d9b3f6a2d8c5e1b7f4a9d3c',
    toAddress: '0x6e2f8a5d1c9b4e7f2a6d8c3e5b9f1a4d',
    value: '5,123.89',
    valueUsd: 13759820,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 540000), // 9 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '3',
    txHash: '0xa2d6c9e4b1f7a5d8c3e6b9f2a4d7c1e8b5f3a9d6c2e4b7f1a8d5c9e3b6f2a7d',
    fromAddress: '0xa2d6c9e4b1f7a5d8c3e6b9f2a4d7c1e8',
    toAddress: '0xb5f3a9d6c2e4b7f1a8d5c9e3b6f2a7d1',
    value: '278,934.56',
    valueUsd: 17890450,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 780000), // 13 minutes ago
    blockchain: 'solana',
    isAlert: true,
  },
  {
    id: '4',
    txHash: '0x5e8b1f4a9d6c2e8f5a3d7b1e9c4f2a8d6c5e1b9f3a7d4c2e8b5f1a6d9c3e8b',
    fromAddress: '0x5e8b1f4a9d6c2e8f5a3d7b1e9c4f2a8d',
    toAddress: '0x6c5e1b9f3a7d4c2e8b5f1a6d9c3e8b2f',
    value: '124,567.80',
    valueUsd: 9234570,
    cryptocurrency: 'AVAX',
    timestamp: new Date(baseTimestamp - 1320000), // 22 minutes ago
    blockchain: 'avalanche',
    isAlert: true,
  },
  {
    id: '5',
    txHash: '0x7f2a9d5c8e1b6f3a2d9c4e7b1f5a8d6c3e9b2f4a7d1c5e8b9f3a6d2c4e7b1f8',
    fromAddress: '0x7f2a9d5c8e1b6f3a2d9c4e7b1f5a8d6c',
    toAddress: '0x3e9b2f4a7d1c5e8b9f3a6d2c4e7b1f8a',
    value: '67.89',
    valueUsd: 9789540,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '6',
    txHash: '0x9b4e7c2f5a8d1e6b3f9a4d7c2e5b8f1a6d9c3e4b7f2a5d8c1e9b6f3a7d4c2e8',
    fromAddress: '0x9b4e7c2f5a8d1e6b3f9a4d7c2e5b8f1a',
    toAddress: '0x6d9c3e4b7f2a5d8c1e9b6f3a7d4c2e8b',
    value: '6,789,012',
    valueUsd: 6789012,
    cryptocurrency: 'USDC',
    timestamp: new Date(baseTimestamp - 2400000), // 40 minutes ago
    blockchain: 'ethereum',
    isAlert: false,
  },
  {
    id: '7',
    txHash: '0x4c7b2e9f6a3d1c8e5b9f4a2d7c1e6b8f3a5d9c2e4b7f1a8d6c9e3b4f7a2d1c5',
    fromAddress: '0x4c7b2e9f6a3d1c8e5b9f4a2d7c1e6b8f',
    toAddress: '0x3a5d9c2e4b7f1a8d6c9e3b4f7a2d1c5e',
    value: '156,780.45',
    valueUsd: 4567890,
    cryptocurrency: 'MATIC',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
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

