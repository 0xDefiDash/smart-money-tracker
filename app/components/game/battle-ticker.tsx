
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sword, 
  Shield, 
  Crown, 
  Target, 
  Zap, 
  TrendingUp,
  Users,
  Flame,
  Star
} from 'lucide-react'

interface BattleEvent {
  id: string
  timestamp: number
  type: 'block_steal' | 'money_steal' | 'defense' | 'victory' | 'defeat'
  attacker: {
    name: string
    level: number
    power: number
  }
  target: {
    name: string
    level: number
    defense: number
  }
  details: {
    blockName?: string
    blockRarity?: string
    amountStolen?: number
    attackType?: string
    success: boolean
  }
}

// Mock battle events that cycle through
const MOCK_BATTLES: BattleEvent[] = [
  {
    id: '1',
    timestamp: Date.now() - 30000,
    type: 'block_steal',
    attacker: { name: 'CryptoNinja', level: 15, power: 95 },
    target: { name: 'BlockHodler', level: 12, defense: 75 },
    details: { blockName: 'Bitcoin Block', blockRarity: 'epic', attackType: 'Stealth Strike', success: true }
  },
  {
    id: '2',
    timestamp: Date.now() - 60000,
    type: 'money_steal',
    attacker: { name: 'WhaleHunter', level: 22, power: 130 },
    target: { name: 'DiamondHands', level: 18, defense: 110 },
    details: { amountStolen: 45000, attackType: 'Calculated Strike', success: true }
  },
  {
    id: '3',
    timestamp: Date.now() - 90000,
    type: 'defeat',
    attacker: { name: 'RookieTrader', level: 8, power: 55 },
    target: { name: 'FortressMode', level: 25, defense: 160 },
    details: { blockName: 'Ethereum Block', blockRarity: 'rare', attackType: 'Direct Assault', success: false }
  },
  {
    id: '4',
    timestamp: Date.now() - 120000,
    type: 'victory',
    attacker: { name: 'BlockWarrior', level: 28, power: 145 },
    target: { name: 'CryptoVault', level: 20, defense: 125 },
    details: { blockName: 'Legendary Solana Block', blockRarity: 'legendary', attackType: 'Calculated Strike', success: true }
  },
  {
    id: '5',
    timestamp: Date.now() - 150000,
    type: 'money_steal',
    attacker: { name: 'StealthMaster', level: 19, power: 115 },
    target: { name: 'MoneyVault', level: 16, defense: 95 },
    details: { amountStolen: 28500, attackType: 'Stealth Strike', success: true }
  },
  {
    id: '6',
    timestamp: Date.now() - 180000,
    type: 'defense',
    attacker: { name: 'BlitzAttack', level: 13, power: 78 },
    target: { name: 'ShieldWall', level: 17, defense: 140 },
    details: { blockName: 'Cardano Block', blockRarity: 'rare', attackType: 'Direct Assault', success: false }
  }
]

export function BattleTicker() {
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [activeBattles, setActiveBattles] = useState<BattleEvent[]>([])

  // Cycle through battle announcements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBattleIndex(prev => (prev + 1) % MOCK_BATTLES.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [])

  // Simulate active battles
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new "active" battles
      if (Math.random() > 0.7 && activeBattles.length < 3) {
        const battleTemplate = MOCK_BATTLES[Math.floor(Math.random() * MOCK_BATTLES.length)]
        const newBattle: BattleEvent = {
          ...battleTemplate,
          id: `active_${Date.now()}`,
          timestamp: Date.now()
        }
        setActiveBattles(prev => [newBattle, ...prev.slice(0, 2)])
      }
      
      // Remove old battles
      setActiveBattles(prev => prev.filter(battle => Date.now() - battle.timestamp < 60000)) // Keep for 1 minute
    }, 8000)

    return () => clearInterval(interval)
  }, [activeBattles.length])

  const currentBattle = MOCK_BATTLES[currentBattleIndex]
  
  const getBattleEmoji = (type: string, success: boolean) => {
    if (type === 'money_steal' && success) return '💰'
    if (type === 'block_steal' && success) return '🎯'
    if (type === 'victory') return '🏆'
    if (type === 'defeat' || !success) return '💥'
    if (type === 'defense') return '🛡️'
    return '⚔️'
  }

  const getBattleMessage = (battle: BattleEvent) => {
    const emoji = getBattleEmoji(battle.type, battle.details.success)
    
    if (battle.type === 'money_steal' && battle.details.success) {
      return `${emoji} ${battle.attacker.name} stole $${battle.details.amountStolen?.toLocaleString()} from ${battle.target.name} using ${battle.details.attackType}!`
    }
    
    if (battle.type === 'block_steal' && battle.details.success) {
      return `${emoji} ${battle.attacker.name} captured ${battle.details.blockName} (${battle.details.blockRarity}) from ${battle.target.name}!`
    }
    
    if (battle.type === 'defeat' || !battle.details.success) {
      return `${emoji} ${battle.attacker.name}'s ${battle.details.attackType} failed against ${battle.target.name}'s defenses!`
    }
    
    if (battle.type === 'victory') {
      return `${emoji} LEGENDARY VICTORY! ${battle.attacker.name} conquered ${battle.details.blockName} from ${battle.target.name}!`
    }
    
    return `${emoji} ${battle.attacker.name} vs ${battle.target.name} - Battle in progress...`
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-400 to-pink-500'
      case 'rare': return 'from-blue-400 to-cyan-500'
      case 'common': return 'from-gray-400 to-gray-500'
      default: return 'from-green-400 to-blue-500'
    }
  }

  return (
    <div className="space-y-3">
      {/* Rolling Battle Ticker */}
      <Card className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/30 overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Sword className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">LIVE BATTLES</span>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-sm font-medium text-white">
                  {getBattleMessage(currentBattle)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`bg-gradient-to-r ${getRarityColor(currentBattle.details.blockRarity)} text-white border-0 text-xs`}
              >
                <Crown className="w-3 h-3 mr-1" />
                Lv.{currentBattle.attacker.level}
              </Badge>
              <div className={`w-2 h-2 rounded-full animate-pulse ${currentBattle.details.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Battles Feed */}
      {activeBattles.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-semibold text-purple-400">Active Battles ({activeBattles.length})</span>
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                <Flame className="w-3 h-3 mr-1" />
                HAPPENING NOW
              </Badge>
            </div>
            
            <div className="space-y-2">
              {activeBattles.slice(0, 3).map((battle, index) => (
                <div 
                  key={battle.id}
                  className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg border border-gray-700/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {getBattleEmoji(battle.type, battle.details.success)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-400">{battle.attacker.name}</span>
                        <Sword className="w-3 h-3 text-red-400" />
                        <span className="text-sm font-medium text-orange-400">{battle.target.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Lv.{battle.attacker.level} ({battle.attacker.power} ATK)</span>
                        <span>vs</span>
                        <span>Lv.{battle.target.level} ({battle.target.defense} DEF)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {battle.details.attackType || 'Direct'}
                    </Badge>
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-spin text-white text-xs font-bold">
                      ⚔️
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Battle Stats Overview */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-green-400">847</div>
            <div className="text-xs text-muted-foreground">Battles Today</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-blue-400">63%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-900/20 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-purple-400">23</div>
            <div className="text-xs text-muted-foreground">Active Now</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">$2.1M</div>
            <div className="text-xs text-muted-foreground">Stolen Today</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
