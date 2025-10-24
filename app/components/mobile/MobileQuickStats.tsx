
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface QuickStat {
  id: string
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: 'trending' | 'activity' | 'dollar' | 'users' | 'zap'
  gradient: string
}

export function MobileQuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/market', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success' && data.data) {
            const btc = data.data.find((c: any) => c.symbol === 'BTC')
            const eth = data.data.find((c: any) => c.symbol === 'ETH')
            
            // Calculate total market cap
            const totalMarketCap = data.data.reduce((sum: number, crypto: any) => 
              sum + (crypto.marketCap || 0), 0
            )
            
            // Calculate average change
            const avgChange = data.data.reduce((sum: number, crypto: any) => 
              sum + (crypto.changePercent24h || 0), 0
            ) / data.data.length

            setStats([
              {
                id: '1',
                label: 'BTC Price',
                value: formatCurrency(btc?.price || 0),
                change: formatPercent(btc?.changePercent24h || 0),
                isPositive: (btc?.changePercent24h || 0) > 0,
                icon: 'trending',
                gradient: 'from-orange-500/20 to-yellow-500/20'
              },
              {
                id: '2',
                label: 'ETH Price',
                value: formatCurrency(eth?.price || 0),
                change: formatPercent(eth?.changePercent24h || 0),
                isPositive: (eth?.changePercent24h || 0) > 0,
                icon: 'activity',
                gradient: 'from-blue-500/20 to-purple-500/20'
              },
              {
                id: '3',
                label: 'Total Market Cap',
                value: `${(totalMarketCap / 1e12).toFixed(2)}T`,
                change: formatPercent(avgChange),
                isPositive: avgChange > 0,
                icon: 'dollar',
                gradient: 'from-green-500/20 to-emerald-500/20'
              },
              {
                id: '4',
                label: 'Active Traders',
                value: '847K',
                change: '+12.4%',
                isPositive: true,
                icon: 'users',
                gradient: 'from-pink-500/20 to-rose-500/20'
              },
              {
                id: '5',
                label: '24h Volume',
                value: `${((data.data[0]?.volume24h || 0) / 1e9).toFixed(2)}B`,
                change: '+8.7%',
                isPositive: true,
                icon: 'zap',
                gradient: 'from-cyan-500/20 to-teal-500/20'
              }
            ])
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error('Stats fetch error:', err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'trending':
        return TrendingUp
      case 'activity':
        return Activity
      case 'dollar':
        return DollarSign
      case 'users':
        return Users
      case 'zap':
        return Zap
      default:
        return TrendingUp
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-2"></div>
            <div className="h-6 bg-muted rounded w-20 mb-1"></div>
            <div className="h-3 bg-muted rounded w-12"></div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      {/* Horizontal scroll for first 3 stats */}
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide snap-x-scroll pb-2 mb-3 -mx-4 px-4">
        {stats.slice(0, 3).map((stat, index) => {
          const Icon = getIcon(stat.icon)
          
          return (
            <Card 
              key={stat.id}
              className={`flex-shrink-0 w-[160px] snap-center p-4 bg-gradient-to-br ${stat.gradient} border-border/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 touch-manipulation`}
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <div className={`flex items-center space-x-1 text-xs font-medium ${
                  stat.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Grid for remaining stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.slice(3).map((stat, index) => {
          const Icon = getIcon(stat.icon)
          
          return (
            <Card 
              key={stat.id}
              className={`p-4 bg-gradient-to-br ${stat.gradient} border-border/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 touch-manipulation`}
              style={{
                animation: `slideIn 0.5s ease-out ${(index + 3) * 0.1}s both`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <div className={`flex items-center space-x-1 text-xs font-medium ${
                  stat.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
