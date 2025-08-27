
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'
import Image from 'next/image'

// Mock live market data
const mockMarketData = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 42650.50,
    change24h: 2.45,
    changePercent24h: 2.45,
    marketCap: 836000000000,
    volume24h: 28500000000,
    rank: 1,
    image: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2590.75,
    change24h: -32.15,
    changePercent24h: -1.23,
    marketCap: 311000000000,
    volume24h: 12300000000,
    rank: 2,
    image: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    price: 315.20,
    change24h: 7.85,
    changePercent24h: 2.56,
    marketCap: 47500000000,
    volume24h: 1200000000,
    rank: 3,
    image: 'https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png',
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 98.45,
    change24h: 5.67,
    changePercent24h: 6.11,
    marketCap: 42800000000,
    volume24h: 2100000000,
    rank: 4,
    image: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.525,
    change24h: -0.015,
    changePercent24h: -2.78,
    marketCap: 18500000000,
    volume24h: 890000000,
    rank: 5,
    image: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png',
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 36.25,
    change24h: 1.45,
    changePercent24h: 4.17,
    marketCap: 14200000000,
    volume24h: 456000000,
    rank: 6,
    image: 'https://assets.coingecko.com/coins/images/12559/thumb/coin-round-red.png',
  },
]

export function LiveMarketData() {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Top Cryptocurrencies</span>
          </h2>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-1 gap-3">
              {mockMarketData.map((crypto, index) => {
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
        </div>

        {/* Global Market Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Total Market Cap</span>
            </div>
            <p className="text-xl font-bold text-foreground">$2.45T</p>
            <p className="text-xs text-green-500">+2.34%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">24h Volume</span>
            </div>
            <p className="text-xl font-bold text-foreground">$89.5B</p>
            <p className="text-xs text-red-500">-5.67%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">₿</span>
              </span>
              <span className="text-sm font-medium">BTC Dominance</span>
            </div>
            <p className="text-xl font-bold text-foreground">52.3%</p>
            <p className="text-xs text-muted-foreground">+0.8%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">Ξ</span>
              </span>
              <span className="text-sm font-medium">ETH Dominance</span>
            </div>
            <p className="text-xl font-bold text-foreground">17.2%</p>
            <p className="text-xs text-muted-foreground">-0.3%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
