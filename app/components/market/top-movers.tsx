
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, Zap } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'

// Current market data with October 8, 2025 prices
const topGainers = [
  { symbol: 'BNB', name: 'BNB', price: 1274.99, change: 3.85, volume: 10433000157 },
  { symbol: 'LTC', name: 'Litecoin', price: 117.02, change: -0.97, volume: 712579851 },
  { symbol: 'BTC', name: 'Bitcoin', price: 121470, change: -2.27, volume: 77457181529 },
  { symbol: 'XRP', name: 'XRP', price: 2.85, change: -4.56, volume: 7181503772 },
  { symbol: 'ATOM', name: 'Cosmos', price: 4.03, change: -4.86, volume: 142141870 },
]

const topLosers = [
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.244979, change: -7.99, volume: 3892232080 },
  { symbol: 'AVAX', name: 'Avalanche', price: 28.01, change: -7.66, volume: 1121049189 },
  { symbol: 'UNI', name: 'Uniswap', price: 7.74, change: -7.05, volume: 414251170 },
  { symbol: 'LINK', name: 'Chainlink', price: 21.78, change: -6.77, volume: 1249934980 },
  { symbol: 'ADA', name: 'Cardano', price: 0.815063, change: -6.19, volume: 1880332688 },
]

const volumeLeaders = [
  { symbol: 'BTC', name: 'Bitcoin', price: 121470, change: -2.27, volume: 77457181529 },
  { symbol: 'ETH', name: 'Ethereum', price: 4442.52, change: -5.21, volume: 51552953255 },
  { symbol: 'BNB', name: 'BNB', price: 1274.99, change: 3.85, volume: 10433000157 },
  { symbol: 'SOL', name: 'Solana', price: 219.25, change: -6.02, volume: 9672562305 },
  { symbol: 'XRP', name: 'XRP', price: 2.85, change: -4.56, volume: 7181503772 },
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
