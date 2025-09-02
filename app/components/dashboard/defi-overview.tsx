
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  ExternalLink,
  RefreshCw,
  BarChart3,
  Coins
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface YieldPool {
  pool: string
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase?: number
  apyReward?: number
  rewardTokens?: string[]
  url?: string
  poolMeta?: string
}

interface Protocol {
  id: string
  name: string
  symbol?: string
  category: string
  chains: string[]
  tvl: number
  change_1d?: number
  change_7d?: number
}

interface DefiData {
  pools?: {
    lending: YieldPool[]
    dex: YieldPool[]
    staking: YieldPool[]
    other: YieldPool[]
  }
  protocols?: {
    lending: Protocol[]
    dexes: Protocol[]
    derivatives: Protocol[]
    'liquid-staking': Protocol[]
    other: Protocol[]
  }
  summary?: any
  topPools?: YieldPool[]
  topProtocols?: Protocol[]
}

export function DeFiOverview() {
  const [poolsData, setPoolsData] = useState<DefiData>({})
  const [protocolsData, setProtocolsData] = useState<DefiData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('--:--:--')

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch both yield pools and protocols data
      const [poolsResponse, protocolsResponse] = await Promise.all([
        fetch('/api/defillama/pools', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/defillama/protocols', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ])

      if (!poolsResponse.ok || !protocolsResponse.ok) {
        throw new Error('Failed to fetch DeFi data')
      }

      const [poolsResult, protocolsResult] = await Promise.all([
        poolsResponse.json(),
        protocolsResponse.json()
      ])

      if (poolsResult.status === 'success') {
        setPoolsData(poolsResult.data)
      }

      if (protocolsResult.status === 'success') {
        setProtocolsData(protocolsResult.data)
      }

      setIsLoading(false)
      setLastUpdated(new Date().toLocaleTimeString())

    } catch (err) {
      console.error('Error fetching DeFi data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [fetchData])

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 py-8">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading DeFi data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardContent className="p-6">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">Error: {error}</p>
            <button
              onClick={fetchData}
              className="text-xs text-destructive hover:text-destructive/80 underline mt-1"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Coins className="w-5 h-5 text-primary" />
          <span>DeFi Overview</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {poolsData.summary && (
            <>
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Best APY</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPercent(poolsData.summary.maxAPY)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatPercent(poolsData.summary.averageAPY)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Total Yield TVL</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(poolsData.summary.totalTVL)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {poolsData.summary.totalPools} pools
                </p>
              </div>
            </>
          )}
          {protocolsData.summary && (
            <div className="p-4 rounded-lg bg-muted/20">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Total Protocol TVL</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(protocolsData.summary.totalTVL)}
              </p>
              <p className="text-xs text-muted-foreground">
                {protocolsData.summary.totalProtocols} protocols
              </p>
            </div>
          )}
        </div>

        {/* Tabs for different data views */}
        <Tabs defaultValue="yields" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="yields">Top Yields</TabsTrigger>
            <TabsTrigger value="protocols">Top Protocols</TabsTrigger>
            <TabsTrigger value="movers">Market Movers</TabsTrigger>
          </TabsList>

          <TabsContent value="yields" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">High Yield Opportunities</h4>
              {poolsData.topPools?.slice(0, 8).map((pool, index) => (
                <div
                  key={pool.pool}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xs font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm text-foreground">
                          {pool.project} {pool.symbol}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {pool.chain}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        TVL: {formatCurrency(pool.tvlUsd)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-500">
                      {formatPercent(pool.apy)} APY
                    </p>
                    {pool.apyBase && pool.apyReward && (
                      <p className="text-xs text-muted-foreground">
                        Base: {formatPercent(pool.apyBase)} + Rewards: {formatPercent(pool.apyReward)}
                      </p>
                    )}
                  </div>
                  
                  {pool.url && (
                    <a
                      href={pool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Top Protocols by TVL</h4>
              {protocolsData.topProtocols?.slice(0, 8).map((protocol, index) => (
                <div
                  key={protocol.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xs font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm text-foreground">
                          {protocol.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {protocol.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {protocol.chains?.slice(0, 3).join(', ')}
                        {protocol.chains?.length > 3 && ` +${protocol.chains.length - 3} more`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-sm text-foreground">
                      {formatCurrency(protocol.tvl)}
                    </p>
                    {protocol.change_1d && (
                      <div className={`flex items-center space-x-1 text-xs ${
                        protocol.change_1d > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {protocol.change_1d > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{formatPercent(Math.abs(protocol.change_1d))}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="movers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Gainers */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-green-500 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Top Gainers (24h)</span>
                </h4>
                {protocolsData.summary?.marketMovers?.gainers?.map((protocol: Protocol, index: number) => (
                  <div
                    key={protocol.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">{protocol.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(protocol.tvl)}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-500">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          {formatPercent(protocol.change_1d || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Losers */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-red-500 flex items-center space-x-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>Top Losers (24h)</span>
                </h4>
                {protocolsData.summary?.marketMovers?.losers?.map((protocol: Protocol, index: number) => (
                  <div
                    key={protocol.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">{protocol.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(protocol.tvl)}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-red-500">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          {formatPercent(Math.abs(protocol.change_1d || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
