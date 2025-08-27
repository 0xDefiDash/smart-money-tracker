
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, Zap } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'

// Mock top movers data
const topGainers = [
  { symbol: 'AVAX', name: 'Avalanche', price: 36.25, change: 15.67, volume: 456000000 },
  { symbol: 'SOL', name: 'Solana', price: 98.45, change: 12.45, volume: 2100000000 },
  { symbol: 'MATIC', name: 'Polygon', price: 0.87, change: 8.23, volume: 234000000 },
  { symbol: 'DOT', name: 'Polkadot', price: 7.45, change: 7.89, volume: 123000000 },
  { symbol: 'LINK', name: 'Chainlink', price: 14.67, change: 6.12, volume: 567000000 },
]

const topLosers = [
  { symbol: 'ADA', name: 'Cardano', price: 0.525, change: -8.45, volume: 890000000 },
  { symbol: 'XRP', name: 'XRP', price: 0.612, change: -6.78, volume: 1200000000 },
  { symbol: 'LTC', name: 'Litecoin', price: 72.34, change: -5.23, volume: 345000000 },
  { symbol: 'BCH', name: 'Bitcoin Cash', price: 245.67, change: -4.56, volume: 189000000 },
  { symbol: 'ETC', name: 'Ethereum Classic', price: 20.45, change: -3.89, volume: 78000000 },
]

const volumeLeaders = [
  { symbol: 'BTC', name: 'Bitcoin', price: 42650, change: 2.45, volume: 28500000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 2590, change: -1.23, volume: 12300000000 },
  { symbol: 'SOL', name: 'Solana', price: 98.45, change: 12.45, volume: 2100000000 },
  { symbol: 'XRP', name: 'XRP', price: 0.612, change: -6.78, volume: 1200000000 },
  { symbol: 'BNB', name: 'BNB', price: 315.20, change: 2.56, volume: 1200000000 },
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
