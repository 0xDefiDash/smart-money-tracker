
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ExternalLink, ArrowRightIcon, RefreshCw } from 'lucide-react'
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Enhanced whale transaction data for September 20, 2025
const getCurrentTimestamp = () => new Date().getTime();

const generateWhaleTransactions = () => {
  const baseTimestamp = getCurrentTimestamp();
  
  return [
    {
      id: '1',
      txHash: '0xa7f9d3e2c8b5f1a6d4c9e7b2f5d8b1a6e3c9f5d2b8e4a7f1d6c3b9e2f5a8d4c7',
      fromAddress: '0xa7f9d3e2c8b5f1a6d4c9e7b2f5d8b1a6',
      toAddress: '0xe3c9f5d2b8e4a7f1d6c3b9e2f5a8d4c7',
      value: '1,245.67',
      valueUsd: 79076510,
      cryptocurrency: 'BTC',
      timestamp: new Date(baseTimestamp - 120000), // 2 minutes ago
      blockchain: 'bitcoin',
      isAlert: true,
      type: 'large_transfer'
    },
    {
      id: '2',
      txHash: '0xc2f8d5a1c7e4b9f3a6d2c8e5b1f7a4d9c6e3b8f2a5d1c9e4b7f3a6d8c2e5b9a1',
      fromAddress: '0xc2f8d5a1c7e4b9f3a6d2c8e5b1f7a4d9',
      toAddress: '0xc6e3b8f2a5d1c9e4b7f3a6d8c2e5b9a1',
      value: '14,567.89',
      valueUsd: 36192510,
      cryptocurrency: 'ETH',
      timestamp: new Date(baseTimestamp - 360000), // 6 minutes ago
      blockchain: 'ethereum',
      isAlert: true,
      type: 'exchange_deposit'
    },
    {
      id: '3',
      txHash: '0xe7c3e9b5f1a8d4c2e6b3f9a2d5c7e1b4f8a6d9c3e2b5f7a1d4c8e6b3f9a2d5c1',
      fromAddress: '0xe7c3e9b5f1a8d4c2e6b3f9a2d5c7e1b4',
      toAddress: '0xf8a6d9c3e2b5f7a1d4c8e6b3f9a2d5c1',
      value: '398,450.23',
      valueUsd: 58094840,
      cryptocurrency: 'SOL',
      timestamp: new Date(baseTimestamp - 720000), // 12 minutes ago
      blockchain: 'solana',
      isAlert: true,
      type: 'whale_accumulation'
    },
    {
      id: '4',
      txHash: '0xb5c8e2b6f9d1a4c7e3b8f5a2d9c6e1b4f7a3d8c2e5b9f6a1d4c7e2b8f5a9d6c3',
      fromAddress: '0xb5c8e2b6f9d1a4c7e3b8f5a2d9c6e1b4',
      toAddress: '0xf7a3d8c2e5b9f6a1d4c7e2b8f5a9d6c3',
      value: '2,890,000',
      valueUsd: 16888400,
      cryptocurrency: 'TON',
      timestamp: new Date(baseTimestamp - 960000), // 16 minutes ago
      blockchain: 'ton',
      isAlert: true,
      type: 'institutional_movement'
    },
    {
      id: '5',
      txHash: '0xf3b9f6a2d5c8e1b4f7a9d3c6e2b8f5a1d9c4e7b3f6a8d2c5e1b9f4a7d6c3e8b5',
      fromAddress: '0xf3b9f6a2d5c8e1b4f7a9d3c6e2b8f5a1',
      toAddress: '0xd9c4e7b3f6a8d2c5e1b9f4a7d6c3e8b5',
      value: '356.78',
      valueUsd: 22687720,
      cryptocurrency: 'WBTC',
      timestamp: new Date(baseTimestamp - 1380000), // 23 minutes ago
      blockchain: 'ethereum',
      isAlert: true,
      type: 'cross_chain_bridge'
    },
    {
      id: '6',
      txHash: '0xd4e7b1f8a5d9c2e6b3f1a7d4c8e5b9f2a6d3c7e1b4f8a2d5c9e6b3f7a1d4c8e5',
      fromAddress: '0xd4e7b1f8a5d9c2e6b3f1a7d4c8e5b9f2',
      toAddress: '0xa6d3c7e1b4f8a2d5c9e6b3f7a1d4c8e5',
      value: '18,900,000',
      valueUsd: 18900000,
      cryptocurrency: 'USDC',
      timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
      blockchain: 'ethereum',
      isAlert: true,
      type: 'stablecoin_movement'
    },
    {
      id: '7',
      txHash: '0xa6a9d3c2e8b5f1a4d7c9e6b2f8a5d1c3e9b4f7a2d6c8e5b9f1a3d7c4e8b2f5a9',
      fromAddress: '0xa6a9d3c2e8b5f1a4d7c9e6b2f8a5d1c3',
      toAddress: '0xe9b4f7a2d6c8e5b9f1a3d7c4e8b2f5a9',
      value: '1,234,567.89',
      valueUsd: 2195870,
      cryptocurrency: 'SUI',
      timestamp: new Date(baseTimestamp - 2580000), // 43 minutes ago
      blockchain: 'sui',
      isAlert: false,
      type: 'defi_interaction'
    },
    {
      id: '8',
      txHash: '0x8c4e9b7d1a5f2e8b6c3f7a9d4e2b8c5f1a7e3b9d6c2f8a4e7b1d5c9f3a6e8b2',
      fromAddress: '0x8c4e9b7d1a5f2e8b6c3f7a9d4e2b8c5',
      toAddress: '0xf1a7e3b9d6c2f8a4e7b1d5c9f3a6e8b2',
      value: '789,012.34',
      valueUsd: 20870830,
      cryptocurrency: 'AVAX',
      timestamp: new Date(baseTimestamp - 3000000), // 50 minutes ago
      blockchain: 'avalanche',
      isAlert: false,
      type: 'validator_stake'
    },
    {
      id: '9',
      txHash: '0x7f2d8a5b9e3c6f1a4d7b8e2c5f9a3d6e1b4f7a8c2e5b9f3d6a1c4e7b8f2a5d9',
      fromAddress: '0x7f2d8a5b9e3c6f1a4d7b8e2c5f9a3d6',
      toAddress: '0xe1b4f7a8c2e5b9f3d6a1c4e7b8f2a5d9',
      value: '45,678,901.23',
      valueUsd: 16695750,
      cryptocurrency: 'ADA',
      timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
      blockchain: 'cardano',
      isAlert: false,
      type: 'pool_delegation'
    }
  ];
};

export function WhaleActivity() {
  const [whaleTransactions, setWhaleTransactions] = useState(generateWhaleTransactions());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial lastUpdate on client
    setLastUpdate(new Date());
    
    // Update transactions every 2 minutes to simulate real-time data
    const interval = setInterval(() => {
      setWhaleTransactions(generateWhaleTransactions());
      setLastUpdate(new Date());
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWhaleTransactions(generateWhaleTransactions());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const alertCount = whaleTransactions.filter(tx => tx.isAlert).length;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Whale Activity</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            {alertCount} Active Alerts
          </Badge>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {whaleTransactions.map((tx, index) => (
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
                  <span className="text-xs text-muted-foreground capitalize">
                    {tx.blockchain}
                  </span>
                  {tx.isAlert && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                      Alert
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {tx.type?.replace('_', ' ').toUpperCase()}
                  </Badge>
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
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Last Updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}</span>
            <span>Real-time monitoring active</span>
          </div>
          <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All Whale Transactions →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
