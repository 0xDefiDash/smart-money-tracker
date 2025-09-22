
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
  Globe,
  Star,
  Eye,
  Users,
  Palette,
  Sparkles,
  ImageIcon,
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface ZoraCollection {
  address: string
  name: string
  symbol: string
  description?: string
  image: string | null
  floorPrice: number
  totalVolume: number
  volume24h: number
  owners: number
  totalSupply: number
  verified: boolean
  trending: boolean
  createdAt: string
  creator: {
    address: string
    name?: string
    avatar?: string
  }
  stats: {
    sales24h: number
    avgPrice24h: number
    change24h: number
    royalty: number
  }
}

interface ZoraToken {
  tokenId: string
  collection: string
  name: string
  description?: string
  image: string | null
  price: number
  lastSale?: number
  owner: string
  creator: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY'
  attributes?: Array<{
    trait_type: string
    value: string
  }>
  listed: boolean
  createdAt: string
}

export default function ZoraPage() {
  const [collections, setCollections] = useState<ZoraCollection[]>([])
  const [tokens, setTokens] = useState<ZoraToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('volume24h')
  const [filterBy, setFilterBy] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('collections')
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalVolume: 0,
    volume24h: 0,
    activeTraders: 0,
    totalNFTs: 0,
    avgPrice24h: 0,
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Mock data - in a real app this would fetch from ZORA API
  const mockCollections: ZoraCollection[] = [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'Digital Art Collective',
      symbol: 'DAC',
      description: 'A curated collection of digital artworks from emerging artists',
      image: '/uploads/cryptoExpert101.jpg',
      floorPrice: 0.5,
      totalVolume: 125.8,
      volume24h: 12.4,
      owners: 234,
      totalSupply: 1000,
      verified: true,
      trending: true,
      createdAt: '2024-09-15T10:00:00Z',
      creator: {
        address: '0xabcdef1234567890',
        name: 'ArtistDAO',
        avatar: '/uploads/bullrun.jpg'
      },
      stats: {
        sales24h: 18,
        avgPrice24h: 0.68,
        change24h: 15.2,
        royalty: 5.0
      }
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      name: 'Zora Genesis',
      symbol: 'ZGEN',
      description: 'The genesis collection on ZORA network showcasing the future of NFTs',
      image: '/uploads/pepe.jpg',
      floorPrice: 1.2,
      totalVolume: 340.2,
      volume24h: 28.7,
      owners: 156,
      totalSupply: 500,
      verified: true,
      trending: true,
      createdAt: '2024-09-10T14:30:00Z',
      creator: {
        address: '0xdef123456789abcd',
        name: 'ZORA Team',
        avatar: '/uploads/wendy.jpg'
      },
      stats: {
        sales24h: 24,
        avgPrice24h: 1.195,
        change24h: 8.7,
        royalty: 2.5
      }
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      name: 'Crypto Punks Tribute',
      symbol: 'CPT',
      description: 'A tribute to the original crypto punks with modern aesthetics',
      image: '/uploads/Trump.jpg',
      floorPrice: 0.8,
      totalVolume: 89.3,
      volume24h: 8.2,
      owners: 312,
      totalSupply: 2000,
      verified: false,
      trending: false,
      createdAt: '2024-09-12T16:45:00Z',
      creator: {
        address: '0x789abcdef1234567',
        name: 'RetroArt',
        avatar: '/uploads/0xsweep.jpg'
      },
      stats: {
        sales24h: 10,
        avgPrice24h: 0.82,
        change24h: -3.4,
        royalty: 7.5
      }
    }
  ]

  const mockTokens: ZoraToken[] = [
    {
      tokenId: '1',
      collection: 'Digital Art Collective',
      name: 'Abstract Dreams #001',
      description: 'A vibrant abstract piece representing digital consciousness',
      image: '/uploads/bullrun Gravano.jpg',
      price: 0.75,
      lastSale: 0.65,
      owner: '0x1111111111111111',
      creator: '0xabcdef1234567890',
      rarity: 'RARE',
      attributes: [
        { trait_type: 'Color Palette', value: 'Vibrant' },
        { trait_type: 'Style', value: 'Abstract' },
        { trait_type: 'Rarity', value: 'Rare' }
      ],
      listed: true,
      createdAt: '2024-09-18T12:00:00Z'
    },
    {
      tokenId: '42',
      collection: 'Zora Genesis',
      name: 'Genesis Fragment #042',
      description: 'A founding piece of the ZORA ecosystem',
      image: '/uploads/James wynn.jpg',
      price: 1.5,
      lastSale: 1.3,
      owner: '0x2222222222222222',
      creator: '0xdef123456789abcd',
      rarity: 'LEGENDARY',
      attributes: [
        { trait_type: 'Generation', value: 'Genesis' },
        { trait_type: 'Power Level', value: 'Legendary' },
        { trait_type: 'Element', value: 'Light' }
      ],
      listed: true,
      createdAt: '2024-09-16T09:30:00Z'
    }
  ]

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would be:
      // const response = await fetch('/api/zora/collections')
      // const data = await response.json()
      
      setCollections(mockCollections)
      setTokens(mockTokens)
      
      // Calculate stats
      const totalCollections = mockCollections.length
      const totalVolume = mockCollections.reduce((sum, c) => sum + c.totalVolume, 0)
      const volume24h = mockCollections.reduce((sum, c) => sum + c.volume24h, 0)
      const activeTraders = mockCollections.reduce((sum, c) => sum + c.owners, 0)
      const totalNFTs = mockCollections.reduce((sum, c) => sum + c.totalSupply, 0)
      const avgPrice24h = volume24h / mockCollections.reduce((sum, c) => sum + c.stats.sales24h, 0)
      
      setStats({
        totalCollections,
        totalVolume,
        volume24h,
        activeTraders,
        totalNFTs,
        avgPrice24h: isFinite(avgPrice24h) ? avgPrice24h : 0,
      })
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData(false)
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredCollections = collections
    .filter(collection => {
      const matchesSearch = collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           collection.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterBy === 'all' ? true :
        filterBy === 'verified' ? collection.verified :
        filterBy === 'trending' ? collection.trending :
        filterBy === 'high-volume' ? collection.volume24h > 20 :
        true
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume24h':
          return b.volume24h - a.volume24h
        case 'totalVolume':
          return b.totalVolume - a.totalVolume
        case 'floorPrice':
          return b.floorPrice - a.floorPrice
        case 'owners':
          return b.owners - a.owners
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const filteredTokens = tokens.filter(token => 
    token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.collection?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => `${price.toFixed(3)} ETH`
  const formatVolume = (volume: number) => `${volume.toFixed(2)} ETH`

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-100 text-gray-800'
      case 'UNCOMMON': return 'bg-green-100 text-green-800'
      case 'RARE': return 'bg-blue-100 text-blue-800'
      case 'LEGENDARY': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ZORA Tracker</h1>
            <p className="text-muted-foreground">Track NFT collections and marketplace activity on ZORA</p>
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
          <p>Loading ZORA data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ZORA Tracker</h1>
            <p className="text-muted-foreground">Track NFT collections and marketplace activity on ZORA</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Failed to Load Data</h3>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchData(true)} disabled={refreshing}>
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
          <h1 className="text-3xl font-bold">ZORA Tracker</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">Track NFT collections and marketplace activity on ZORA</p>
            {lastUpdated && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                Updated {formatDistanceToNow(lastUpdated)} ago
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={() => fetchData(true)} 
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
                <p className="text-sm text-muted-foreground">Collections</p>
                <p className="text-2xl font-bold">{stats.totalCollections}</p>
              </div>
              <Palette className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{formatVolume(stats.totalVolume)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">{formatVolume(stats.volume24h)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Traders</p>
                <p className="text-2xl font-bold">{stats.activeTraders}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total NFTs</p>
                <p className="text-2xl font-bold">{stats.totalNFTs.toLocaleString()}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Price 24h</p>
                <p className="text-2xl font-bold">{formatPrice(stats.avgPrice24h)}</p>
              </div>
              <Target className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="tokens">Individual NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
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
                <SelectItem value="volume24h">24h Volume</SelectItem>
                <SelectItem value="totalVolume">Total Volume</SelectItem>
                <SelectItem value="floorPrice">Floor Price</SelectItem>
                <SelectItem value="owners">Owners</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="high-volume">High Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <Card key={collection.address} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {collection.image ? (
                        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden">
                          <Image
                            src={collection.image}
                            alt={collection.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Palette className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm truncate max-w-32">
                            {collection.name}
                          </h3>
                          {collection.verified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-mono">
                          {collection.symbol}
                        </p>
                        {collection.trending && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Description */}
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  
                  {/* Price and Volume Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Floor Price</p>
                      <p className="font-medium">{formatPrice(collection.floorPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">24h Volume</p>
                      <p className="font-medium">{formatVolume(collection.volume24h)}</p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Volume</p>
                      <p className="font-medium">{formatVolume(collection.totalVolume)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Owners</p>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-muted-foreground" />
                        <p className="font-medium">{collection.owners}</p>
                      </div>
                    </div>
                  </div>

                  {/* 24h Change */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">24h Change</span>
                    <span className={`font-medium ${collection.stats.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {collection.stats.change24h > 0 ? '+' : ''}{collection.stats.change24h.toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Creation Time */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Created {formatDistanceToNow(new Date(collection.createdAt))} ago
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`https://zora.co/collect/${collection.address}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View on ZORA
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          {/* Search for tokens */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search individual NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tokens Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredTokens.map((token) => (
              <Card key={`${token.collection}-${token.tokenId}`} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  {token.image ? (
                    <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={token.image}
                        alt={token.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-white" />
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm truncate">{token.name}</h3>
                    <p className="text-xs text-muted-foreground">{token.collection}</p>
                  </div>
                  
                  <Badge variant="secondary" className={`text-xs ${getRarityColor(token.rarity)}`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {token.rarity}
                  </Badge>
                  
                  {token.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {token.description}
                    </p>
                  )}
                  
                  <div className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">{formatPrice(token.price)}</span>
                    </div>
                    {token.lastSale && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Sale</span>
                        <span className="font-medium">{formatPrice(token.lastSale)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Created {formatDistanceToNow(new Date(token.createdAt))} ago
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`https://zora.co/collect/${token.collection}/${token.tokenId}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View NFT
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {(activeTab === 'collections' ? filteredCollections : filteredTokens).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              No {activeTab} match your current search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
