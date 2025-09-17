
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Crown, 
  Star, 
  TrendingUp, 
  Gamepad2,
  Zap,
  Target,
  Shield,
  DollarSign,
  Clock,
  Gem
} from 'lucide-react'

interface LeaderboardEntry {
  playerId: string
  playerName: string
  level: number
  money: number
  blocksOwned: number
  totalValue: number
  winRate: number
  battlesWon: number
  battlesLost: number
  moneyPerMinute: number
  rareBlocksOwned: number
  epicBlocksOwned: number
  legendaryBlocksOwned: number
  secretBlocksOwned: number
  rank: number
  badge: string
  badgeColor: string
  isCurrentPlayer?: boolean
}

interface LeaderboardProps {
  gameState: any
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Trophy className="w-6 h-6 text-gray-400" />
    case 3:
      return <Star className="w-6 h-6 text-orange-500" />
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</span>
  }
}

const getRankGradient = (rank: number) => {
  switch (rank) {
    case 1:
      return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
    case 2:
      return 'from-gray-400/20 to-gray-500/20 border-gray-400/30'
    case 3:
      return 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
    default:
      return 'from-slate-500/10 to-slate-600/10 border-slate-500/20'
  }
}

export default function Leaderboard({ gameState }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Real-time polling interval
  useEffect(() => {
    fetchLeaderboard()
    
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchLeaderboard, 5000)
    
    return () => clearInterval(interval)
  }, [gameState.playerId])

  // Update player data whenever game state changes
  useEffect(() => {
    if (gameState.playerId) {
      updatePlayerData()
    }
  }, [gameState.money, gameState.ownedBlocks, gameState.level])

  const fetchLeaderboard = async () => {
    try {
      const playerId = gameState.playerId || 'current_player'
      const response = await fetch(`/api/game/leaderboard?playerId=${playerId}&limit=10&t=${Date.now()}`)
      const data = await response.json()
      setLeaderboard(data.leaderboard)
      setLastUpdated(data.lastUpdated)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePlayerData = async () => {
    try {
      const playerId = gameState.playerId || 'current_player'
      await fetch('/api/game/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          gameState
        })
      })
      
      // Fetch updated leaderboard immediately after updating player data
      setTimeout(fetchLeaderboard, 500) // Small delay to ensure data is processed
    } catch (error) {
      console.error('Error updating player data:', error)
    }
  }

  // Expose function to parent component for manual updates
  const forceUpdate = () => {
    updatePlayerData()
    fetchLeaderboard()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Global Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Global Leaderboard</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500 font-medium">Live</span>
            </div>
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.playerId}
              className={`relative p-4 rounded-xl bg-gradient-to-r ${getRankGradient(entry.rank)} border backdrop-blur-sm ${
                entry.isCurrentPlayer ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2 z-10">
                <div className={`p-2 rounded-full bg-background border-2 ${
                  entry.rank <= 3 ? 'border-yellow-500' : 'border-slate-400'
                }`}>
                  {getRankIcon(entry.rank)}
                </div>
              </div>

              <div className="ml-6 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg">{entry.playerName}</h3>
                      {entry.isCurrentPlayer && (
                        <Gamepad2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="outline" 
                        style={{ backgroundColor: `${entry.badgeColor}20`, color: entry.badgeColor }}
                      >
                        {entry.badge}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Level {entry.level}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-500">
                      ${entry.money.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${entry.moneyPerMinute}/min
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Blocks */}
                  <div className="flex items-center space-x-2">
                    <Gem className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">Blocks:</span>
                    <span className="font-semibold">{entry.blocksOwned}/12</span>
                  </div>

                  {/* Win Rate */}
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="font-semibold">{entry.winRate}%</span>
                  </div>

                  {/* Battles */}
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="text-muted-foreground">Battles:</span>
                    <span className="font-semibold">{entry.battlesWon}W/{entry.battlesLost}L</span>
                  </div>

                  {/* Total Value */}
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold">${(entry.totalValue / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                {/* Block Collection */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Block Collection</div>
                  <div className="flex space-x-4 text-xs">
                    {entry.rareBlocksOwned > 0 && (
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{entry.rareBlocksOwned} Rare</span>
                      </span>
                    )}
                    {entry.epicBlocksOwned > 0 && (
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>{entry.epicBlocksOwned} Epic</span>
                      </span>
                    )}
                    {entry.legendaryBlocksOwned > 0 && (
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>{entry.legendaryBlocksOwned} Legendary</span>
                      </span>
                    )}
                    {entry.secretBlocksOwned > 0 && (
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>{entry.secretBlocksOwned} Secret</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Block Slots */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Block Slots</span>
                    <span>{entry.blocksOwned}/12</span>
                  </div>
                  <Progress value={(entry.blocksOwned / 12) * 100} className="h-2" />
                </div>
              </div>

              {/* Glow effect for top 3 */}
              {entry.rank <= 3 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>🏆 Compete for the top spot by collecting rare blocks and winning battles!</p>
            <div className="flex justify-center items-center space-x-4 text-xs">
              <span>📊 Updates every 5 seconds</span>
              <span>•</span>
              <span>🎮 Max 12 blocks per player</span>
              <span>•</span>
              <span>⚡ Real-time player tracking</span>
            </div>
            {lastUpdated && (
              <p className="text-xs opacity-75">
                Last sync: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
