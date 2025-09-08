
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Bell, AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getTimeAgo } from '@/lib/utils'

// Mock alerts data with current timestamps for September 8, 2025
const baseTimestamp = new Date('2025-09-08T14:30:00Z').getTime();
const mockAlerts = [
  {
    id: '1',
    type: 'whale_transaction',
    title: 'Massive SOL Whale Movement',
    message: 'Transaction worth $12.89M detected from institutional wallet',
    amount: 12890450,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 300000), // 5 minutes ago
    severity: 'high',
    isRead: false,
  },
  {
    id: '2',
    type: 'exchange_flow',
    title: 'Binance Institutional Outflow',
    message: 'Major ETH outflow detected - $10.46M to cold storage',
    amount: 10456780,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 600000), // 10 minutes ago
    severity: 'high',
    isRead: false,
  },
  {
    id: '3',
    type: 'wallet_activity',
    title: 'Bitcoin Whale Accumulation',
    message: 'Massive BTC transfer between top institutional wallets',
    amount: 8945670,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 900000), // 15 minutes ago
    severity: 'high',
    isRead: false,
  },
  {
    id: '4',
    type: 'institutional_activity',
    title: 'Avalanche DeFi Protocol Buy',
    message: 'Large AVAX purchase for DeFi protocol treasury',
    amount: 7234590,
    cryptocurrency: 'AVAX',
    timestamp: new Date(baseTimestamp - 1500000), // 25 minutes ago
    severity: 'high',
    isRead: false,
  },
  {
    id: '5',
    type: 'defi_activity',
    title: 'WBTC Liquidity Migration',
    message: 'Significant WBTC movement to Uniswap V3 pool',
    amount: 6789320,
    cryptocurrency: 'WBTC',
    timestamp: new Date(baseTimestamp - 2100000), // 35 minutes ago
    severity: 'medium',
    isRead: false,
  },
  {
    id: '6',
    type: 'market_movement',
    title: 'Stablecoin Institutional Mint',
    message: 'Circle minting $4.57M USDC for corporate treasury',
    amount: 4567890,
    cryptocurrency: 'USDC',
    timestamp: new Date(baseTimestamp - 2700000), // 45 minutes ago
    severity: 'medium',
    isRead: true,
  },
  {
    id: '7',
    type: 'layer2_activity',
    title: 'Polygon Enterprise Activity',
    message: 'Large MATIC transfer for enterprise partnership',
    amount: 3456890,
    cryptocurrency: 'MATIC',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    severity: 'medium',
    isRead: true,
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20'
    case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20'
    default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high': return AlertTriangle
    case 'medium': return Bell
    case 'low': return CheckCircle
    default: return Bell
  }
}

export function RecentAlerts() {
  const unreadCount = mockAlerts.filter(alert => !alert.isRead).length

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span>Recent Alerts</span>
        </CardTitle>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
            {unreadCount} New
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {mockAlerts.map((alert, index) => {
            const SeverityIcon = getSeverityIcon(alert.severity)
            
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                  !alert.isRead 
                    ? 'border-primary/20 bg-primary/5' 
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <SeverityIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {alert.title}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2">
                        {getTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.cryptocurrency}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(alert.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All Alerts →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
