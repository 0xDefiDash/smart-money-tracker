
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  ExternalLink,
  RefreshCw,
  BarChart3,
  Coins,
  Search,
  Filter,
  ArrowUpDown,
  Percent
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
  category?: string
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
  change_1m?: number
}

export default function YieldsPage() {
  const [poolsData, setPoolsData] = useState<any>({})
  const [protocolsData, setProtocolsData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChain, setSelectedChain] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'name'>('apy')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      
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
        throw new Error('Failed to fetch yield data')
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

      setLastUpdated(new Date().toLocaleString())
      setIsLoading(false)

    } catch (err) {
      console.error('Error fetching yield data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Filter and sort pools
  const getFilteredAndSortedPools = (): YieldPool[] => {
    if (!poolsData.topPools || !Array.isArray(poolsData.topPools)) return []
    
    const typedPools = poolsData.topPools as YieldPool[]
    let filtered = typedPools.filter((pool: YieldPool) => {
      const matchesSearch = pool.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pool.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pool.chain.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesChain = selectedChain === 'all' || pool.chain === selectedChain
      const matchesCategory = selectedCategory === 'all' || 
                             pool.poolMeta?.toLowerCase().includes(selectedCategory) ||
                             pool.project.toLowerCase().includes(selectedCategory)
      
      return matchesSearch && matchesChain && matchesCategory
    })

    filtered.sort((a: YieldPool, b: YieldPool) => {
      const aVal = sortBy === 'apy' ? a.apy : sortBy === 'tvl' ? a.tvlUsd : a.project
      const bVal = sortBy === 'apy' ? b.apy : sortBy === 'tvl' ? b.tvlUsd : b.project
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      
      return sortOrder === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number)
    })

    return filtered
  }

  // Get unique chains for filter
  const getAvailableChains = (): string[] => {
    if (!poolsData.topPools || !Array.isArray(poolsData.topPools)) return []
    const typedPools = poolsData.topPools as YieldPool[]
    const chains = Array.from(new Set(typedPools.map((p: YieldPool) => p.chain).filter(Boolean)))
    return chains.sort()
  }

  if (isLoading && !poolsData.summary) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Loading Yield Data...</p>
            <p className="text-sm text-muted-foreground">Fetching latest APY and protocol information</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !poolsData.summary) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Failed to Load Yield Data</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchData} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Percent className="w-8 h-8 text-primary" />
            <span>Yield & APR Tracker</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track the highest yielding DeFi opportunities across all protocols
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={fetchData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              Last updated: {lastUpdated}
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {poolsData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Highest APY</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPercent(poolsData.summary.maxAPY)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average APY</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPercent(poolsData.summary.averageAPY)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total TVL</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(poolsData.summary.totalTVL)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Pools</p>
                  <p className="text-2xl font-bold text-foreground">
                    {poolsData.summary.totalPools}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by protocol, token, or chain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Chains</option>
                {getAvailableChains().map((chain: string) => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Categories</option>
                <option value="lending">Lending</option>
                <option value="dex">DEX</option>
                <option value="staking">Staking</option>
                <option value="derivatives">Derivatives</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="pools" className="w-full">
        <TabsList>
          <TabsTrigger value="pools">Yield Pools</TabsTrigger>
          <TabsTrigger value="protocols">Top Protocols</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>High-Yield Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredAndSortedPools().map((pool: YieldPool, index: number) => (
                  <div
                    key={pool.pool}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-mono text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">
                            {pool.project}
                          </h3>
                          <Badge variant="outline">{pool.symbol}</Badge>
                          <Badge variant="secondary">{pool.chain}</Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            TVL: {formatCurrency(pool.tvlUsd)}
                          </span>
                          {pool.poolMeta && (
                            <Badge variant="outline" className="text-xs">
                              {pool.poolMeta}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-green-500">
                        {formatPercent(pool.apy)}
                      </div>
                      
                      {pool.apyBase && pool.apyReward && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Base: {formatPercent(pool.apyBase)} + 
                          Rewards: {formatPercent(pool.apyReward)}
                        </div>
                      )}
                      
                      {pool.rewardTokens && pool.rewardTokens.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {pool.rewardTokens.map(token => (
                            <Badge key={token} variant="outline" className="text-xs">
                              {token}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {pool.url && (
                      <a
                        href={pool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 rounded-full hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Protocol Rankings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {protocolsData.topProtocols?.slice(0, 15).map((protocol: Protocol, index: number) => (
                  <div
                    key={protocol.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-mono text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">
                            {protocol.name}
                          </h3>
                          {protocol.symbol && (
                            <Badge variant="outline">{protocol.symbol}</Badge>
                          )}
                          <Badge variant="secondary">{protocol.category}</Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1">
                          {protocol.chains?.slice(0, 3).join(', ')}
                          {protocol.chains?.length > 3 && ` +${protocol.chains.length - 3} more`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        {formatCurrency(protocol.tvl)}
                      </div>
                      
                      {protocol.change_1d && (
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${
                          protocol.change_1d > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {protocol.change_1d > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {formatPercent(Math.abs(protocol.change_1d))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chain Distribution */}
            {poolsData.summary?.topChains && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Chains by TVL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {poolsData.summary.topChains.map((chain: any, index: number) => (
                      <div key={`${chain.name}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-medium">{chain.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(chain.totalTVL)}</div>
                          <div className="text-sm text-muted-foreground">{chain.count} pools</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Movers */}
            {protocolsData.summary?.marketMovers && (
              <Card>
                <CardHeader>
                  <CardTitle>24h Market Movers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-500 mb-2">Top Gainers</h4>
                      {protocolsData.summary.marketMovers.gainers?.slice(0, 3).map((protocol: Protocol, index: number) => (
                        <div key={`${protocol.id}-gainer-${index}`} className="flex items-center justify-between py-2">
                          <span className="text-sm">{protocol.name}</span>
                          <div className="flex items-center space-x-1 text-green-500">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-sm font-medium">
                              +{formatPercent(protocol.change_1d || 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-red-500 mb-2">Top Losers</h4>
                      {protocolsData.summary.marketMovers.losers?.slice(0, 3).map((protocol: Protocol, index: number) => (
                        <div key={`${protocol.id}-loser-${index}`} className="flex items-center justify-between py-2">
                          <span className="text-sm">{protocol.name}</span>
                          <div className="flex items-center space-x-1 text-red-500">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-sm font-medium">
                              {formatPercent(protocol.change_1d || 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
