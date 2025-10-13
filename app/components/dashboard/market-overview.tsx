
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ArrowUpIcon, ArrowDownIcon, RefreshCw } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

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

interface MarketDataPoint {
  time: string
  btc: number
  eth: number
  total: number
  timestamp: number
}

export function MarketOverview() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [marketChartData, setMarketChartData] = useState<MarketDataPoint[]>([])
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
        setCryptoData(data.data.slice(0, 5)) // Top 5 cryptos
        
        // Update chart data with current prices
        const currentTime = new Date()
        const timeString = currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })
        
        const btcData = data.data.find((c: any) => c.symbol === 'BTC')
        const ethData = data.data.find((c: any) => c.symbol === 'ETH')
        
        if (btcData && ethData) {
          const newDataPoint: MarketDataPoint = {
            time: timeString,
            btc: btcData.price,
            eth: ethData.price,
            total: data.data.reduce((sum: number, crypto: any) => sum + (crypto.marketCap || 0), 0) / 1e12, // Convert to trillions
            timestamp: currentTime.getTime()
          }
          
          setMarketChartData(prevData => {
            const newData = [...prevData, newDataPoint]
            // Keep only last 24 data points (roughly 2 hours if updated every 5 minutes)
            return newData.slice(-24)
          })
        }
        
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

  // Initialize chart data with some initial points
  useEffect(() => {
    const initializeChartData = () => {
      const now = new Date()
      const initialData: MarketDataPoint[] = []
      
      // Create initial data points for the last 2 hours
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 5 * 60 * 1000)) // 5 minute intervals
        const timeString = time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })
        
        // Updated price data for October 13, 2025
        const btcBase = 115440  // Current BTC price 
        const ethBase = 4164.35   // Current ETH price
        const variation = (Math.random() - 0.5) * 0.015 // ±1.5% variation
        
        initialData.push({
          time: timeString,
          btc: btcBase * (1 + variation),
          eth: ethBase * (1 + variation),
          total: 3.82 * (1 + variation * 0.4), // Updated total market cap in trillions
          timestamp: time.getTime()
        })
      }
      
      setMarketChartData(initialData)
    }
    
    initializeChartData()
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
    const dataInterval = setInterval(fetchMarketData, 30000) // Fetch data every 30 seconds
    
    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [fetchMarketData])

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Market Overview</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Loading/Error States */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 py-8">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading market data...</span>
          </div>
        )}
        
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

        {!isLoading && !error && (
          <>
            {/* Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketChartData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm text-primary">
                              Market Cap: {formatCurrency((payload[0]?.value as number) * 1000000000000 || 0)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#60B5FF"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#60B5FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Cryptocurrencies */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Top Cryptocurrencies</h3>
              <div className="space-y-2">
                {cryptoData.map((crypto, index) => {
                  const isPositive = crypto.changePercent24h > 0
                  
                  return (
                    <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{crypto.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{crypto.symbol}</p>
                          <p className="text-xs text-muted-foreground">{crypto.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-sm text-foreground">
                          {formatCurrency(crypto.price)}
                        </p>
                        <div className={`flex items-center space-x-1 text-xs ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPositive ? (
                            <ArrowUpIcon className="w-3 h-3" />
                          ) : (
                            <ArrowDownIcon className="w-3 h-3" />
                          )}
                          <span>{formatPercent(crypto.changePercent24h)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
