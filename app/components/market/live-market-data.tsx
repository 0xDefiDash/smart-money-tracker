
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'
import Image from 'next/image'

interface CryptoData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  marketCap: number
  volume24h: number
  rank: number
  image?: string
}

export function LiveMarketData() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch market data from API
  const fetchMarketData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/market', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'success' && data.data) {
        setCryptoData(data.data.slice(0, 20)) // Show top 20 cryptos
        setIsLoading(false)
      } else {
        throw new Error(data.error || 'Failed to fetch market data')
      }
    } catch (err) {
      console.error('Error fetching market data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }, [])

  // Initial data fetch and periodic updates
  useEffect(() => {
    fetchMarketData() // Initial fetch
    
    // Update time display
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    
    updateTime()
    
    // Set up intervals
    const timeInterval = setInterval(updateTime, 1000) // Update time every second
    const dataInterval = setInterval(fetchMarketData, 15000) // Fetch data every 15 seconds for faster updates
    
    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [fetchMarketData])

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Live Market Data</span>
          </h2>
          <div className="flex items-center space-x-2">
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading live market data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">Error loading data: {error}</p>
            <button
              onClick={fetchMarketData}
              className="text-xs text-destructive hover:text-destructive/80 underline mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {/* Market Data */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-3">
                {cryptoData.map((crypto, index) => {
                  const isPositive = crypto.changePercent24h > 0
                
                return (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-muted-foreground w-6">
                          #{crypto.rank}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {crypto.symbol.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">
                              {crypto.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {crypto.symbol}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-8 flex-1 text-right">
                      {/* Price */}
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(crypto.price)}
                        </p>
                      </div>

                      {/* 24h Change */}
                      <div>
                        <div className={`flex items-center justify-end space-x-1 ${getChangeColor(crypto.changePercent24h)}`}>
                          {isPositive ? (
                            <ArrowUpIcon className="w-3 h-3" />
                          ) : (
                            <ArrowDownIcon className="w-3 h-3" />
                          )}
                          <span className="font-medium">
                            {formatPercent(crypto.changePercent24h)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(crypto.change24h)}
                        </p>
                      </div>

                      {/* Market Cap */}
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(crypto.marketCap)}
                        </p>
                        <p className="text-xs text-muted-foreground">Market Cap</p>
                      </div>

                      {/* Volume */}
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(crypto.volume24h)}
                        </p>
                        <p className="text-xs text-muted-foreground">Volume 24h</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Global Market Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Total Market Cap</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(cryptoData.reduce((sum, crypto) => sum + crypto.marketCap, 0))}
              </p>
              <p className="text-xs text-green-500">
                +{formatPercent(cryptoData.reduce((sum, crypto) => sum + crypto.changePercent24h, 0) / cryptoData.length)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">24h Volume</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(cryptoData.reduce((sum, crypto) => sum + crypto.volume24h, 0))}
              </p>
              <p className="text-xs text-muted-foreground">24h</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">₿</span>
                </span>
                <span className="text-sm font-medium">BTC Dominance</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {(() => {
                  const btc = cryptoData.find(c => c.symbol === 'BTC')
                  const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.marketCap, 0)
                  const dominance = btc && totalMarketCap > 0 ? (btc.marketCap / totalMarketCap) * 100 : 0
                  return `${dominance.toFixed(1)}%`
                })()}
              </p>
              <p className="text-xs text-green-500">
                +{(() => {
                  const btc = cryptoData.find(c => c.symbol === 'BTC')
                  return btc ? formatPercent(btc.changePercent24h * 0.1) : '0%'
                })()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">Ξ</span>
                </span>
                <span className="text-sm font-medium">ETH Dominance</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {(() => {
                  const eth = cryptoData.find(c => c.symbol === 'ETH')
                  const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.marketCap, 0)
                  const dominance = eth && totalMarketCap > 0 ? (eth.marketCap / totalMarketCap) * 100 : 0
                  return `${dominance.toFixed(1)}%`
                })()}
              </p>
              <p className="text-xs text-green-500">
                +{(() => {
                  const eth = cryptoData.find(c => c.symbol === 'ETH')
                  return eth ? formatPercent(eth.changePercent24h * 0.05) : '0%'
                })()}
              </p>
            </div>
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
