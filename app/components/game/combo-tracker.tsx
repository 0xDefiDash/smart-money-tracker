
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Zap, Trophy } from 'lucide-react'

interface ComboTrackerProps {
  comboCount: number
  maxCombo: number
  multiplier: number
}

export function ComboTracker({ comboCount, maxCombo, multiplier }: ComboTrackerProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (comboCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [comboCount])

  if (comboCount === 0) return null

  const comboPercentage = (comboCount / 10) * 100 // Max combo shown as 10

  return (
    <Card className={`fixed top-20 right-6 z-50 p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50 backdrop-blur-md transition-all duration-300 ${
      isAnimating ? 'scale-110' : 'scale-100'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 animate-pulse">
            <Flame className="h-6 w-6 text-white" />
          </div>
          {comboCount >= 5 && (
            <div className="absolute -top-1 -right-1">
              <Zap className="h-4 w-4 text-yellow-400 animate-bounce" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold text-lg">
              {comboCount}x COMBO!
            </span>
            {comboCount >= maxCombo && (
              <Trophy className="h-5 w-5 text-yellow-400" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              {multiplier}x Multiplier
            </Badge>
            {comboCount >= 5 && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black animate-pulse">
                ON FIRE! 🔥
              </Badge>
            )}
          </div>

          <Progress value={comboPercentage} className="h-2 bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${comboPercentage}%` }}
            />
          </Progress>
        </div>
      </div>

      <div className="mt-2 text-xs text-center text-orange-300">
        Keep winning to maintain your streak!
      </div>
    </Card>
  )
}
