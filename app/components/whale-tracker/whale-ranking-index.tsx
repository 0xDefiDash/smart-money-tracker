
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Crown, TrendingUp, TrendingDown, ExternalLink, Wallet, Activity, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatNumber, truncateAddress } from '@/lib/utils'
import { toast } from 'react-hot-toast'

// Mock whale ranking data for September 8, 2025
const topWhales = [
  {
    rank: 1,
    walletAddress: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
    label: 'Sovereign Wealth Fund Alpha',
    totalBalance: 3120000000, // $3.12B
    balanceChange24h: 7.9,
    dominantAssets: ['BTC', 'ETH', 'USDC'],
    lastTxAmount: 89000000,
    lastTxTime: '23 minutes ago',
    totalTxCount: 1289,
    avgTxSize: 9200000,
    whaleType: 'institutional',
    riskLevel: 'low',
    influence: 99
  },
  {
    rank: 2,
    walletAddress: '0x73BCEb1Cd57C711feaC4224D062b0F6ff338aA6c',
    label: 'BlackRock Digital Assets',
    totalBalance: 2890000000, // $2.89B
    balanceChange24h: 12.3,
    dominantAssets: ['BTC', 'ETH', 'WBTC'],
    lastTxAmount: 134000000,
    lastTxTime: '8 minutes ago',
    totalTxCount: 945,
    avgTxSize: 14800000,
    whaleType: 'institutional',
    riskLevel: 'low',
    influence: 97
  },
  {
    rank: 3,
    walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    label: 'Grayscale Holdings Vault',
    totalBalance: 2250000000, // $2.25B
    balanceChange24h: 19.0,
    dominantAssets: ['BTC', 'ETH', 'SOL'],
    lastTxAmount: 78000000,
    lastTxTime: '35 minutes ago',
    totalTxCount: 1523,
    avgTxSize: 7900000,
    whaleType: 'institutional',
    riskLevel: 'low',
    influence: 95
  },
  {
    rank: 4,
    walletAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    label: 'Coinbase Custody Prime',
    totalBalance: 1890000000, // $1.89B
    balanceChange24h: 30.3,
    dominantAssets: ['ETH', 'USDC', 'WETH'],
    lastTxAmount: 167000000,
    lastTxTime: '12 minutes ago',
    totalTxCount: 2248,
    avgTxSize: 4890000,
    whaleType: 'exchange',
    riskLevel: 'low',
    influence: 93
  },
  {
    rank: 5,
    walletAddress: '0x2F0b23f53734252Bda2277357e97e1517d6B042A',
    label: 'Binance Ultra High Net Worth',
    totalBalance: 1670000000, // $1.67B
    balanceChange24h: 30.5,
    dominantAssets: ['BTC', 'BNB', 'ETH'],
    lastTxAmount: 89000000,
    lastTxTime: '1.2 hours ago',
    totalTxCount: 3612,
    avgTxSize: 3200000,
    whaleType: 'exchange',
    riskLevel: 'medium',
    influence: 91
  },
  {
    rank: 6,
    walletAddress: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    label: 'Kraken Institution Services',
    totalBalance: 1450000000, // $1.45B
    balanceChange24h: 29.5,
    dominantAssets: ['BTC', 'ETH', 'USDT'],
    lastTxAmount: 123000000,
    lastTxTime: '47 minutes ago',
    totalTxCount: 1834,
    avgTxSize: 6800000,
    whaleType: 'institutional',
    riskLevel: 'low',
    influence: 88
  },
  {
    rank: 7,
    walletAddress: '0xDF9Eb223bAFBE5c5271415C75aeCD68C21fE3D7F',
    label: 'Whale Alpha #2847',
    totalBalance: 1280000000, // $1.28B
    balanceChange24h: 43.8,
    dominantAssets: ['BTC', 'ETH', 'SOL'],
    lastTxAmount: 156000000,
    lastTxTime: '1.8 hours ago',
    totalTxCount: 967,
    avgTxSize: 8900000,
    whaleType: 'individual',
    riskLevel: 'medium',
    influence: 85
  },
  {
    rank: 8,
    walletAddress: '0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296',
    label: 'Fidelity Digital Assets',
    totalBalance: 1090000000, // $1.09B
    balanceChange24h: 39.7,
    dominantAssets: ['BTC', 'ETH', 'AVAX'],
    lastTxAmount: 234000000,
    lastTxTime: '2.5 hours ago',
    totalTxCount: 1298,
    avgTxSize: 5600000,
    whaleType: 'institutional',
    riskLevel: 'low',
    influence: 83
  },
  {
    rank: 9,
    walletAddress: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
    label: 'Alameda Research Legacy',
    totalBalance: 890000000, // $890M
    balanceChange24h: 36.9,
    dominantAssets: ['SOL', 'FTT', 'BTC'],
    lastTxAmount: 67000000,
    lastTxTime: '4.2 hours ago',
    totalTxCount: 4634,
    avgTxSize: 2100000,
    whaleType: 'fund',
    riskLevel: 'high',
    influence: 78
  },
  {
    rank: 10,
    walletAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    label: 'Jump Trading Crypto',
    totalBalance: 820000000, // $820M
    balanceChange24h: 32.3,
    dominantAssets: ['BTC', 'ETH', 'SOL'],
    lastTxAmount: 189000000,
    lastTxTime: '28 minutes ago',
    totalTxCount: 2456,
    avgTxSize: 3700000,
    whaleType: 'trading_firm',
    riskLevel: 'medium',
    influence: 81
  }
]

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Address copied to clipboard!', {
      icon: '📋',
      duration: 2000,
    })
  } catch (err) {
    toast.error('Failed to copy address')
  }
}

const getWhaleTypeColor = (type: string) => {
  switch (type) {
    case 'institutional': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'exchange': return 'bg-green-500/10 text-green-400 border-green-500/20'
    case 'individual': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'fund': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    case 'trading_firm': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}

const getRiskLevelColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'bg-green-500/10 text-green-400'
    case 'medium': return 'bg-yellow-500/10 text-yellow-400'
    case 'high': return 'bg-red-500/10 text-red-400'
    default: return 'bg-gray-500/10 text-gray-400'
  }
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />
  if (rank <= 3) return <Crown className="w-4 h-4 text-gray-400" />
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
}

export function WhaleRankingIndex() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopy = async (address: string) => {
    await copyToClipboard(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span>Whale Ranking Index</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Top cryptocurrency whales ranked by total portfolio value and market influence
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Live Rankings</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {topWhales.map((whale) => (
            <div
              key={whale.walletAddress}
              className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 border-b border-border/50 last:border-b-0"
            >
              {/* Rank & Label */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
                  {getRankIcon(whale.rank)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {whale.label}
                    </h4>
                    <Badge className={`text-xs px-2 py-0.5 ${getWhaleTypeColor(whale.whaleType)}`}>
                      {whale.whaleType.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>Portfolio:</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(whale.totalBalance)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {whale.balanceChange24h > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={whale.balanceChange24h > 0 ? 'text-green-500' : 'text-red-500'}>
                          {whale.balanceChange24h > 0 ? '+' : ''}{whale.balanceChange24h}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Last TX: {whale.lastTxTime}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span>Risk:</span>
                      <Badge className={`text-xs px-1.5 py-0.5 ${getRiskLevelColor(whale.riskLevel)}`}>
                        {whale.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Address & Stats */}
              <div className="flex items-center space-x-4">
                {/* Key Metrics */}
                <div className="hidden lg:flex items-center space-x-6 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {formatNumber(whale.totalTxCount)}
                    </div>
                    <div>Transactions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {formatCurrency(whale.avgTxSize)}
                    </div>
                    <div>Avg TX Size</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {whale.influence}/100
                    </div>
                    <div>Influence</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs">
                      {whale.dominantAssets.join(', ')}
                    </div>
                    <div>Top Assets</div>
                  </div>
                </div>

                {/* Wallet Address & Copy Button */}
                <div className="flex items-center space-x-2 bg-muted/30 rounded-lg px-3 py-2">
                  <code className="text-xs font-mono text-foreground">
                    {truncateAddress(whale.walletAddress)}
                  </code>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                    onClick={() => handleCopy(whale.walletAddress)}
                  >
                    {copiedAddress === whale.walletAddress ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                    onClick={() => window.open(`https://etherscan.io/address/${whale.walletAddress}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
