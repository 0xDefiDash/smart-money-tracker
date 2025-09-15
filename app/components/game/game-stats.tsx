
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Shield, 
  Sword, 
  Crown, 
  Timer,
  Zap,
  Target
} from 'lucide-react'

// Money production rates per minute based on rarity
const MONEY_PRODUCTION_RATES = {
  common: 50,      // $50 per minute
  rare: 150,       // $150 per minute
  epic: 400,       // $400 per minute
  legendary: 1000, // $1000 per minute
  secret: 5000     // $5000 per minute - The ultimate block!
}

interface GameState {
  playerId: string
  coins: number
  money: number
  level: number
  experience: number
  ownedBlocks: any[]
  defenseStrength: number
  attackPower: number
  lastSpawn: number
  nextSpawn: number
  lastMoneyUpdate: number
}

interface GameStatsProps {
  gameState: GameState
}

export function GameStats({ gameState }: GameStatsProps) {
  const experienceToNextLevel = gameState.level * 100
  const experienceProgress = (gameState.experience % experienceToNextLevel) / experienceToNextLevel * 100

  // Calculate money production rate
  const totalMoneyPerMinute = gameState.ownedBlocks.reduce((total, block) => {
    return total + MONEY_PRODUCTION_RATES[block.rarity as keyof typeof MONEY_PRODUCTION_RATES]
  }, 0)
  const moneyPerHour = totalMoneyPerMinute * 60
  const moneyPerDay = moneyPerHour * 24

  return (
    <div className="space-y-4">
      {/* Player Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Player Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-2xl">Level {gameState.level}</span>
              <Badge variant="secondary">{gameState.experience} XP</Badge>
            </div>
            <Progress value={experienceProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {experienceToNextLevel - (gameState.experience % experienceToNextLevel)} XP to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Combat Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-500" />
            <span>Combat Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sword className="w-4 h-4 text-red-500" />
              <span className="text-sm">Attack Power</span>
            </div>
            <span className="font-bold">{gameState.attackPower}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Defense</span>
            </div>
            <span className="font-bold">{gameState.defenseStrength}</span>
          </div>
        </CardContent>
      </Card>

      {/* Collection Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Collection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Owned Blocks</span>
            <span className="font-bold">
              {gameState.ownedBlocks.length}
              <span className="text-xs text-muted-foreground">/12</span>
            </span>
          </div>
          
          {gameState.ownedBlocks.length >= 12 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
              <p className="text-xs text-red-400">Collection full! Sell blocks to make space.</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Value</span>
            <span className="font-bold text-green-500">
              {gameState.ownedBlocks.reduce((sum, block) => sum + block.value, 0).toLocaleString()}
            </span>
          </div>

          {/* Rarity breakdown */}
          {gameState.ownedBlocks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Collection Breakdown:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Common:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'common').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rare:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'rare').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Epic:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'epic').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Legendary:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'legendary').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚀 Secret:</span>
                  <span className="text-yellow-500 font-bold">{gameState.ownedBlocks.filter(b => b.rarity === 'secret').length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passive Income */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Passive Income</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Money/Minute</span>
            <span className="font-bold text-green-500">
              ${totalMoneyPerMinute.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Money/Hour</span>
            <span className="font-bold text-green-400">
              ${moneyPerHour.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Money/Day</span>
            <span className="font-bold text-green-300">
              ${moneyPerDay.toLocaleString()}
            </span>
          </div>

          {totalMoneyPerMinute === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Claim blocks to start earning passive money!
            </p>
          )}

          {totalMoneyPerMinute > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Income Breakdown:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Common:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'common').length}x = ${gameState.ownedBlocks.filter(b => b.rarity === 'common').length * MONEY_PRODUCTION_RATES.common}/min</span>
                </div>
                <div className="flex justify-between">
                  <span>Rare:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'rare').length}x = ${gameState.ownedBlocks.filter(b => b.rarity === 'rare').length * MONEY_PRODUCTION_RATES.rare}/min</span>
                </div>
                <div className="flex justify-between">
                  <span>Epic:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'epic').length}x = ${gameState.ownedBlocks.filter(b => b.rarity === 'epic').length * MONEY_PRODUCTION_RATES.epic}/min</span>
                </div>
                <div className="flex justify-between">
                  <span>Legendary:</span>
                  <span>{gameState.ownedBlocks.filter(b => b.rarity === 'legendary').length}x = ${gameState.ownedBlocks.filter(b => b.rarity === 'legendary').length * MONEY_PRODUCTION_RATES.legendary}/min</span>
                </div>
                <div className="flex justify-between">
                  <span>🚀 Secret:</span>
                  <span className="text-yellow-500 font-bold">{gameState.ownedBlocks.filter(b => b.rarity === 'secret').length}x = ${gameState.ownedBlocks.filter(b => b.rarity === 'secret').length * MONEY_PRODUCTION_RATES.secret}/min</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Quick Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• You can only own 12 blocks at once!</p>
            <p>• Sell blocks to free up space for new ones</p>
            <p>• Blocks earn money automatically based on rarity</p>
            <p>• Legendary blocks earn $1,000/min!</p>
            <p>• New blocks spawn every 2 minutes</p>
            <p>• Higher rarity = higher sell price (60-80%)</p>
            <p>• Money accumulates even when offline!</p>
            <p>• Steal attempts cost 10% of block value</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
