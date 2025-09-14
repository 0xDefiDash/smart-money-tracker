
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

interface GameState {
  playerId: string
  coins: number
  points: number
  level: number
  experience: number
  ownedBlocks: any[]
  defenseStrength: number
  attackPower: number
  lastSpawn: number
  nextSpawn: number
}

interface GameStatsProps {
  gameState: GameState
}

export function GameStats({ gameState }: GameStatsProps) {
  const experienceToNextLevel = gameState.level * 100
  const experienceProgress = (gameState.experience % experienceToNextLevel) / experienceToNextLevel * 100

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
            <span className="font-bold">{gameState.ownedBlocks.length}</span>
          </div>
          
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
            <p>• New blocks spawn every 2 minutes</p>
            <p>• Higher rarity = more value & power</p>
            <p>• Upgrade defense to protect your blocks</p>
            <p>• Steal attempts cost 10% of block value</p>
            <p>• Level up to unlock new abilities</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
