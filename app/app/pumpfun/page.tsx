
'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import Image from 'next/image'

interface PumpFunToken {
  tokenAddress: string
  name: string
  symbol: string
  logo: string | null
  decimals: string
  priceNative: string
  priceUsd: string
  liquidity: string
  fullyDilutedValuation: string
  bondingCurveProgress: number
  progressColor: string
  isNearGraduation: boolean
  formattedLiquidity: string
  formattedFDV: string
  priceUsdFormatted: string
  bondingProgressFormatted: string
}

interface PumpFunResponse {
  result: PumpFunToken[]
  cursor?: string
}

export default function PumpFunPage() {
  const [tokens, setTokens] = useState<PumpFunToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('progress')
  const [filterBy, setFilterBy] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalTokens: 0,
    nearGraduation: 0,
    avgProgress: 0,
    totalLiquidity: 0,
  })

  const fetchTokens = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)
      
      const response = await fetch('/api/pumpfun?limit=100')
      
      if (!response.ok) {
        throw new Error('Failed to fetch pump.fun tokens')
      }
      
      const data: PumpFunResponse = await response.json()
      setTokens(data.result || [])
      
      // Calculate stats
      const totalTokens = data.result?.length || 0
      const nearGraduation = data.result?.filter(t => t.isNearGraduation).length || 0
      const avgProgress = totalTokens > 0 
        ? (data.result?.reduce((sum, t) => sum + t.bondingCurveProgress, 0) || 0) / totalTokens 
        : 0
      const totalLiquidity = data.result?.reduce((sum, t) => sum + parseFloat(t.liquidity || '0'), 0) || 0
      
      setStats({
        totalTokens,
        nearGraduation,
        avgProgress,
        totalLiquidity,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTokens()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTokens(false)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredTokens = tokens
    .filter(token => {
      const matchesSearch = token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterBy === 'all' ? true :
        filterBy === 'near-graduation' ? token.isNearGraduation :
        filterBy === 'early-stage' ? token.bondingCurveProgress < 30 :
        filterBy === 'mid-stage' ? token.bondingCurveProgress >= 30 && token.bondingCurveProgress < 70 :
        filterBy === 'late-stage' ? token.bondingCurveProgress >= 70 && token.bondingCurveProgress < 90 :
        true
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.bondingCurveProgress - a.bondingCurveProgress
        case 'liquidity':
          return parseFloat(b.liquidity || '0') - parseFloat(a.liquidity || '0')
        case 'price':
          return parseFloat(b.priceUsd || '0') - parseFloat(a.priceUsd || '0')
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pump.fun Tracker</h1>
            <p className="text-muted-foreground">Track bonding curve tokens on Pump.fun</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
          <p>Loading pump.fun tokens...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pump.fun Tracker</h1>
            <p className="text-muted-foreground">Track bonding curve tokens on Pump.fun</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Failed to Load Data</h3>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchTokens(true)} disabled={refreshing}>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pump.fun Tracker</h1>
          <p className="text-muted-foreground">Track bonding curve tokens on Pump.fun</p>
        </div>
        <Button 
          onClick={() => fetchTokens(true)} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">Near Graduation</p>
                <p className="text-2xl font-bold text-green-600">{stats.nearGraduation}</p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Liquidity</p>
                <p className="text-2xl font-bold">${(stats.totalLiquidity / 1000000).toFixed(2)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
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
            <SelectItem value="progress">Progress %</SelectItem>
            <SelectItem value="liquidity">Liquidity</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="early-stage">Early Stage (&lt; 30%)</SelectItem>
            <SelectItem value="mid-stage">Mid Stage (30-70%)</SelectItem>
            <SelectItem value="late-stage">Late Stage (70-90%)</SelectItem>
            <SelectItem value="near-graduation">Near Graduation (&gt; 90%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tokens Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTokens.map((token) => (
          <Card key={token.tokenAddress} className="group hover:shadow-lg transition-shadow">
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(token.symbol || token.name || '?')[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm truncate max-w-32">
                      {token.name || 'Unknown Token'}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase font-mono">
                      {token.symbol || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {token.isNearGraduation && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Near Grad
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Price USD</p>
                  <p className="font-mono font-medium">${token.priceUsdFormatted}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Price SOL</p>
                  <p className="font-mono font-medium">{parseFloat(token.priceNative || '0').toFixed(9)}</p>
                </div>
              </div>
              
              {/* Liquidity and FDV */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Liquidity</p>
                  <p className="font-medium">{token.formattedLiquidity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Market Cap</p>
                  <p className="font-medium">{token.formattedFDV}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Bonding Progress</span>
                  <span className="font-medium">{token.bondingProgressFormatted}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(token.bondingCurveProgress, 100)}%`,
                      backgroundColor: token.progressColor
                    }}
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`https://solscan.io/token/${token.tokenAddress}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Solscan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`https://pump.fun/${token.tokenAddress}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Pump.fun
                </Button>
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
    </div>
  )
}
