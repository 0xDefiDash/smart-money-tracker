

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  ExternalLink,
  Zap,
  Target,
  Clock,
  Wifi,
  WifiOff,
  Rocket,
  Star,
  Eye,
  AlertTriangle,
  TrendingDown,
  Volume2,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface BonkFunToken {
  tokenAddress: string
  name: string
  symbol: string
  logo: string | null
  decimals: number
  price: number
  priceUsd: number
  marketCap: number
  volume24h: number
  liquidity: number
  holders: number
  change1h: number
  change24h: number
  change7d: number
  isVerified: boolean
  isNew: boolean
  isTrending: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  lastUpdate: string
  website?: string
  twitter?: string
  telegram?: string
  description?: string
}

interface StreamData {
  type: 'price_update' | 'new_token' | 'volume_alert' | 'trend_change'
  data: Partial<BonkFunToken>
  timestamp: string
}

interface WebSocketStatus {
  connected: boolean
  lastPing: Date | null
  reconnectAttempts: number
}

export default function BonkFunPage() {
  const [tokens, setTokens] = useState<BonkFunToken[]>([])
  const [filteredTokens, setFilteredTokens] = useState<BonkFunToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('marketCap')
  const [filterBy, setFilterBy] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>({
    connected: false,
    lastPing: null,
    reconnectAttempts: 0
  })
  const [recentUpdates, setRecentUpdates] = useState<StreamData[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [stats, setStats] = useState({
    totalTokens: 0,
    newToday: 0,
    trending: 0,
    totalVolume: 0,
    totalMarketCap: 0,
    avgChange24h: 0,
  })

  // WebSocket connection and management
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket('wss://stream.pumpapi.io/')
      
      ws.onopen = () => {
        console.log('WebSocket connected to Bonk.fun stream')
        setWsStatus(prev => ({
          ...prev,
          connected: true,
          reconnectAttempts: 0
        }))
        
        // Subscribe to relevant channels
        ws.send(JSON.stringify({
          action: 'subscribe',
          channels: ['price_updates', 'new_tokens', 'volume_alerts', 'trending']
        }))
      }

      ws.onmessage = (event) => {
        try {
          const streamData: StreamData = JSON.parse(event.data)
          setRecentUpdates(prev => [streamData, ...prev.slice(0, 99)]) // Keep last 100 updates
          
          // Update ping status
          setWsStatus(prev => ({
            ...prev,
            lastPing: new Date()
          }))

          // Process different types of updates
          if (streamData.type === 'price_update' && streamData.data.tokenAddress) {
            setTokens(prev => prev.map(token => 
              token.tokenAddress === streamData.data.tokenAddress 
                ? { ...token, ...streamData.data, lastUpdate: streamData.timestamp }
                : token
            ))
          } else if (streamData.type === 'new_token' && streamData.data) {
            const newToken = streamData.data as BonkFunToken
            setTokens(prev => [newToken, ...prev])
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setWsStatus(prev => ({ ...prev, connected: false }))
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setWsStatus(prev => ({ 
          ...prev, 
          connected: false,
          reconnectAttempts: prev.reconnectAttempts + 1
        }))
        
        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, wsStatus.reconnectAttempts), 30000)
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay)
      }

      wsRef.current = ws
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err)
      setWsStatus(prev => ({ ...prev, connected: false }))
    }
  }, [wsStatus.reconnectAttempts])

  // Initial data fetch
  const fetchInitialData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)
      
      const response = await fetch('/api/bonkfun')
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bonk.fun tokens')
      }
      
      const data = await response.json()
      setTokens(data.tokens || [])
      
      // Calculate stats
      const totalTokens = data.tokens?.length || 0
      const newToday = data.tokens?.filter((t: BonkFunToken) => t.isNew).length || 0
      const trending = data.tokens?.filter((t: BonkFunToken) => t.isTrending).length || 0
      const totalVolume = data.tokens?.reduce((sum: number, t: BonkFunToken) => sum + (t.volume24h || 0), 0) || 0
      const totalMarketCap = data.tokens?.reduce((sum: number, t: BonkFunToken) => sum + (t.marketCap || 0), 0) || 0
      const avgChange24h = totalTokens > 0 
        ? (data.tokens?.reduce((sum: number, t: BonkFunToken) => sum + (t.change24h || 0), 0) || 0) / totalTokens 
        : 0
      
      setStats({
        totalTokens,
        newToday,
        trending,
        totalVolume,
        totalMarketCap,
        avgChange24h,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  // Filter and sort tokens
  useEffect(() => {
    let filtered = tokens.filter(token => {
      const matchesSearch = token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTab = activeTab === 'all' ? true :
        activeTab === 'new' ? token.isNew :
        activeTab === 'trending' ? token.isTrending :
        activeTab === 'verified' ? token.isVerified :
        activeTab === 'high-risk' ? token.riskLevel === 'HIGH' :
        true

      const matchesFilter = filterBy === 'all' ? true :
        filterBy === 'low-risk' ? token.riskLevel === 'LOW' :
        filterBy === 'medium-risk' ? token.riskLevel === 'MEDIUM' :
        filterBy === 'high-risk' ? token.riskLevel === 'HIGH' :
        filterBy === 'gainers' ? token.change24h > 0 :
        filterBy === 'losers' ? token.change24h < 0 :
        true
      
      return matchesSearch && matchesTab && matchesFilter
    })

    // Sort tokens
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'marketCap':
          return (b.marketCap || 0) - (a.marketCap || 0)
        case 'volume24h':
          return (b.volume24h || 0) - (a.volume24h || 0)
        case 'change24h':
          return (b.change24h || 0) - (a.change24h || 0)
        case 'price':
          return (b.priceUsd || 0) - (a.priceUsd || 0)
        case 'holders':
          return (b.holders || 0) - (a.holders || 0)
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredTokens(filtered)
  }, [tokens, searchTerm, sortBy, filterBy, activeTab])

  // Initialize connection and data
  useEffect(() => {
    fetchInitialData()
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  // Utility functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const formatVolume = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(0)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bonk.fun Tracker</h1>
            <p className="text-muted-foreground">Real-time token feeds and new launches</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading Bonk.fun tokens...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bonk.fun Tracker</h1>
            <p className="text-muted-foreground">Real-time token feeds and new launches</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Failed to Load Data</h3>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchInitialData(true)} disabled={refreshing}>
              {refreshing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with WebSocket Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonk.fun Tracker</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">Real-time token feeds and new launches</p>
            <div className={`flex items-center text-sm ${wsStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
              {wsStatus.connected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {wsStatus.connected ? 'Live Stream Connected' : 'Stream Disconnected'}
            </div>
          </div>
        </div>
        <Button 
          onClick={() => fetchInitialData(true)} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">{stats.totalTokens}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.newToday}</p>
              </div>
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.trending}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalVolume)}</p>
              </div>
              <Volume2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalMarketCap)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg 24h Change</p>
                <p className={`text-2xl font-bold ${getChangeColor(stats.avgChange24h)}`}>
                  {stats.avgChange24h > 0 ? '+' : ''}{stats.avgChange24h.toFixed(2)}%
                </p>
              </div>
              {stats.avgChange24h > 0 ? 
                <ArrowUp className="w-8 h-8 text-green-500" /> : 
                <ArrowDown className="w-8 h-8 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Tokens</TabsTrigger>
          <TabsTrigger value="new">New Launches</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketCap">Market Cap</SelectItem>
                <SelectItem value="volume24h">24h Volume</SelectItem>
                <SelectItem value="change24h">24h Change</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="holders">Holders</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tokens</SelectItem>
                <SelectItem value="gainers">Top Gainers</SelectItem>
                <SelectItem value="losers">Top Losers</SelectItem>
                <SelectItem value="low-risk">Low Risk</SelectItem>
                <SelectItem value="medium-risk">Medium Risk</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tokens Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <Card key={token.tokenAddress} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {token.logo ? (
                        <div className="relative w-12 h-12 bg-muted rounded-full overflow-hidden">
                          <Image
                            src={token.logo}
                            alt={token.name || 'Token'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(token.symbol || token.name || '?')[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm truncate max-w-32">
                            {token.name || 'Unknown Token'}
                          </h3>
                          {token.isVerified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-mono">
                          {token.symbol || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      {token.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Rocket className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {token.isTrending && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <Badge variant="secondary" className={`text-xs ${getRiskColor(token.riskLevel)}`}>
                        {token.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Price Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Price</p>
                      <p className="font-mono font-medium">${token.priceUsd.toFixed(8)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">24h Change</p>
                      <div className="flex items-center">
                        {token.change24h > 0 ? 
                          <ArrowUp className="w-3 h-3 text-green-500 mr-1" /> : 
                          <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                        }
                        <p className={`font-medium ${getChangeColor(token.change24h)}`}>
                          {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Market Data */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Market Cap</p>
                      <p className="font-medium">{formatNumber(token.marketCap)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">24h Volume</p>
                      <p className="font-medium">{formatVolume(token.volume24h)}</p>
                    </div>
                  </div>

                  {/* Additional Data */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Liquidity</p>
                      <p className="font-medium">{formatNumber(token.liquidity)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Holders</p>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-muted-foreground" />
                        <p className="font-medium">{token.holders.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creation Time */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created {formatDistanceToNow(new Date(token.createdAt))} ago
                  </div>

                  {/* Description */}
                  {token.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {token.description}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`https://solscan.io/token/${token.tokenAddress}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Explorer
                    </Button>
                    {token.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(token.website, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </Button>
                    )}
                    {token.twitter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(token.twitter, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTokens.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
                <p className="text-muted-foreground">
                  No tokens match your current search and filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
