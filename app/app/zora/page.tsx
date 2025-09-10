
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Activity,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ZoraToken {
  contractAddress: string
  tokenId?: string
  name?: string
  symbol?: string
  totalSupply?: string
  creator?: string
  createdAt?: string
  volume24h?: string
  price?: string
  marketCap?: string
  holders?: number
}

interface ZoraResponse {
  success: boolean
  tokens: ZoraToken[]
  totalTokens: number
  timestamp: string
  error?: string
}

export default function ZoraPage() {
  const [tokens, setTokens] = useState<ZoraToken[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'volume' | 'marketCap' | 'holders' | 'created'>('volume')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchZoraTokens = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/zora?limit=50')
      const data: ZoraResponse = await response.json()
      
      if (data.success) {
        setTokens(data.tokens)
        setLastUpdated(new Date(data.timestamp))
      } else {
        console.error('Failed to fetch ZORA tokens:', data.error)
        setTokens(data.tokens || []) // Use fallback data if available
      }
    } catch (error) {
      console.error('Error fetching ZORA tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZoraTokens()
    // Refresh every 30 seconds
    const interval = setInterval(fetchZoraTokens, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredTokens = tokens.filter(token =>
    token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.contractAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0')
      case 'marketCap':
        return parseFloat(b.marketCap || '0') - parseFloat(a.marketCap || '0')
      case 'holders':
        return (b.holders || 0) - (a.holders || 0)
      case 'created':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      default:
        return 0
    }
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const totalVolume = tokens.reduce((sum, token) => sum + parseFloat(token.volume24h || '0'), 0)
  const totalMarketCap = tokens.reduce((sum, token) => sum + parseFloat(token.marketCap || '0'), 0)
  const totalHolders = tokens.reduce((sum, token) => sum + (token.holders || 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">ZORA Token Tracker</h1>
              <p className="text-muted-foreground">Track newly created ZORA tokens and volume</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdated)} ago
              </span>
            )}
            <Button onClick={fetchZoraTokens} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{tokens.length}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">{totalVolume.toFixed(2)} ETH</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-2xl font-bold">{(totalMarketCap / 1000).toFixed(0)}K ETH</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Holders</p>
                  <p className="text-2xl font-bold">{totalHolders.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tokens by name, symbol, or contract address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'volume' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('volume')}
          >
            Volume
          </Button>
          <Button
            variant={sortBy === 'marketCap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('marketCap')}
          >
            Market Cap
          </Button>
          <Button
            variant={sortBy === 'holders' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('holders')}
          >
            Holders
          </Button>
          <Button
            variant={sortBy === 'created' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('created')}
          >
            Latest
          </Button>
        </div>
      </div>

      {/* Token List */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-8 bg-muted rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTokens.map((token) => (
                <Card key={token.contractAddress} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{token.name}</CardTitle>
                      <Badge variant="secondary">{token.symbol}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <span>{formatAddress(token.contractAddress)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(token.contractAddress)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="text-lg font-semibold text-green-600">
                          {parseFloat(token.volume24h || '0').toFixed(2)} ETH
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Floor Price</p>
                        <p className="text-lg font-semibold">
                          {parseFloat(token.price || '0').toFixed(4)} ETH
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Supply</p>
                        <p className="text-sm font-medium">{token.totalSupply}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Holders</p>
                        <p className="text-sm font-medium">{token.holders?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {token.createdAt ? formatDistanceToNow(new Date(token.createdAt)) : 'Unknown'} ago
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(`https://zora.co/collect/zora:${token.contractAddress}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on ZORA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Token</th>
                      <th className="text-left p-4 font-medium">Contract</th>
                      <th className="text-left p-4 font-medium">24h Volume</th>
                      <th className="text-left p-4 font-medium">Floor Price</th>
                      <th className="text-left p-4 font-medium">Market Cap</th>
                      <th className="text-left p-4 font-medium">Holders</th>
                      <th className="text-left p-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded"></div>
                              <div className="space-y-1">
                                <div className="h-4 bg-muted rounded w-24"></div>
                                <div className="h-3 bg-muted rounded w-16"></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4"><div className="h-4 bg-muted rounded w-20"></div></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded w-20"></div></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded w-12"></div></td>
                          <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                        </tr>
                      ))
                    ) : (
                      sortedTokens.map((token) => (
                        <tr key={token.contractAddress} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center">
                                <Globe className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{token.name}</p>
                                <p className="text-sm text-muted-foreground">{token.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm">{formatAddress(token.contractAddress)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(token.contractAddress)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-green-600 font-medium">
                              {parseFloat(token.volume24h || '0').toFixed(2)} ETH
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">
                              {parseFloat(token.price || '0').toFixed(4)} ETH
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">
                              {(parseFloat(token.marketCap || '0') / 1000).toFixed(0)}K ETH
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{token.holders?.toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {token.createdAt ? formatDistanceToNow(new Date(token.createdAt)) : 'Unknown'} ago
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!loading && sortedTokens.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-2">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No tokens found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No ZORA tokens available at the moment'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
