
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Gift, 
  Calendar, 
  Star, 
  Flame,
  Crown,
  CheckCircle2,
  Lock
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface DailyReward {
  day: number
  reward: {
    type: 'money' | 'coins' | 'xp' | 'powerup'
    amount: number
    name?: string
  }
  claimed: boolean
  available: boolean
}

interface DailyRewardsProps {
  currentStreak: number
  onClaimReward: (day: number) => void
}

export function DailyRewards({ currentStreak, onClaimReward }: DailyRewardsProps) {
  const [rewards, setRewards] = useState<DailyReward[]>([])
  const [canClaimToday, setCanClaimToday] = useState(true)

  useEffect(() => {
    // Initialize 7-day rewards
    const dailyRewards: DailyReward[] = [
      {
        day: 1,
        reward: { type: 'money', amount: 10000 },
        claimed: currentStreak >= 1,
        available: currentStreak === 0
      },
      {
        day: 2,
        reward: { type: 'coins', amount: 500 },
        claimed: currentStreak >= 2,
        available: currentStreak === 1
      },
      {
        day: 3,
        reward: { type: 'xp', amount: 300 },
        claimed: currentStreak >= 3,
        available: currentStreak === 2
      },
      {
        day: 4,
        reward: { type: 'money', amount: 25000 },
        claimed: currentStreak >= 4,
        available: currentStreak === 3
      },
      {
        day: 5,
        reward: { type: 'powerup', amount: 1, name: 'Lucky Strike' },
        claimed: currentStreak >= 5,
        available: currentStreak === 4
      },
      {
        day: 6,
        reward: { type: 'money', amount: 50000 },
        claimed: currentStreak >= 6,
        available: currentStreak === 5
      },
      {
        day: 7,
        reward: { type: 'money', amount: 100000 },
        claimed: currentStreak >= 7,
        available: currentStreak === 6
      }
    ]

    setRewards(dailyRewards)
  }, [currentStreak])

  const handleClaimReward = (day: number) => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    })
    onClaimReward(day)
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'money': return '💰'
      case 'coins': return '🪙'
      case 'xp': return '⭐'
      case 'powerup': return '⚡'
      default: return '🎁'
    }
  }

  const getRewardColor = (day: number) => {
    if (day === 7) return 'from-yellow-500 to-orange-500'
    if (day >= 5) return 'from-purple-500 to-pink-500'
    if (day >= 3) return 'from-blue-500 to-cyan-500'
    return 'from-green-500 to-emerald-500'
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-green-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <Gift className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Daily Rewards</CardTitle>
              <p className="text-sm text-slate-400">Login daily to claim amazing rewards!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-bold text-lg">{currentStreak} Day Streak</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {rewards.map((reward) => {
            const isSpecial = reward.day === 7
            
            return (
              <div
                key={reward.day}
                className={`relative p-4 rounded-lg border transition-all duration-300 ${
                  reward.claimed
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
                    : reward.available
                    ? `bg-gradient-to-br ${getRewardColor(reward.day)}/20 border-${reward.day === 7 ? 'yellow' : 'blue'}-500/50 shadow-lg animate-pulse`
                    : 'bg-slate-800/30 border-slate-700/50 opacity-50'
                }`}
              >
                {isSpecial && !reward.claimed && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="h-6 w-6 text-yellow-400 animate-bounce" />
                  </div>
                )}

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <Badge className={reward.claimed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                      Day {reward.day}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-center text-4xl">
                    {reward.claimed ? (
                      <CheckCircle2 className="h-12 w-12 text-green-400" />
                    ) : reward.available ? (
                      <div className="animate-bounce">{getRewardIcon(reward.reward.type)}</div>
                    ) : (
                      <Lock className="h-8 w-8 text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">
                      {reward.reward.type === 'powerup' ? reward.reward.name : reward.reward.type.toUpperCase()}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {reward.reward.type === 'powerup' 
                        ? '1x Item' 
                        : `${reward.reward.amount.toLocaleString()}`
                      }
                    </div>
                  </div>

                  {reward.available && !reward.claimed && (
                    <Button
                      size="sm"
                      onClick={() => handleClaimReward(reward.day)}
                      className={`w-full bg-gradient-to-r ${getRewardColor(reward.day)} hover:opacity-90`}
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {currentStreak === 7 && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-400" />
              <div>
                <h4 className="text-white font-bold">Perfect Week! 🎉</h4>
                <p className="text-sm text-slate-300">
                  You've claimed all 7 daily rewards. The streak resets tomorrow!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center space-x-2 text-sm text-blue-400">
            <Calendar className="h-4 w-4" />
            <span>
              {currentStreak < 7 
                ? `Come back tomorrow to continue your streak and claim bigger rewards!`
                : `Amazing! You've completed a full week. Start fresh tomorrow!`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
