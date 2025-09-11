

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Updated whale transaction data for September 11, 2025
const baseTimestamp = new Date('2025-09-11T18:15:00Z').getTime();
const mockWhaleTransactions = [
  {
    id: '1',
    txHash: '0x9f4d7b2e8c3a6f1d5b9a4e7c2f5d8b1a6e3c9f5d2b8e4a7f1d6c3b9e2f5a8d',
    fromAddress: '0x9f4d7b2e8c3a6f1d5b9a4e7c2f5d8b1a',
    toAddress: '0x6e3c9f5d2b8e4a7f1d6c3b9e2f5a8d3c',
    value: '6,789.34',
    valueUsd: 19876540,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 180000), // 3 minutes ago
    blockchain: 'bitcoin',
    isAlert: true,
  },
  {
    id: '2',
    txHash: '0xb2f8d5a1c7e4b9f3a6d2c8e5b1f7a4d9c6e3b8f2a5d1c9e4b7f3a6d8c2e5b9',
    fromAddress: '0xb2f8d5a1c7e4b9f3a6d2c8e5b1f7a4d9',
    toAddress: '0xc6e3b8f2a5d1c9e4b7f3a6d8c2e5b9f1',
    value: '7,856.91',
    valueUsd: 20456780,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 420000), // 7 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '3',
    txHash: '0xd7c3e9b5f1a8d4c2e6b3f9a2d5c7e1b4f8a6d9c3e2b5f7a1d4c8e6b3f9a2d5',
    fromAddress: '0xd7c3e9b5f1a8d4c2e6b3f9a2d5c7e1b4',
    toAddress: '0xf8a6d9c3e2b5f7a1d4c8e6b3f9a2d5c7',
    value: '456,789.23',
    valueUsd: 27890340,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 840000), // 14 minutes ago
    blockchain: 'solana',
    isAlert: true,
  },
  {
    id: '4',
    txHash: '0xa5c8e2b6f9d1a4c7e3b8f5a2d9c6e1b4f7a3d8c2e5b9f6a1d4c7e2b8f5a9d',
    fromAddress: '0xa5c8e2b6f9d1a4c7e3b8f5a2d9c6e1b4',
    toAddress: '0xf7a3d8c2e5b9f6a1d4c7e2b8f5a9d6c3',
    value: '345,678.90',
    valueUsd: 23456780,
    cryptocurrency: 'TON',
    timestamp: new Date(baseTimestamp - 1260000), // 21 minutes ago
    blockchain: 'ton',
    isAlert: true,
  },
  {
    id: '5',
    txHash: '0xe3b9f6a2d5c8e1b4f7a9d3c6e2b8f5a1d9c4e7b3f6a8d2c5e1b9f4a7d6c3e8',
    fromAddress: '0xe3b9f6a2d5c8e1b4f7a9d3c6e2b8f5a1',
    toAddress: '0xd9c4e7b3f6a8d2c5e1b9f4a7d6c3e8b5',
    value: '89.76',
    valueUsd: 12678900,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
    blockchain: 'ethereum',
    isAlert: true,
  },
  {
    id: '6',
    txHash: '0xc4e7b1f8a5d9c2e6b3f1a7d4c8e5b9f2a6d3c7e1b4f8a2d5c9e6b3f7a1d4c8',
    fromAddress: '0xc4e7b1f8a5d9c2e6b3f1a7d4c8e5b9f2',
    toAddress: '0xa6d3c7e1b4f8a2d5c9e6b3f7a1d4c8e5',
    value: '8,900,123',
    valueUsd: 8900123,
    cryptocurrency: 'USDC',
    timestamp: new Date(baseTimestamp - 2400000), // 40 minutes ago
    blockchain: 'ethereum',
    isAlert: false,
  },
  {
    id: '7',
    txHash: '0xf6a9d3c2e8b5f1a4d7c9e6b2f8a5d1c3e9b4f7a2d6c8e5b9f1a3d7c4e8b2f5',
    fromAddress: '0xf6a9d3c2e8b5f1a4d7c9e6b2f8a5d1c3',
    toAddress: '0xe9b4f7a2d6c8e5b9f1a3d7c4e8b2f5a9',
    value: '234,567.89',
    valueUsd: 6789012,
    cryptocurrency: 'BASE',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    blockchain: 'base',
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

