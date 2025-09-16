
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useWallet, SUPPORTED_CHAINS } from '@/contexts/WalletContext'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  price: number
  value: number
  change24h: number
  logo?: string
}

interface Transaction {
  hash: string
  type: 'send' | 'receive' | 'swap' | 'approve'
  amount: string
  token: string
  timestamp: number
  status: 'confirmed' | 'pending' | 'failed'
  from: string
  to: string
  value: number
}

export default function WalletDashboardPage() {
  const { isConnected, address, balance, chainId } = useWallet()
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [portfolioChange, setPortfolioChange] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setTokens([
          {
            address: '0x...',
            symbol: 'ETH',
            name: 'Ethereum',
            balance: '1.25',
            decimals: 18,
            price: 2400,
            value: 3000,
            change24h: 2.5,
            logo: '🔵'
          },
          {
            address: '0x...',
            symbol: 'USDC',
            name: 'USD Coin',
            balance: '1500.00',
            decimals: 6,
            price: 1,
            value: 1500,
            change24h: 0.1,
            logo: '🔵'
          },
          {
            address: '0x...',
            symbol: 'UNI',
            name: 'Uniswap',
            balance: '45.8',
            decimals: 18,
            price: 12.5,
            value: 572.5,
            change24h: -1.2,
            logo: '🦄'
          }
        ])

        setTransactions([
          {
            hash: '0x123...abc',
            type: 'receive',
            amount: '0.5',
            token: 'ETH',
            timestamp: Date.now() - 3600000,
            status: 'confirmed',
            from: '0x456...def',
            to: address,
            value: 1200
          },
          {
            hash: '0x789...xyz',
            type: 'swap',
            amount: '100',
            token: 'USDC → ETH',
            timestamp: Date.now() - 7200000,
            status: 'confirmed',
            from: address,
            to: '0x1inch...',
            value: 100
          }
        ])

        setPortfolioValue(5072.5)
        setPortfolioChange(3.2)
        setIsLoading(false)
      }, 1500)
    }
  }, [isConnected, address])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Portfolio data refreshed!')
    }, 1000)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Wallet Dashboard</h1>
            <p className="text-muted-foreground">
              Connect your wallet to view your DeFi portfolio and track performance
            </p>
          </div>
          <WalletConnect />
        </div>
      </div>
    )
  }

  const currentChain = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
            <p className="text-muted-foreground">
              Track your DeFi portfolio across multiple chains
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Wallet Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Connected Wallet</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatAddress(address!)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(address!)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (currentChain) {
                          window.open(`${currentChain.explorer}/address/${address}`, '_blank')
                        }
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              {currentChain && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  {currentChain.name}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(portfolioValue)}
                </div>
                <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
                <div className={`text-sm flex items-center justify-center mt-1 ${
                  portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolioChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {portfolioChange >= 0 ? '+' : ''}{portfolioChange}% (24h)
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {balance} {currentChain?.symbol || 'ETH'}
                </div>
                <div className="text-sm text-muted-foreground">Native Balance</div>
                <div className="text-sm text-muted-foreground mt-1">
                  ≈ {formatCurrency(parseFloat(balance || '0') * 2400)}
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{tokens.length}</div>
                <div className="text-sm text-muted-foreground">Token Types</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Across {currentChain?.name || 'Network'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="defi">DeFi Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Token Holdings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg">
                          {token.logo}
                        </div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-sm text-muted-foreground">{token.symbol}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{token.balance} {token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(token.value)}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(token.price)}</div>
                        <div className={`text-sm ${
                          token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'receive' ? 'bg-green-500/10 text-green-600' :
                          tx.type === 'send' ? 'bg-red-500/10 text-red-600' :
                          'bg-blue-500/10 text-blue-600'
                        }`}>
                          {tx.type === 'receive' ? '↓' : tx.type === 'send' ? '↑' : '↔'}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{tx.type} {tx.token}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-medium ${
                          tx.type === 'receive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(tx.value)}
                        </div>
                      </div>

                      <Badge variant={
                        tx.status === 'confirmed' ? 'default' :
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {tx.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Portfolio Allocation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokens.map((token, index) => {
                      const percentage = (token.value / portfolioValue) * 100
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{token.symbol}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h P&L</span>
                      <span className={portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency((portfolioValue * portfolioChange) / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Performer</span>
                      <span className="text-green-600">ETH (+2.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Worst Performer</span>
                      <span className="text-red-600">UNI (-1.2%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="defi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>DeFi Positions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No DeFi Positions Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start using DeFi protocols to see your positions here
                  </p>
                  <Button variant="outline">
                    Learn about DeFi
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
