
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Mock whale transaction data with current timestamps for September 8, 2025
const baseTimestamp = new Date('2025-09-08T14:30:00Z').getTime();
const mockWhaleTransactions = [
  {
    id: '1',
    txHash: '0x2f8a7d9b4e3c1a6f8d2b9e5c7f1a4d6b8c3e9f2a5d7c1e8b4f9a2d6c8e5b3f',
    fromAddress: '0x2f8a7d9b4e3c1a6f8d2b9e5c7f1a4d6b',
    toAddress: '0x8c3e9f2a5d7c1e8b4f9a2d6c8e5b3f1a',
    value: '3,247.89',
    valueUsd: 8945670,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 360000), // 6 minutes ago
    blockchain: 'bitcoin',
    isAlert: true,
  },
  {
    id: '2',
    txHash: '0xa7c5f1d8b2e6a9c4f7d1b8e5c2f9a6d3b7e1c8f4a2d9b6e3c1f7a5d8b4e2c6f',
    fromAddress: '0xa7c5f1d8b2e6a9c4f7d1b8e5c2f9a6d3',
    toAddress: '0xb7e1c8f4a2d9b6e3c1f7a5d8b4e2c6f9',
    value: '3,892.14',
    valueUsd: 10456780,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 720000), // 12 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '3',
    txHash: '0xd4b8e7a3f9c2d6a1e8b5c9f3a7d2b6e4c1f8a5d9b3e7c2f6a4d1b8e5c9f2a7d',
    fromAddress: '0xd4b8e7a3f9c2d6a1e8b5c9f3a7d2b6e4',
    toAddress: '0xc1f8a5d9b3e7c2f6a4d1b8e5c9f2a7d3',
    value: '234,560.75',
    valueUsd: 12890450,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 1080000), // 18 minutes ago
    blockchain: 'solana',
    isAlert: true,
  },
  {
    id: '4',
    txHash: '0x9e6c2f5a8d1b7e4c3f9a2d6b8e5c1f7a4d3b9e6c2f8a5d1b7e4c9f2a6d8b5e3',
    fromAddress: '0x9e6c2f5a8d1b7e4c3f9a2d6b8e5c1f7a',
    toAddress: '0x4d3b9e6c2f8a5d1b7e4c9f2a6d8b5e3c',
    value: '89,345.20',
    valueUsd: 7234590,
    cryptocurrency: 'AVAX',
    timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
    blockchain: 'avalanche',
    isAlert: true,
  },
  {
    id: '5',
    txHash: '0x5c8a3f6d1b9e7c4a2f8d5b1e9c6a3f7d2b8e5c1a9f6d3b7e4c2a8f5d1b9e6c3',
    fromAddress: '0x5c8a3f6d1b9e7c4a2f8d5b1e9c6a3f7d',
    toAddress: '0x2b8e5c1a9f6d3b7e4c2a8f5d1b9e6c3a',
    value: '45.67',
    valueUsd: 6789320,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 2400000), // 40 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '6',
    txHash: '0x8f2d6a9c5e1b8f3d7a2c6e9b4f1d8a3c7e2b6f9a5d1c8e4b7f2a9d6c3e8b5f1',
    fromAddress: '0x8f2d6a9c5e1b8f3d7a2c6e9b4f1d8a3c',
    toAddress: '0x7e2b6f9a5d1c8e4b7f2a9d6c3e8b5f1a',
    value: '4,567,890',
    valueUsd: 4567890,
    cryptocurrency: 'USDC',
    timestamp: new Date(baseTimestamp - 3000000), // 50 minutes ago
    blockchain: 'ethereum',
    isAlert: false,
  },
  {
    id: '7',
    txHash: '0x6b9e4c2f7a5d1b8e3c9f6a2d7b4e1c8f5a3d9b6e2c7f4a1d8b5e9c3f7a2d6b',
    fromAddress: '0x6b9e4c2f7a5d1b8e3c9f6a2d7b4e1c8f',
    toAddress: '0x5a3d9b6e2c7f4a1d8b5e9c3f7a2d6b1e',
    value: '89,450.30',
    valueUsd: 3456890,
    cryptocurrency: 'MATIC',
    timestamp: new Date(baseTimestamp - 4200000), // 1.17 hours ago
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
