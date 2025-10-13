
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle2, 
  Circle, 
  Gift, 
  Clock, 
  Star,
  Target,
  Sword,
  Coins,
  Shield,
  Zap
} from 'lucide-react'

interface Quest {
  id: string
  title: string
  description: string
  icon: any
  progress: number
  target: number
  reward: {
    type: 'money' | 'xp' | 'coins'
    amount: number
  }
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
}

interface DailyQuestsProps {
  gameState: any
  onCompleteQuest: (questId: string) => void
}

export function DailyQuests({ gameState, onCompleteQuest }: DailyQuestsProps) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [timeUntilReset, setTimeUntilReset] = useState('')

  useEffect(() => {
    // Initialize daily quests
    const dailyQuests: Quest[] = [
      {
        id: 'daily_claim_3',
        title: 'Block Collector',
        description: 'Claim 3 blocks from the arena',
        icon: Target,
        progress: 0,
        target: 3,
        reward: { type: 'money', amount: 10000 },
        difficulty: 'easy',
        completed: false
      },
      {
        id: 'daily_win_battle',
        title: 'Victory Rush',
        description: 'Win 2 battles against other players',
        icon: Sword,
        progress: 0,
        target: 2,
        reward: { type: 'xp', amount: 200 },
        difficulty: 'medium',
        completed: false
      },
      {
        id: 'daily_earn_money',
        title: 'Money Maker',
        description: 'Earn $25,000 from your blocks',
        icon: Coins,
        progress: Math.min(gameState.money || 0, 25000),
        target: 25000,
        reward: { type: 'money', amount: 15000 },
        difficulty: 'easy',
        completed: (gameState.money || 0) >= 25000
      },
      {
        id: 'daily_upgrade',
        title: 'Power Up',
        description: 'Purchase 2 upgrades from the store',
        icon: Zap,
        progress: 0,
        target: 2,
        reward: { type: 'coins', amount: 500 },
        difficulty: 'medium',
        completed: false
      },
      {
        id: 'daily_defense',
        title: 'Fortress Builder',
        description: 'Successfully defend against 1 raid',
        icon: Shield,
        progress: 0,
        target: 1,
        reward: { type: 'money', amount: 20000 },
        difficulty: 'hard',
        completed: false
      }
    ]

    setQuests(dailyQuests)

    // Calculate time until daily reset (midnight)
    const calculateTimeUntilReset = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      return `${hours}h ${minutes}m`
    }

    setTimeUntilReset(calculateTimeUntilReset())
    
    const timer = setInterval(() => {
      setTimeUntilReset(calculateTimeUntilReset())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [gameState])

  const completedCount = quests.filter(q => q.completed).length
  const totalQuests = quests.length
  const completionPercentage = (completedCount / totalQuests) * 100

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Star className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Daily Quests</CardTitle>
              <p className="text-sm text-slate-400">
                {completedCount} / {totalQuests} Completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-orange-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Resets in {timeUntilReset}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={completionPercentage} className="h-3 bg-slate-700">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                 style={{ width: `${completionPercentage}%` }} />
          </Progress>
        </div>

        {completedCount === totalQuests && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">All daily quests completed! 🎉</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-3">
            {quests.map((quest) => {
              const Icon = quest.icon
              const progress = (quest.progress / quest.target) * 100

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    quest.completed
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 opacity-75'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${quest.completed ? 'bg-green-500/20 border-green-500/30' : 'bg-cyan-500/20 border-cyan-500/30'}`}>
                        {quest.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Icon className="h-5 w-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{quest.title}</h4>
                        <p className="text-sm text-slate-400">{quest.description}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(quest.difficulty)}>
                      {quest.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">
                        {quest.progress} / {quest.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-700">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          quest.completed 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </Progress>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Gift className="h-4 w-4 text-yellow-400" />
                        <span className="text-slate-300">
                          +{quest.reward.amount.toLocaleString()} {quest.reward.type}
                        </span>
                      </div>
                      {quest.completed && (
                        <Button
                          size="sm"
                          onClick={() => onCompleteQuest(quest.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Claim
                        </Button>
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
