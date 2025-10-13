
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Sword, Shield, Zap, Flame } from 'lucide-react'

interface BattleAnimationProps {
  isActive: boolean
  attackerName: string
  defenderName: string
  result: 'win' | 'loss'
  onComplete: () => void
}

export function BattleAnimation({ 
  isActive, 
  attackerName, 
  defenderName, 
  result,
  onComplete 
}: BattleAnimationProps) {
  const [phase, setPhase] = useState<'charge' | 'clash' | 'result'>('charge')

  useEffect(() => {
    if (!isActive) return

    const timeline = [
      { phase: 'charge', duration: 1000 },
      { phase: 'clash', duration: 800 },
      { phase: 'result', duration: 1500 }
    ]

    let currentIndex = 0

    const nextPhase = () => {
      if (currentIndex < timeline.length) {
        setPhase(timeline[currentIndex].phase as any)
        setTimeout(() => {
          currentIndex++
          if (currentIndex < timeline.length) {
            nextPhase()
          } else {
            setTimeout(onComplete, 500)
          }
        }, timeline[currentIndex].duration)
      }
    }

    nextPhase()
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <Card className="w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-red-500/50 p-8">
        {/* Battle Arena */}
        <div className="relative h-64 flex items-center justify-between">
          {/* Attacker */}
          <div className={`transition-all duration-1000 ${
            phase === 'charge' ? 'translate-x-0' : 
            phase === 'clash' ? 'translate-x-32' : 
            result === 'win' ? 'translate-x-32 scale-110' : 'translate-x-0 scale-90 opacity-50'
          }`}>
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/50">
                <Sword className="h-16 w-16 text-white" />
              </div>
              {phase === 'clash' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-24 w-24 text-yellow-400 animate-ping" />
                </div>
              )}
            </div>
            <p className="text-center mt-4 text-white font-bold text-xl">{attackerName}</p>
          </div>

          {/* Battle Effects */}
          {phase === 'clash' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Flame className="h-32 w-32 text-orange-500 animate-spin" />
                <Zap className="absolute inset-0 h-32 w-32 text-yellow-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Defender */}
          <div className={`transition-all duration-1000 ${
            phase === 'charge' ? 'translate-x-0' : 
            phase === 'clash' ? '-translate-x-32' : 
            result === 'loss' ? '-translate-x-32 scale-110' : 'translate-x-0 scale-90 opacity-50'
          }`}>
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Shield className="h-16 w-16 text-white" />
              </div>
              {phase === 'clash' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-24 w-24 text-cyan-400 animate-ping" />
                </div>
              )}
            </div>
            <p className="text-center mt-4 text-white font-bold text-xl">{defenderName}</p>
          </div>
        </div>

        {/* Result Message */}
        {phase === 'result' && (
          <div className="mt-8 text-center animate-in zoom-in-50 duration-500">
            <h2 className={`text-5xl font-bold mb-4 ${
              result === 'win' ? 'text-green-400' : 'text-red-400'
            }`}>
              {result === 'win' ? '🎯 VICTORY!' : '💥 DEFEATED!'}
            </h2>
            <p className="text-xl text-slate-300">
              {result === 'win' 
                ? `${attackerName} successfully raided ${defenderName}!` 
                : `${defenderName} defended against ${attackerName}!`
              }
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
