
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Zap, 
  Shield, 
  Sword, 
  Star, 
  Clock,
  TrendingUp,
  Eye,
  Lock,
  ShoppingCart
} from 'lucide-react'

interface PowerUp {
  id: string
  name: string
  description: string
  icon: any
  effect: string
  duration: number // in minutes
  price: number
  available: boolean
}

interface PowerUpsShopProps {
  gameState: any
  onPurchasePowerUp: (powerUpId: string) => void
}

export function PowerUpsShop({ gameState, onPurchasePowerUp }: PowerUpsShopProps) {
  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null)

  const powerUps: PowerUp[] = [
    {
      id: 'double_xp',
      name: 'Double XP',
      description: 'Earn 2x experience from all activities',
      icon: Star,
      effect: '+100% XP Gain',
      duration: 60,
      price: 15000,
      available: true
    },
    {
      id: 'money_boost',
      name: 'Money Multiplier',
      description: 'Increase passive income by 50%',
      icon: TrendingUp,
      effect: '+50% Money Generation',
      duration: 120,
      price: 25000,
      available: true
    },
    {
      id: 'shield_protection',
      name: 'Shield Barrier',
      description: 'Immune to all steal attempts',
      icon: Shield,
      effect: '100% Raid Protection',
      duration: 30,
      price: 35000,
      available: true
    },
    {
      id: 'attack_surge',
      name: 'Attack Surge',
      description: 'Increase attack power by 75%',
      icon: Sword,
      effect: '+75% Attack Power',
      duration: 45,
      price: 20000,
      available: true
    },
    {
      id: 'lucky_strike',
      name: 'Lucky Strike',
      description: 'Guaranteed success on next 3 raids',
      icon: Zap,
      effect: '3x Guaranteed Wins',
      duration: 0, // Instant use
      price: 50000,
      available: true
    },
    {
      id: 'time_warp',
      name: 'Time Warp',
      description: 'Reduce all cooldowns by 50%',
      icon: Clock,
      effect: '-50% Cooldowns',
      duration: 90,
      price: 30000,
      available: true
    },
    {
      id: 'eagle_eye',
      name: 'Eagle Eye',
      description: 'See hidden player stats and vulnerabilities',
      icon: Eye,
      effect: 'Enhanced Vision',
      duration: 60,
      price: 18000,
      available: true
    }
  ]

  const canAfford = (price: number) => {
    return (gameState.money || 0) >= price
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <ShoppingCart className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Power-Ups Shop</CardTitle>
            <p className="text-sm text-slate-400">Temporary boosts to dominate the battlefield</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Your Balance:</span>
            <span className="text-green-400 font-bold text-lg">
              ${(gameState.money || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {powerUps.map((powerUp) => {
              const Icon = powerUp.icon
              const affordable = canAfford(powerUp.price)

              return (
                <div
                  key={powerUp.id}
                  className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                    selectedPowerUp?.id === powerUp.id
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30'
                  }`}
                  onClick={() => setSelectedPowerUp(powerUp)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                        <Icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{powerUp.name}</h4>
                        <p className="text-xs text-slate-400">{powerUp.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-green-400 font-medium">{powerUp.effect}</span>
                    </div>
                    {powerUp.duration > 0 && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-300">{powerUp.duration} minutes</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-sm">Price:</span>
                      <span className={`font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                        ${powerUp.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (affordable) {
                          onPurchasePowerUp(powerUp.id)
                        }
                      }}
                      disabled={!affordable}
                      className={affordable 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }
                    >
                      {affordable ? 'Buy Now' : <Lock className="h-4 w-4" />}
                    </Button>
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
