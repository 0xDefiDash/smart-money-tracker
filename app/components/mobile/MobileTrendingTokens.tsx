
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, Flame, Star, Zap } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import Image from 'next/image'

interface TrendingToken {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  rank: number
}

export function MobileTrendingTokens() {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/market', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success' && data.data) {
            // Sort by 24h change percentage (highest gainers)
            const sorted = [...data.data]
              .sort((a, b) => b.changePercent24h - a.changePercent24h)
              .slice(0, 5)
            
            setTokens(sorted)
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error('Trending fetch error:', err)
      }
    }

    fetchTrending()
    const interval = setInterval(fetchTrending, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <div className="flex items-center space-x-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <h2 className="text-lg font-bold">Trending Now</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
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
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <h2 className="text-lg font-bold">Trending Now</h2>
        </div>
        <span className="text-xs text-muted-foreground">Top Gainers 24h</span>
      </div>

      <div className="space-y-3">
        {tokens.map((token, index) => {
          const isPositive = token.changePercent24h > 0
          
          return (
            <Card 
              key={token.id}
              className="p-4 bg-gradient-to-r from-card to-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 touch-manipulation hover:scale-[1.02] active:scale-[0.98]"
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index === 0 && <Star className="w-4 h-4" />}
                    {index === 1 && <Star className="w-4 h-4" />}
                    {index === 2 && <Star className="w-4 h-4" />}
                    {index > 2 && `#${index + 1}`}
                  </div>

                  {/* Token Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-foreground">{token.symbol}</p>
                      {index < 3 && (
                        <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </div>

                {/* Price and Change */}
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatCurrency(token.price)}</p>
                  <div className={`flex items-center justify-end space-x-1 text-sm font-medium ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} />
                    <span>{formatPercent(token.changePercent24h)}</span>
                  </div>
                </div>
              </div>

              {/* Volume Bar */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>24h Volume</span>
                  <span className="font-medium">{formatCurrency(token.volume24h)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isPositive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    style={{
                      width: `${Math.min((token.volume24h / tokens[0].volume24h) * 100, 100)}%`,
                      animation: 'growBar 1s ease-out'
                    }}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes growBar {
          from {
            width: 0;
          }
        }
      `}</style>
    </div>
  )
}
