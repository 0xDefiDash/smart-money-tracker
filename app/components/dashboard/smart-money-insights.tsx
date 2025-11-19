
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, TrendingDown, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface SmartMoneyNetflow {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  netflow: number
  inflow: number
  outflow: number
  smartMoneyCount: number
  signal: 'STRONG_BUY' | 'MODERATE_BUY' | 'NEUTRAL' | 'MODERATE_SELL' | 'STRONG_SELL'
}

export function SmartMoneyInsights() {
  const router = useRouter()
  const [topNetflows, setTopNetflows] = useState<SmartMoneyNetflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSmartMoneyData()
  }, [])

  const fetchSmartMoneyData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/nansen/smart-money?action=netflows&chain=ethereum&timeframe=24h&limit=5')
      
      if (!response.ok) {
        throw new Error('Failed to fetch Smart Money data')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setTopNetflows(result.data)
      } else {
        throw new Error(result.error || 'Invalid response format')
      }
    } catch (err: any) {
      console.error('[Smart Money Insights] Error:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'MODERATE_BUY':
        return 'bg-green-500/10 text-green-300 border-green-500/20'
      case 'MODERATE_SELL':
        return 'bg-red-500/10 text-red-300 border-red-500/20'
      case 'STRONG_SELL':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/10 text-gray-300 border-gray-500/20'
    }
  }

  const getSignalIcon = (signal: string) => {
    if (signal.includes('BUY')) {
      return <TrendingUp className="w-3 h-3" />
    } else if (signal.includes('SELL')) {
      return <TrendingDown className="w-3 h-3" />
    }
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
      <CardHeader className="border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Smart Money Insights
              </CardTitle>
              <p className="text-xs text-muted-foreground">Top 5,000 performing wallets</p>
            </div>
          </div>
          <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Sparkles className="w-3 h-3 mr-1" />
            Nansen
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={fetchSmartMoneyData}
              className="border-primary/30 hover:bg-primary/10"
            >
              Try Again
            </Button>
          </div>
        ) : topNetflows.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No Smart Money activity detected
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-300 mb-1">Total Accumulation</div>
                <div className="text-lg font-bold text-green-400">
                  {formatCurrency(
                    topNetflows
                      .filter(t => t.netflow > 0)
                      .reduce((sum, t) => sum + t.netflow, 0)
                  )}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-lg border border-red-500/20">
                <div className="text-xs text-red-300 mb-1">Total Distribution</div>
                <div className="text-lg font-bold text-red-400">
                  {formatCurrency(
                    Math.abs(
                      topNetflows
                        .filter(t => t.netflow < 0)
                        .reduce((sum, t) => sum + t.netflow, 0)
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Top Netflows List */}
            <div className="space-y-2">
              {topNetflows.map((token, idx) => (
                <div
                  key={token.tokenAddress}
                  className="p-3 bg-card/50 rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push('/smart-money-tracker')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {token.tokenSymbol}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getSignalColor(token.signal)} flex items-center space-x-1`}
                          >
                            {getSignalIcon(token.signal)}
                            <span>{token.signal.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{token.tokenName}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${token.netflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.netflow >= 0 ? '+' : ''}{formatCurrency(token.netflow)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {token.smartMoneyCount} wallets
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <Button
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              onClick={() => router.push('/smart-money-tracker')}
            >
              <Brain className="w-4 h-4 mr-2" />
              View Full Smart Money Tracker
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
