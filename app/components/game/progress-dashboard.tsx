
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Target, 
  Crown, 
  Zap,
  Trophy,
  Coins,
  Shield,
  Sword,
  Star,
  CheckCircle
} from 'lucide-react'

interface ProgressDashboardProps {
  gameState: any
}

export function ProgressDashboard({ gameState }: ProgressDashboardProps) {
  // Calculate progress metrics
  const collectionProgress = (gameState.ownedBlocks.length / 12) * 100
  const levelProgress = (gameState.experience % 100)
  const moneyGoals = [
    { threshold: 10000, label: 'Bronze', color: 'text-orange-400' },
    { threshold: 50000, label: 'Silver', color: 'text-gray-400' },
    { threshold: 100000, label: 'Gold', color: 'text-yellow-400' },
    { threshold: 500000, label: 'Platinum', color: 'text-cyan-400' },
    { threshold: 1000000, label: 'Diamond', color: 'text-blue-400' },
  ]

  const currentRank = moneyGoals.reduce((acc, goal) => {
    return gameState.money >= goal.threshold ? goal : acc
  }, { threshold: 0, label: 'Beginner', color: 'text-gray-500' })

  const nextRank = moneyGoals.find(goal => goal.threshold > gameState.money)
  const rankProgress = nextRank 
    ? ((gameState.money - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100
    : 100

  // Quick achievements tracker
  const quickAchievements = [
    {
      id: 'first_block',
      title: 'First Block',
      description: 'Collect your first block',
      completed: gameState.ownedBlocks.length >= 1,
      icon: Target
    },
    {
      id: 'five_blocks',
      title: 'Block Collector',
      description: 'Own 5 blocks',
      completed: gameState.ownedBlocks.length >= 5,
      icon: Crown
    },
    {
      id: 'level_5',
      title: 'Experienced',
      description: 'Reach level 5',
      completed: gameState.level >= 5,
      icon: Star
    },
    {
      id: 'rich',
      title: 'Getting Rich',
      description: 'Earn $50,000',
      completed: gameState.money >= 50000,
      icon: Trophy
    }
  ]

  const completedAchievements = quickAchievements.filter(a => a.completed).length

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-gray-900/90 border-neon-blue/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-neon-green-bright" />
          <span>Your Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Rank */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className={`w-4 h-4 ${currentRank.color}`} />
              <span className="font-bold text-sm">Rank: {currentRank.label}</span>
            </div>
            {nextRank && (
              <span className="text-xs text-muted-foreground">
                Next: {nextRank.label}
              </span>
            )}
          </div>
          <Progress value={rankProgress} className="h-2" />
          {nextRank && (
            <p className="text-xs text-muted-foreground">
              ${(nextRank.threshold - gameState.money).toLocaleString()} to {nextRank.label}
            </p>
          )}
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-sm">Level {gameState.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {gameState.experience % 100}/100 XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </div>

        {/* Collection Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-neon-blue-bright" />
              <span className="font-bold text-sm">Collection</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {gameState.ownedBlocks.length}/12 blocks
            </span>
          </div>
          <Progress value={collectionProgress} className="h-2" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded p-2">
            <div className="flex items-center space-x-2">
              <Sword className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-xs text-muted-foreground">Attack</p>
                <p className="font-bold text-sm">{gameState.attackPower}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded p-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Defense</p>
                <p className="font-bold text-sm">{gameState.defenseStrength}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Achievements */}
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Quick Goals</span>
            <Badge variant="outline" className="border-neon-green/30 text-neon-green-bright">
              {completedAchievements}/{quickAchievements.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {quickAchievements.map(achievement => {
              const Icon = achievement.icon
              return (
                <div 
                  key={achievement.id}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    achievement.completed 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-gray-500/10 border border-gray-500/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    achievement.completed ? 'text-green-400' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${
                      achievement.completed ? 'text-green-400' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </p>
                  </div>
                  {achievement.completed && (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
