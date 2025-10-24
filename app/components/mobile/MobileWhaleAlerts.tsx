
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Activity, TrendingUp, TrendingDown, AlertCircle, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface WhaleAlert {
  id: string
  type: 'buy' | 'sell' | 'transfer'
  token: string
  amount: number
  usdValue: number
  from: string
  to: string
  timestamp: Date
  txHash: string
}

export function MobileWhaleAlerts() {
  const [alerts, setAlerts] = useState<WhaleAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock whale alert data - in production, this would come from real-time API
    const mockAlerts: WhaleAlert[] = [
      {
        id: '1',
        type: 'buy',
        token: 'BTC',
        amount: 127.5,
        usdValue: 16301437,
        from: 'Binance',
        to: '0x742d...89f3',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        txHash: '0xabc123...'
      },
      {
        id: '2',
        type: 'sell',
        token: 'ETH',
        amount: 3420,
        usdValue: 16384050,
        from: '0x951c...4f2a',
        to: 'Coinbase',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        txHash: '0xdef456...'
      },
      {
        id: '3',
        type: 'transfer',
        token: 'USDT',
        amount: 25000000,
        usdValue: 25000000,
        from: '0x84ac...7d2b',
        to: '0x392f...1c8e',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        txHash: '0xghi789...'
      },
      {
        id: '4',
        type: 'buy',
        token: 'SOL',
        amount: 48000,
        usdValue: 9216000,
        from: 'Kraken',
        to: '0x6f3a...2d9c',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        txHash: '0xjkl012...'
      }
    ]

    setAlerts(mockAlerts)
    setIsLoading(false)

    // Simulate new alerts every 30 seconds
    const interval = setInterval(() => {
      const newAlert: WhaleAlert = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        token: ['BTC', 'ETH', 'SOL', 'USDT'][Math.floor(Math.random() * 4)],
        amount: Math.random() * 1000,
        usdValue: Math.random() * 50000000,
        from: Math.random() > 0.5 ? 'Exchange' : '0x' + Math.random().toString(36).substring(7),
        to: Math.random() > 0.5 ? 'Exchange' : '0x' + Math.random().toString(36).substring(7),
        timestamp: new Date(),
        txHash: '0x' + Math.random().toString(36).substring(7)
      }

      setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'transfer':
        return <Activity className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'sell':
        return 'from-red-500/20 to-rose-500/20 border-red-500/30'
      case 'transfer':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      default:
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const formatAddress = (address: string) => {
    if (address.startsWith('0x') && address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address
  }

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold">Whale Alerts</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold">Whale Alerts</h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-primary/20 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-medium text-primary">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <Card
            key={alert.id}
            className={`p-4 bg-gradient-to-r ${getTypeColor(alert.type)} backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 touch-manipulation`}
            style={{
              animation: `slideInFromRight 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getTypeIcon(alert.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">{alert.token}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      alert.type === 'buy' ? 'bg-green-500/20 text-green-500' :
                      alert.type === 'sell' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {getTypeLabel(alert.type)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getTimeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-foreground">
                  {formatCurrency(alert.usdValue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alert.amount.toLocaleString()} {alert.token}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/50">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">From</p>
                  <p className="font-medium text-foreground">{formatAddress(alert.from)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">To</p>
                  <p className="font-medium text-foreground">{formatAddress(alert.to)}</p>
                </div>
              </div>

              <button className="mt-3 w-full flex items-center justify-center space-x-2 text-xs text-primary hover:text-primary/80 transition-colors">
                <span>View Transaction</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      <Card className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50 transition-colors cursor-pointer touch-manipulation">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">View All Whale Activity</p>
            <p className="text-xs text-muted-foreground mt-1">Track all whale transactions</p>
          </div>
          <ExternalLink className="w-5 h-5 text-primary" />
        </div>
      </Card>
    </div>
  )
}
