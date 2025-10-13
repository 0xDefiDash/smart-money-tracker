
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Coins, 
  Zap, 
  Crown,
  Gem,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  playerId: string
  playerName: string
  blockName: string
  blockType: string
  blockRarity: string
  transactionType: string
  price: number | null
  value: number
  timestamp: string
}

interface TransactionTickerProps {
  className?: string
}

const BLOCK_EMOJIS: { [key: string]: string } = {
  'btc': '₿',
  'eth': 'Ξ',
  'sol': '◎',
  'ada': '₳',
  'matic': '⟐',
  'avax': '🔺',
  'link': '🔗',
  'uni': '🦄',
  'aave': '👻',
  'comp': '🏛️',
  'sushi': '🍣',
  'cake': '🥞',
  'crv': '📈',
  'yfi': '💎',
  'mkr': '🏭',
  'grt': '📊',
  'fil': '💾',
  'dot': '●',
  'atom': '🌌',
  'doge': '🐕',
  'secret': '🚀'
}

const RARITY_CONFIG: { [key: string]: { color: string; icon: React.ReactNode; bgColor: string } } = {
  'common': { 
    color: 'text-gray-400', 
    icon: <Coins className="w-3 h-3" />,
    bgColor: 'bg-gray-500/10 border-gray-500/30'
  },
  'rare': { 
    color: 'text-blue-400', 
    icon: <Zap className="w-3 h-3" />,
    bgColor: 'bg-blue-500/10 border-blue-500/30'
  },
  'epic': { 
    color: 'text-purple-400', 
    icon: <Gem className="w-3 h-3" />,
    bgColor: 'bg-purple-500/10 border-purple-500/30'
  },
  'legendary': { 
    color: 'text-orange-400', 
    icon: <Crown className="w-3 h-3" />,
    bgColor: 'bg-orange-500/10 border-orange-500/30'
  },
  'secret': { 
    color: 'text-yellow-400', 
    icon: <Sparkles className="w-3 h-3" />,
    bgColor: 'bg-yellow-500/10 border-yellow-500/30'
  }
}

const TRANSACTION_CONFIG: { [key: string]: { text: string; color: string } } = {
  'claim': { text: 'claimed', color: 'text-green-400' },
  'purchase': { text: 'bought', color: 'text-blue-400' },
  'steal': { text: 'stole', color: 'text-red-400' },
  'sell': { text: 'sold', color: 'text-orange-400' }
}

export function TransactionTicker({ className }: TransactionTickerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/game/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and periodic refresh
  useEffect(() => {
    fetchTransactions()
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchTransactions, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${Math.floor(diffHours / 24)}d`
  }

  if (isLoading) {
    return (
      <Card className={cn("p-2 bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-purple-500/20", className)}>
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Loading Dash Wars activity...</span>
          </div>
        </div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className={cn("p-2 bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-purple-500/20", className)}>
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">No recent Dash Wars activity</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-2 bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-purple-500/20 overflow-hidden", className)}>
      <div className="flex items-center space-x-2 mb-2">
        <TrendingUp className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold text-purple-400">Dash Wars Live Feed</span>
        <Badge variant="secondary" className="text-xs">
          {transactions.length} recent
        </Badge>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll space-x-4">
          {/* Duplicate transactions for seamless scrolling */}
          {[...transactions, ...transactions].map((transaction, index) => {
            const rarityConfig = RARITY_CONFIG[transaction.blockRarity] || RARITY_CONFIG['common']
            const transactionConfig = TRANSACTION_CONFIG[transaction.transactionType] || TRANSACTION_CONFIG['claim']
            const blockEmoji = BLOCK_EMOJIS[transaction.blockType] || '🎲'
            
            return (
              <div
                key={`${transaction.id}-${index}`}
                className={cn(
                  "flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm",
                  rarityConfig.bgColor
                )}
              >
                <div className="flex items-center space-x-1">
                  <span className="text-lg">{blockEmoji}</span>
                  {rarityConfig.icon}
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-white">
                    {transaction.playerName}
                  </span>
                  <span className={transactionConfig.color}>
                    {transactionConfig.text}
                  </span>
                  <span className={rarityConfig.color}>
                    {transaction.blockName}
                  </span>
                </div>
                
                {transaction.price ? (
                  <Badge variant="secondary" className="text-xs">
                    ${transaction.price.toLocaleString()}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    FREE
                  </Badge>
                )}
                
                <span className="text-xs text-slate-400">
                  {formatTimeAgo(transaction.timestamp)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
