
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, Zap } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'

// Current market data with September 24, 2025 prices
const topGainers = [
  { symbol: 'BNB', name: 'BNB', price: 1002.14, change: 2.13, volume: 2956351116 },
  { symbol: 'USDC', name: 'USDC', price: 0.9997, change: -0.001, volume: 9504798023 },
  { symbol: 'XRP', name: 'XRP', price: 2.81, change: -1.42, volume: 5209407199 },
  { symbol: 'LINK', name: 'Chainlink', price: 21.21, change: -1.34, volume: 784885948 },
  { symbol: 'TETHER', name: 'Tether', price: 1.000, change: -0.05, volume: 97274819129 },
]

const topLosers = [
  { symbol: 'SOL', name: 'Solana', price: 206.37, change: -4.49, volume: 6491536237 },
  { symbol: 'AVAX', name: 'Avalanche', price: 33.32, change: -3.92, volume: 1745972080 },
  { symbol: 'ADA', name: 'Cardano', price: 0.798089, change: -2.70, volume: 1429660809 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.234053, change: -2.56, volume: 2716430172 },
  { symbol: 'SUI', name: 'Sui', price: 3.28, change: -2.42, volume: 1050212609 },
]

const volumeLeaders = [
  { symbol: 'USDT', name: 'Tether', price: 1.000, change: -0.05, volume: 97274819129 },
  { symbol: 'BTC', name: 'Bitcoin', price: 111438, change: -0.69, volume: 43118128985 },
  { symbol: 'ETH', name: 'Ethereum', price: 4101.94, change: -1.79, volume: 28252237841 },
  { symbol: 'USDC', name: 'USDC', price: 0.9997, change: -0.001, volume: 9504798023 },
  { symbol: 'SOL', name: 'Solana', price: 206.37, change: -4.49, volume: 6491536237 },
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
