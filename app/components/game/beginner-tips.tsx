
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Lightbulb, TrendingUp, Shield, Target, Zap } from 'lucide-react'

export function BeginnerTips() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    // Check if user has dismissed tips
    const dismissed = localStorage.getItem('dashWars_tips_dismissed')
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const tips = [
    {
      icon: Target,
      title: "Start with Free Blocks",
      description: "Claim FREE common blocks from the Arena to start earning money!",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: TrendingUp,
      title: "Passive Income is Key",
      description: "Each block generates money automatically. More blocks = more money!",
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: Shield,
      title: "Upgrade Your Defense",
      description: "Higher defense protects your wealth from other players' attacks.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Zap,
      title: "Complete Daily Quests",
      description: "Easy rewards to boost your progress and climb the leaderboard!",
      color: "from-yellow-500/20 to-orange-500/20"
    }
  ]

  const handleDismiss = () => {
    localStorage.setItem('dashWars_tips_dismissed', 'true')
    setIsVisible(false)
  }

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length)
  }

  if (!isVisible) return null

  const tip = tips[currentTip]
  const Icon = tip.icon

  return (
    <Card className={`bg-gradient-to-r ${tip.color} border-neon-green/30 animate-in slide-in-from-top duration-500`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="bg-neon-gradient rounded-full p-2 flex-shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h3 className="font-bold text-sm">Pro Tip: {tip.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={nextTip}
                  className="text-xs h-7 px-2"
                >
                  Next Tip →
                </Button>
                <div className="flex space-x-1">
                  {tips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentTip ? 'bg-neon-green-bright' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 hover:bg-red-500/10 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
