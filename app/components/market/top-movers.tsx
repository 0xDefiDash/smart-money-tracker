
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, Zap } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'

// Mock top movers data with current September 24, 2025 prices
const topGainers = [
  { symbol: 'SUI', name: 'Sui', price: 1.95, change: 8.9, volume: 520000000 },
  { symbol: 'LINK', name: 'Chainlink', price: 12.45, change: 6.2, volume: 620000000 },
  { symbol: 'TON', name: 'Toncoin', price: 6.12, change: 5.6, volume: 320000000 },
  { symbol: 'SOL', name: 'Solana', price: 152.30, change: 4.7, volume: 3200000000 },
  { symbol: 'AVAX', name: 'Avalanche', price: 28.75, change: 3.8, volume: 398000000 },
]

const topLosers = [
  { symbol: 'LTC', name: 'Litecoin', price: 71.85, change: -3.2, volume: 380000000 },
  { symbol: 'BCH', name: 'Bitcoin Cash', price: 345.20, change: -2.8, volume: 245000000 },
  { symbol: 'ETC', name: 'Ethereum Classic', price: 24.15, change: -2.1, volume: 125000000 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.098, change: -1.8, volume: 890000000 },
  { symbol: 'XLM', name: 'Stellar', price: 0.102, change: -1.5, volume: 145000000 },
]

const volumeLeaders = [
  { symbol: 'BTC', name: 'Bitcoin', price: 66750, change: 2.8, volume: 28900000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 2650, change: 1.9, volume: 15200000000 },
  { symbol: 'USDT', name: 'Tether', price: 1.000, change: -0.01, volume: 45000000000 },
  { symbol: 'SOL', name: 'Solana', price: 152.30, change: 4.7, volume: 3200000000 },
  { symbol: 'BNB', name: 'BNB', price: 610, change: 1.8, volume: 2100000000 },
]

export function TopMovers() {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span>Market Movers</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Top Gainers */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-green-500 flex items-center space-x-1">
            <ArrowUpIcon className="w-3 h-3" />
            <span>Top Gainers</span>
          </h3>
          <div className="space-y-2">
            {topGainers.map((crypto, index) => (
              <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
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
                  <p className="text-xs text-green-500 font-medium">
                    +{crypto.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-red-500 flex items-center space-x-1">
            <ArrowDownIcon className="w-3 h-3" />
            <span>Top Losers</span>
          </h3>
          <div className="space-y-2">
            {topLosers.map((crypto, index) => (
              <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
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
                  <p className="text-xs text-red-500 font-medium">
                    {crypto.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Leaders */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-primary flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Volume Leaders</span>
          </h3>
          <div className="space-y-2">
            {volumeLeaders.map((crypto, index) => (
              <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{crypto.symbol}</p>
                    <p className="text-xs text-muted-foreground">{crypto.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-foreground">
                    {formatCurrency(crypto.volume)}
                  </p>
                  <p className={`text-xs font-medium ${getChangeColor(crypto.change)}`}>
                    {formatPercent(crypto.change)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
