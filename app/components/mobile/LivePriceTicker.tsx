
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface TickerItem {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
}

export function LivePriceTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const response = await fetch('/api/market', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success' && data.data) {
            setTickerData(data.data.slice(0, 10))
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error('Ticker fetch error:', err)
      }
    }

    fetchTickerData()
    const interval = setInterval(fetchTickerData, 30000) // Update every 30s
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="overflow-hidden bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border-y border-border">
        <div className="flex items-center space-x-6 py-3 px-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>
    )
  }

  // Duplicate array for seamless infinite scroll
  const duplicatedData = [...tickerData, ...tickerData, ...tickerData]

  return (
    <div className="overflow-hidden bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border-y border-border relative">
      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-500/30">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-green-500">LIVE</span>
      </div>
      
      <div className="ticker-scroll flex items-center space-x-8 py-3 pl-24 pr-4">
        {duplicatedData.map((item, index) => {
          const isPositive = item.changePercent24h > 0
          
          return (
            <div 
              key={`${item.symbol}-${index}`}
              className="flex items-center space-x-3 whitespace-nowrap"
            >
              <span className="font-bold text-sm text-foreground">{item.symbol}</span>
              <span className="text-sm text-foreground font-medium">
                {formatCurrency(item.price)}
              </span>
              <span className={`flex items-center space-x-1 text-xs font-medium ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{formatPercent(item.changePercent24h)}</span>
              </span>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .ticker-scroll {
          animation: scroll 45s linear infinite;
        }

        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
