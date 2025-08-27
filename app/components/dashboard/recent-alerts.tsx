
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Bell, AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getTimeAgo } from '@/lib/utils'

// Mock alerts data with deterministic timestamps
const baseTimestamp = new Date('2025-08-27T15:30:00Z').getTime();
const mockAlerts = [
  {
    id: '1',
    type: 'whale_transaction',
    title: 'Large BTC Transfer Detected',
    message: 'Transaction worth $2.45M detected from unknown wallet',
    amount: 2450000,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 900000), // 15 minutes ago
    severity: 'high',
    isRead: false,
  },
  {
    id: '2',
    type: 'exchange_flow',
    title: 'Coinbase Large Outflow',
    message: 'Significant ETH outflow detected from Coinbase Pro',
    amount: 3325000,
    cryptocurrency: 'ETH',
    timestamp: new Date(baseTimestamp - 1800000), // 30 minutes ago
    severity: 'medium',
    isRead: false,
  },
  {
    id: '3',
    type: 'wallet_activity',
    title: 'Whale Wallet Movement',
    message: 'Known whale wallet showing unusual activity patterns',
    amount: 1850000,
    cryptocurrency: 'SOL',
    timestamp: new Date(baseTimestamp - 3600000), // 1 hour ago
    severity: 'medium',
    isRead: true,
  },
  {
    id: '4',
    type: 'market_movement',
    title: 'Institutional Purchase Alert',
    message: 'Large institutional purchase detected via OTC desk',
    amount: 5200000,
    cryptocurrency: 'BTC',
    timestamp: new Date(baseTimestamp - 5400000), // 1.5 hours ago
    severity: 'high',
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
