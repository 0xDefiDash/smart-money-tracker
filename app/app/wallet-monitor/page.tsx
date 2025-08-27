

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Wallet, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Eye,
  DollarSign,
  Coins,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

interface TokenBalance {
  token_address: string
  symbol: string
  name: string
  logo?: string
  thumbnail?: string
  decimals: number
  balance: string
  balance_formatted: string
  usd_price?: number
  usd_value?: string
  portfolio_percentage?: number
}

interface Transaction {
  hash: string
  from_address: string
  to_address: string
  value: string
  gas_price: string
  gas_used: string
  block_timestamp: string
  confirmed: boolean
}

interface NFT {
  token_address: string
  token_id: string
  name?: string
  description?: string
  image?: string
  contract_type: string
}

interface WalletData {
  address: string
  chain: string
  portfolioValue: number
  nativeBalance: {
    balance: string
    formatted: string
    symbol: string
  }
  tokenBalances: TokenBalance[]
  topHoldings: TokenBalance[]
  recentTransactions: Transaction[]
  nfts: NFT[]
  totalTokens: number
  totalNFTs: number
}

const SUPPORTED_CHAINS = [
  { id: '0x1', name: 'Ethereum', symbol: 'ETH' },
  { id: '0x38', name: 'BSC', symbol: 'BNB' },
  { id: '0x89', name: 'Polygon', symbol: 'MATIC' },
  { id: '0xa86a', name: 'Avalanche', symbol: 'AVAX' },
]

const SAMPLE_ADDRESSES = [
  '0xcB1C1FdE09f811B294172696404e88E658659905',
  '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
  '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'
]

export default function WalletMonitor() {
  const [searchAddress, setSearchAddress] = useState('')
  const [selectedChain, setSelectedChain] = useState('0x1')
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchWalletData = async (address: string) => {
    if (!address || address.length < 42) {
      setError('Please enter a valid wallet address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/wallet?address=${address}&chain=${selectedChain}`)
      const data = await response.json()

      if (data.status === 'success') {
        setWalletData(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch wallet data')
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchAddress.trim()) {
      fetchWalletData(searchAddress.trim())
    }
  }

  const handleSampleAddress = (address: string) => {
    setSearchAddress(address)
    fetchWalletData(address)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const truncateAddress = (address: string): string => {
    if (!address) return 'N/A'
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (numValue === 0) return '$0.00'
    if (numValue < 0.01) return '<$0.01'
    return formatCurrency(numValue)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-primary" />
            <span>Wallet Monitor</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyze any wallet's token holdings, transaction history, and NFT collection
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          <Eye className="w-3 h-3 mr-1" />
          Real-time Data
        </Badge>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Wallet Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chain Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Blockchain</label>
            <div className="flex space-x-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <Button
                  key={chain.id}
                  variant={selectedChain === chain.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChain(chain.id)}
                >
                  {chain.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Address Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Wallet Address</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter wallet address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Sample Addresses */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sample Addresses</label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_ADDRESSES.map((address, index) => (
                <Button
                  key={address}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSampleAddress(address)}
                  className="text-xs"
                >
                  Whale #{index + 1}: {truncateAddress(address)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Scanning wallet...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Data Display */}
      {walletData && !isLoading && (
        <div className="space-y-6">
          {/* Wallet Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span>Wallet Overview</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(walletData.address || '')}
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Badge variant="secondary">
                    {SUPPORTED_CHAINS.find(c => c.id === walletData.chain)?.name}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {walletData.address}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(walletData.portfolioValue || 0)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <Coins className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Tokens</p>
                  <p className="text-xl font-bold text-foreground">{walletData.totalTokens}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <ImageIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">NFTs</p>
                  <p className="text-xl font-bold text-foreground">{walletData.totalNFTs}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Native Balance</p>
                  <p className="text-xl font-bold text-foreground">
                    {parseFloat(walletData.nativeBalance?.formatted || '0').toFixed(4)} {walletData.nativeBalance?.symbol || 'ETH'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Holdings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Top Token Holdings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletData.topHoldings.slice(0, 10).map((token, index) => (
                  <div key={token.token_address || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        {token.logo ? (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={token.logo}
                              alt={token.symbol}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {token.symbol?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{token.symbol || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{token.name || 'Unknown Token'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatValue(token.usd_value || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {token.balance_formatted || '0'} {token.symbol || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Recent Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletData.recentTransactions.slice(0, 5).map((tx, index) => {
                  // Safe comparison with null checks
                  const isSentTransaction = tx.from_address && walletData.address && 
                    tx.from_address.toLowerCase() === walletData.address.toLowerCase()
                  
                  return (
                    <div key={tx.hash || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {isSentTransaction ? (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {isSentTransaction ? 'Sent' : 'Received'}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {truncateAddress(tx.hash || '')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {(parseFloat(tx.value || '0') / Math.pow(10, 18)).toFixed(6)} {walletData.nativeBalance?.symbol || 'ETH'}
                        </p>
                        <div className="flex items-center space-x-1">
                          <p className="text-sm text-muted-foreground">
                            {tx.block_timestamp ? new Date(tx.block_timestamp).toLocaleDateString() : 'N/A'}
                          </p>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* NFTs */}
          {walletData.nfts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span>NFT Collection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {walletData.nfts.slice(0, 8).map((nft, index) => (
                    <div key={`${nft.token_address || 'unknown'}-${nft.token_id || index}`} className="p-3 rounded-lg bg-muted/20">
                      <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                        {nft.image ? (
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                              src={nft.image}
                              alt={nft.name || 'NFT'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {nft.name || `Token #${nft.token_id || 'Unknown'}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {nft.token_id || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
