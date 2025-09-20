
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendingToken {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  image: string
  market_cap_rank: number
}

export function RollingBanner() {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await fetch('/api/trending-tokens', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending tokens')
        }
        
        const result = await response.json()
        
        if (result.data) {
          setTokens(result.data)
          setError(null)
          // Log if we're using fallback data but don't treat as error
          if (result.fallback) {
            console.info('Using fallback trending tokens data:', result.message)
          }
        } else {
          throw new Error(result.error || 'Invalid response format')
        }
      } catch (err) {
        console.error('Error fetching trending tokens:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchTrendingTokens()

    // Refresh every 2 minutes
    const interval = setInterval(fetchTrendingTokens, 120000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    } else if (price < 1) {
      return `$${price.toFixed(4)}`
    } else if (price < 100) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`
    } else {
      return `$${(volume / 1e3).toFixed(1)}K`
    }
  }

  if (loading) {
    return (
      <div className="bg-muted/30 border-b border-border">
        <div className="overflow-hidden py-2">
          <div className="animate-pulse flex space-x-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2 whitespace-nowrap">
                <div className="w-4 h-4 bg-muted rounded-full" />
                <div className="w-12 h-4 bg-muted rounded" />
                <div className="w-16 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || tokens.length === 0) {
    return (
      <div className="bg-muted/30 border-b border-border">
        <div className="py-2 px-4 text-center">
          <span className="text-sm text-muted-foreground">
            Unable to load trending tokens
          </span>
        </div>
      </div>
    )
  }

  // Duplicate tokens array for seamless infinite scroll
  const duplicatedTokens = [...tokens, ...tokens]

  return (
    <div className="bg-gradient-to-r from-background via-muted/20 to-background border-b border-border overflow-hidden">
      <div className="py-2.5 whitespace-nowrap">
        <div className="animate-scroll-horizontal flex space-x-8 will-change-transform">
          {duplicatedTokens.map((token, index) => {
            const isPositive = token.price_change_percentage_24h >= 0
            
            return (
              <div
                key={`${token.id}-${index}`}
                className="flex items-center space-x-3 px-2 hover:bg-accent/50 rounded-md transition-colors duration-200 cursor-pointer group"
              >
                {/* Token Symbol */}
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {token.symbol.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {token.symbol}
                  </span>
                </div>

                {/* Price */}
                <span className="text-sm font-medium text-foreground">
                  {formatPrice(token.current_price)}
                </span>

                {/* Price Change */}
                <div className={cn(
                  "flex items-center space-x-1 text-xs font-medium px-1.5 py-0.5 rounded",
                  isPositive 
                    ? "text-green-600 bg-green-100/50 dark:text-green-400 dark:bg-green-900/20" 
                    : "text-red-600 bg-red-100/50 dark:text-red-400 dark:bg-red-900/20"
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}{token.price_change_percentage_24h.toFixed(1)}%
                  </span>
                </div>

                {/* Volume */}
                <div className="text-xs text-muted-foreground">
                  Vol: {formatVolume(token.total_volume)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
