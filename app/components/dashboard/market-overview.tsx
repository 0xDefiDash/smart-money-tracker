
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

// Mock market data with current August 2025 prices
const mockMarketData = [
  { time: '00:00', btc: 110500, eth: 4580, total: 2.45 },
  { time: '04:00', btc: 110850, eth: 4620, total: 2.47 },
  { time: '08:00', btc: 110200, eth: 4540, total: 2.43 },
  { time: '12:00', btc: 111200, eth: 4640, total: 2.49 },
  { time: '16:00', btc: 111600, eth: 4680, total: 2.52 },
  { time: '20:00', btc: 111400, eth: 4660, total: 2.51 },
  { time: '24:00', btc: 111915, eth: 4654, total: 2.53 },
]

const topCryptos = [
  { symbol: 'BTC', name: 'Bitcoin', price: 111915, change: 2.06, volume: 36186852922 },
  { symbol: 'ETH', name: 'Ethereum', price: 4654, change: 2.95, volume: 35700514440 },
  { symbol: 'XRP', name: 'XRP', price: 3.01, change: 2.86, volume: 6166406385 },
  { symbol: 'BNB', name: 'BNB', price: 595, change: 1.9, volume: 2100000000 },
  { symbol: 'SOL', name: 'Solana', price: 158, change: 5.2, volume: 4200000000 },
]

export function MarketOverview() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    
    updateTime() // Initial update
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

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
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockMarketData}>
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
                        <p className="text-sm font-medium">{`${label}:00`}</p>
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
            {topCryptos.map((crypto, index) => {
              const isPositive = crypto.change > 0
              
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
                      <span>{formatPercent(crypto.change)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
