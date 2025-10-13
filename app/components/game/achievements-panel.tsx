
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  Sword, 
  Shield, 
  Crown, 
  Star,
  Flame,
  Zap,
  Gift,
  Lock,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  progress: number
  target: number
  reward: {
    type: 'coins' | 'money' | 'xp' | 'power'
    amount: number
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
}

interface AchievementsPanelProps {
  gameState: any
  onClaimReward: (achievementId: string) => void
}

export function AchievementsPanel({ gameState, onClaimReward }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => {
    // Initialize achievements based on game state
    const initialAchievements: Achievement[] = [
      {
        id: 'first_block',
        name: 'Block Collector',
        description: 'Claim your first block',
        icon: Target,
        progress: Math.min(gameState.ownedBlocks?.length || 0, 1),
        target: 1,
        reward: { type: 'money', amount: 5000 },
        rarity: 'common',
        unlocked: (gameState.ownedBlocks?.length || 0) >= 1
      },
      {
        id: 'block_master',
        name: 'Block Master',
        description: 'Own 12 blocks at once',
        icon: Crown,
        progress: gameState.ownedBlocks?.length || 0,
        target: 12,
        reward: { type: 'money', amount: 50000 },
        rarity: 'rare',
        unlocked: (gameState.ownedBlocks?.length || 0) >= 12
      },
      {
        id: 'first_steal',
        name: 'First Raid',
        description: 'Successfully steal from another player',
        icon: Sword,
        progress: 0, // Would track this in actual implementation
        target: 1,
        reward: { type: 'power', amount: 10 },
        rarity: 'common',
        unlocked: false
      },
      {
        id: 'raid_master',
        name: 'Raid Master',
        description: 'Win 25 battles',
        icon: Flame,
        progress: 0,
        target: 25,
        reward: { type: 'money', amount: 100000 },
        rarity: 'epic',
        unlocked: false
      },
      {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: Star,
        progress: gameState.level || 1,
        target: 10,
        reward: { type: 'xp', amount: 500 },
        rarity: 'rare',
        unlocked: (gameState.level || 1) >= 10
      },
      {
        id: 'level_50',
        name: 'Legendary Warrior',
        description: 'Reach level 50',
        icon: Crown,
        progress: gameState.level || 1,
        target: 50,
        reward: { type: 'money', amount: 500000 },
        rarity: 'legendary',
        unlocked: (gameState.level || 1) >= 50
      },
      {
        id: 'money_maker',
        name: 'Money Maker',
        description: 'Earn $100,000 total',
        icon: Gift,
        progress: Math.min(gameState.money || 0, 100000),
        target: 100000,
        reward: { type: 'money', amount: 25000 },
        rarity: 'rare',
        unlocked: (gameState.money || 0) >= 100000
      },
      {
        id: 'millionaire',
        name: 'Crypto Millionaire',
        description: 'Earn $1,000,000 total',
        icon: Trophy,
        progress: Math.min(gameState.money || 0, 1000000),
        target: 1000000,
        reward: { type: 'money', amount: 250000 },
        rarity: 'legendary',
        unlocked: (gameState.money || 0) >= 1000000
      },
      {
        id: 'secret_hunter',
        name: 'Secret Hunter',
        description: 'Find a secret block',
        icon: Zap,
        progress: gameState.ownedBlocks?.filter((b: any) => b.rarity === 'secret').length || 0,
        target: 1,
        reward: { type: 'money', amount: 100000 },
        rarity: 'epic',
        unlocked: gameState.ownedBlocks?.some((b: any) => b.rarity === 'secret') || false
      },
      {
        id: 'defender',
        name: 'Fortress Builder',
        description: 'Reach 500 defense strength',
        icon: Shield,
        progress: Math.min(gameState.defenseStrength || 0, 500),
        target: 500,
        reward: { type: 'power', amount: 50 },
        rarity: 'epic',
        unlocked: (gameState.defenseStrength || 0) >= 500
      }
    ]

    setAchievements(initialAchievements)
  }, [gameState])

  const handleClaimReward = (achievement: Achievement) => {
    if (achievement.unlocked) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      onClaimReward(achievement.id)
    }
  }

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
      case 'rare': return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      case 'epic': return 'text-purple-400 border-purple-500/30 bg-purple-500/10'
      case 'legendary': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      default: return 'text-gray-400'
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const completionPercentage = (unlockedCount / totalCount) * 100

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Achievements</CardTitle>
              <p className="text-sm text-slate-400">
                {unlockedCount} / {totalCount} Unlocked ({Math.round(completionPercentage)}%)
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={completionPercentage} className="h-3 bg-slate-700">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500" 
                 style={{ width: `${completionPercentage}%` }} />
          </Progress>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-purple-600' : ''}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'unlocked' ? 'default' : 'outline'}
            onClick={() => setFilter('unlocked')}
            className={filter === 'unlocked' ? 'bg-green-600' : ''}
          >
            Unlocked ({unlockedCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'locked' ? 'default' : 'outline'}
            onClick={() => setFilter('locked')}
            className={filter === 'locked' ? 'bg-slate-600' : ''}
          >
            Locked ({totalCount - unlockedCount})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {filteredAchievements.map((achievement) => {
              const Icon = achievement.icon
              const progress = (achievement.progress / achievement.target) * 100

              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-white">{achievement.name}</h4>
                          {achievement.unlocked && (
                            <Check className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">
                        {achievement.progress} / {achievement.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-700">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </Progress>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Gift className="h-4 w-4 text-yellow-400" />
                        <span className="text-slate-300">
                          +{achievement.reward.amount.toLocaleString()} {achievement.reward.type}
                        </span>
                      </div>
                      {achievement.unlocked ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaimReward(achievement)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          Claim Reward
                        </Button>
                      ) : (
                        <Lock className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
