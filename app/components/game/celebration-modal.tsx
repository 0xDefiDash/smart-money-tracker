
'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Star, Crown, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'

interface CelebrationModalProps {
  isOpen: boolean
  type: 'levelup' | 'achievement' | 'quest' | 'streak'
  title: string
  message: string
  rewards?: Array<{ type: string; amount: number }>
  onClose: () => void
}

export function CelebrationModal({ 
  isOpen, 
  type, 
  title, 
  message, 
  rewards,
  onClose 
}: CelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'levelup': return <Star className="h-20 w-20 text-yellow-400 animate-pulse" />
      case 'achievement': return <Trophy className="h-20 w-20 text-yellow-400 animate-bounce" />
      case 'quest': return <Zap className="h-20 w-20 text-cyan-400 animate-pulse" />
      case 'streak': return <Crown className="h-20 w-20 text-orange-400 animate-bounce" />
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20 animate-in zoom-in-95 duration-300">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {getIcon()}
              <div className="absolute inset-0 animate-ping opacity-75">
                {getIcon()}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            {title}
          </h2>

          {/* Message */}
          <p className="text-xl text-white">{message}</p>

          {/* Rewards */}
          {rewards && rewards.length > 0 && (
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400">Rewards Unlocked!</h3>
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 text-white">
                  <span className="text-2xl">
                    {reward.type === 'money' && '💰'}
                    {reward.type === 'xp' && '⭐'}
                    {reward.type === 'coins' && '🪙'}
                    {reward.type === 'power' && '⚡'}
                  </span>
                  <span className="text-lg font-bold">
                    +{reward.amount.toLocaleString()} {reward.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            size="lg"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg py-6"
          >
            Awesome! 🎉
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
