
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Wallet, Search, Copy, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  value: number
  change24h: number
}

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // Mock data for demonstration
  const [balances] = useState<TokenBalance[]>([
    { symbol: 'ETH', name: 'Ethereum', balance: '12.5', value: 35000, change24h: 2.3 },
    { symbol: 'USDC', name: 'USD Coin', balance: '5000.0', value: 5000, change24h: 0.01 },
    { symbol: 'UNI', name: 'Uniswap', balance: '250.0', value: 1750, change24h: -1.8 },
    { symbol: 'LINK', name: 'Chainlink', balance: '100.0', value: 1550, change24h: 4.2 }
  ])

  const totalValue = balances.reduce((sum, token) => sum + token.value, 0)

  const handleSearch = async () => {
    if (!walletAddress.trim()) return
    
    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Wallet Analytics</h1>
          <p className="text-muted-foreground mt-1">Analyze any wallet's token holdings and transactions</p>
        </div>
        <Link href="/wallet-monitor">
          <Button>
            <Wallet className="w-4 h-4 mr-2" />
            Advanced Monitor
          </Button>
        </Link>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Lookup</CardTitle>
          <CardDescription>Enter a wallet address to view its holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">+2.1% (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{balances.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active holdings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Largest Holding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">ETH</div>
            <p className="text-xs text-muted-foreground mt-1">79.5% of portfolio</p>
          </CardContent>
        </Card>
      </div>

      {/* Token Holdings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Token Holdings</CardTitle>
            <CardDescription>Current wallet balances and values</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {balances.map((token, index) => (
              <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{token.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-foreground">{token.balance}</p>
                      <Badge variant="secondary" className={
                        token.change24h >= 0 
                          ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                          : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
                      }>
                        {token.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(token.change24h).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${token.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Analyze wallet activity and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Etherscan
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Transaction History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
