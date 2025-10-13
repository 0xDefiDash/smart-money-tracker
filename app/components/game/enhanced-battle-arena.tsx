
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BattleTicker } from './battle-ticker'
import { 
  Sword, 
  Shield, 
  Target, 
  Users,
  Zap,
  TrendingUp,
  Crown,
  AlertTriangle,
  Clock,
  Star,
  Flame,
  Eye,
  Lock,
  CheckCircle,
  XCircle,
  Activity,
  Crosshair,
  Timer,
  Sparkles
} from 'lucide-react'

interface GameState {
  playerId: string
  coins: number
  money: number
  level: number
  experience: number
  ownedBlocks: any[]
  defenseStrength: number
  attackPower: number
  lastSpawn: number
  nextSpawn: number
  lastMoneyUpdate: number
  upgrades?: { [key: string]: number }
  upgradeEffects?: {
    attackPowerBonus: number
    defenseStrengthBonus: number
    stealSuccessBonus: number
    blockProtectionBonus: number
    moneyMultiplierBonus: number
    collectionSizeBonus: number
    earlyDetection: boolean
    stealInsurance: boolean
  }
}

interface EnhancedBattleArenaProps {
  gameState: GameState
  onStealBlock: (block: any, attackType: string) => void
  onStealMoney: (enemyId: string, attackType: string) => void
  onDefendBlocks: () => void
  isLoading: boolean
  battleLog: string[]
  setBattleLog: (log: string[] | ((prev: string[]) => string[])) => void
}

type AttackType = 'stealth' | 'direct' | 'calculated'

interface AttackTypeInfo {
  name: string
  icon: React.ReactNode
  description: string
  costMultiplier: number
  successModifier: number
  cooldown: number
  color: string
}

// Strategic attack types
const ATTACK_TYPES: Record<AttackType, AttackTypeInfo> = {
  stealth: {
    name: 'Stealth Strike',
    icon: <Eye className="w-4 h-4" />,
    description: 'Silent approach with lower cost but reduced effectiveness',
    costMultiplier: 0.7,
    successModifier: -5,
    cooldown: 30,
    color: '#10B981'
  },
  direct: {
    name: 'Direct Assault',
    icon: <Sword className="w-4 h-4" />,
    description: 'Frontal attack with balanced cost and effectiveness',
    costMultiplier: 1.0,
    successModifier: 0,
    cooldown: 60,
    color: '#EF4444'
  },
  calculated: {
    name: 'Calculated Strike',
    icon: <Target className="w-4 h-4" />,
    description: 'Precision attack with higher cost but increased success',
    costMultiplier: 1.5,
    successModifier: 15,
    cooldown: 90,
    color: '#8B5CF6'
  }
}

// Enhanced enemy players with battle status
const ENHANCED_ENEMIES = [
  {
    id: 'enemy_1',
    name: 'CryptoNovice',
    level: 8,
    defenseStrength: 65,
    money: 12500,
    reputation: 'Newcomer',
    lastSeen: 'Online',
    battleStatus: 'idle' as 'idle' | 'battling' | 'defending',
    wins: 12,
    losses: 8,
    blocks: [{
      id: 'enemy_block_1',
      name: 'Dogecoin Block',
      type: 'doge',
      rarity: 'common' as const,
      value: 120,
      power: 45,
      defense: 35,
      image: '🐕',
      color: '#C2A633',
      description: 'A humble Dogecoin block - perfect for beginners',
      owner: 'enemy_1',
      isStealable: true,
      spawnTime: Date.now() - 120000,
      traits: ['Common rarity', 'DOGE power']
    }]
  },
  {
    id: 'enemy_2',
    name: 'BlockHunter',
    level: 15,
    defenseStrength: 95,
    money: 28750,
    reputation: 'Experienced',
    lastSeen: '2m ago',
    battleStatus: 'battling' as 'idle' | 'battling' | 'defending',
    wins: 34,
    losses: 12,
    blocks: [{
      id: 'enemy_block_2',
      name: 'Ethereum Block',
      type: 'eth',
      rarity: 'rare' as const,
      value: 280,
      power: 70,
      defense: 55,
      image: 'Ξ',
      color: '#627EEA',
      description: 'Fortified Ethereum block with smart defenses',
      owner: 'enemy_2',
      isStealable: true,
      spawnTime: Date.now() - 180000,
      traits: ['Rare rarity', 'ETH power', 'Smart Defense']
    }]
  },
  {
    id: 'enemy_3',
    name: 'CryptoWarrior',
    level: 22,
    defenseStrength: 130,
    money: 67500,
    reputation: 'Veteran',
    lastSeen: '10m ago',
    battleStatus: 'defending' as 'idle' | 'battling' | 'defending',
    wins: 67,
    losses: 23,
    blocks: [{
      id: 'enemy_block_3',
      name: 'Bitcoin Block',
      type: 'btc',
      rarity: 'epic' as const,
      value: 450,
      power: 95,
      defense: 75,
      image: '₿',
      color: '#F7931A',
      description: 'Legendary Bitcoin fortress with quantum encryption',
      owner: 'enemy_3',
      isStealable: true,
      spawnTime: Date.now() - 300000,
      traits: ['Epic rarity', 'BTC power', 'Fortress Defense']
    }]
  },
  {
    id: 'enemy_4',
    name: 'WhaleKiller',
    level: 35,
    defenseStrength: 180,
    money: 142500,
    reputation: 'Champion',
    lastSeen: 'Online',
    battleStatus: 'battling' as 'idle' | 'battling' | 'defending',
    wins: 156,
    losses: 34,
    blocks: [{
      id: 'enemy_block_4',
      name: 'Secret Solana Block',
      type: 'sol',
      rarity: 'legendary' as const,
      value: 850,
      power: 120,
      defense: 100,
      image: '◎',
      color: '#9945FF',
      description: 'Ultra-rare Solana block with quantum shield - ultimate prize',
      owner: 'enemy_4',
      isStealable: true,
      spawnTime: Date.now() - 600000,
      traits: ['Legendary rarity', 'SOL power', 'Quantum Shield', 'Master Tier']
    }]
  }
]

export function EnhancedBattleArena({ 
  gameState, 
  onStealBlock, 
  onStealMoney, 
  onDefendBlocks, 
  isLoading,
  battleLog,
  setBattleLog 
}: EnhancedBattleArenaProps) {
  const [selectedTarget, setSelectedTarget] = useState<{ blockId: string; attackType: AttackType } | null>(null)
  const [attackCooldowns, setAttackCooldowns] = useState<Record<AttackType, number>>({
    stealth: 0,
    direct: 0,
    calculated: 0
  })
  const [battleAnimation, setBattleAnimation] = useState<string | null>(null)
  const [enemies, setEnemies] = useState(ENHANCED_ENEMIES)

  // Update cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackCooldowns(prev => ({
        stealth: Math.max(0, prev.stealth - 1),
        direct: Math.max(0, prev.direct - 1),
        calculated: Math.max(0, prev.calculated - 1)
      }))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Simulate dynamic enemy status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        battleStatus: Math.random() > 0.7 ? 
          (['idle', 'battling', 'defending'] as const)[Math.floor(Math.random() * 3)] : 
          enemy.battleStatus,
        lastSeen: Math.random() > 0.5 ? 'Online' : `${Math.floor(Math.random() * 30) + 1}m ago`
      })))
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [])

  // Calculate total attack power including bonuses
  const getTotalAttackPower = () => {
    return gameState.attackPower + (gameState.upgradeEffects?.attackPowerBonus || 0)
  }

  // Calculate total defense strength including bonuses  
  const getTotalDefenseStrength = () => {
    return gameState.defenseStrength + (gameState.upgradeEffects?.defenseStrengthBonus || 0)
  }

  // Check if player can attempt to steal from target
  const canAttemptSteal = (targetDefense: number) => {
    return getTotalAttackPower() > targetDefense
  }

  // Calculate success rate
  const calculateSuccessRate = (playerPower: number, targetDefense: number, attackType: AttackType) => {
    if (playerPower <= targetDefense) return 0
    
    const powerAdvantage = playerPower - targetDefense
    const baseSuccessRate = Math.min(85, 45 + (powerAdvantage * 2))
    const attackModifier = ATTACK_TYPES[attackType].successModifier
    const upgradeBonus = gameState.upgradeEffects?.stealSuccessBonus || 0
    
    return Math.max(10, Math.min(95, baseSuccessRate + attackModifier + upgradeBonus))
  }

  // Calculate attack cost
  const calculateAttackCost = (blockValue: number, attackType: AttackType) => {
    const baseCost = Math.floor(blockValue * 0.15)
    const typeCostMultiplier = ATTACK_TYPES[attackType].costMultiplier
    return Math.floor(baseCost * typeCostMultiplier)
  }

  // Enhanced steal attempt with animation
  const handleStealAttempt = (block: any, attackType: AttackType) => {
    setBattleAnimation(`attacking_${block.id}`)
    const cooldownTime = ATTACK_TYPES[attackType].cooldown
    setAttackCooldowns(prev => ({ ...prev, [attackType]: cooldownTime }))
    
    // Add battle announcement
    const enemy = enemies.find(e => e.id === block.owner)
    setBattleLog(prev => [...prev, `⚔️ ${gameState.playerId} launches ${ATTACK_TYPES[attackType].name} against ${enemy?.name}'s ${block.name}!`])
    
    onStealBlock(block, attackType)
    
    // Clear animation after 2 seconds
    setTimeout(() => setBattleAnimation(null), 2000)
  }

  // Enhanced money steal with animation
  const handleMoneySteal = (enemyId: string, attackType: AttackType) => {
    setBattleAnimation(`stealing_${enemyId}`)
    const cooldownTime = ATTACK_TYPES[attackType].cooldown
    setAttackCooldowns(prev => ({ ...prev, [attackType]: cooldownTime }))
    
    // Add battle announcement
    const enemy = enemies.find(e => e.id === enemyId)
    setBattleLog(prev => [...prev, `💰 ${gameState.playerId} targets ${enemy?.name}'s treasury with ${ATTACK_TYPES[attackType].name}!`])
    
    onStealMoney(enemyId, attackType)
    
    // Clear animation after 2 seconds
    setTimeout(() => setBattleAnimation(null), 2000)
  }

  const getBattleStatusColor = (status: string) => {
    switch (status) {
      case 'battling': return 'text-red-400 bg-red-500/20'
      case 'defending': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-green-400 bg-green-500/20'
    }
  }

  const getBattleStatusIcon = (status: string) => {
    switch (status) {
      case 'battling': return <Sword className="w-3 h-3" />
      case 'defending': return <Shield className="w-3 h-3" />
      default: return <CheckCircle className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Battle Ticker - Rolling announcements */}
      <BattleTicker />

      {/* Enhanced Combat Stats with Real-time Updates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-50"></div>
          <CardContent className="p-4 text-center relative z-10">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <Sword className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400">{getTotalAttackPower()}</p>
            <p className="text-xs text-muted-foreground">Attack Power</p>
            {(gameState.upgradeEffects?.attackPowerBonus || 0) > 0 && (
              <Badge variant="outline" className="text-xs mt-1 border-red-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                +{gameState.upgradeEffects?.attackPowerBonus}
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-50"></div>
          <CardContent className="p-4 text-center relative z-10">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-400">{getTotalDefenseStrength()}</p>
            <p className="text-xs text-muted-foreground">Defense Power</p>
            {(gameState.upgradeEffects?.defenseStrengthBonus || 0) > 0 && (
              <Badge variant="outline" className="text-xs mt-1 border-blue-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                +{gameState.upgradeEffects?.defenseStrengthBonus}
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-50"></div>
          <CardContent className="p-4 text-center relative z-10">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400">{gameState.ownedBlocks.length}</p>
            <p className="text-xs text-muted-foreground">Protected Blocks</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-600/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-50"></div>
          <CardContent className="p-4 text-center relative z-10">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400">{gameState.level}</p>
            <p className="text-xs text-muted-foreground">Battle Rank</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="arena" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="arena" className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4" />
            <span>Arena</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Live Battles</span>
          </TabsTrigger>
          <TabsTrigger value="defend" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Defense</span>
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Strategy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arena" className="space-y-4">
          <Card className="border-orange-500/30 bg-gradient-to-r from-orange-900/20 to-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Battle Arena - Choose Your Target</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ⚔️ <strong>Power Rule:</strong> Attack Power must exceed enemy Defense to engage | 
                💰 <strong>Money Heists:</strong> Steal directly from enemy treasuries | 
                🎯 <strong>Block Raids:</strong> Capture valuable blocks
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {enemies.map((enemy) => {
                    const canTarget = canAttemptSteal(enemy.defenseStrength)
                    const isAnimating = battleAnimation?.includes(enemy.id)
                    
                    return (
                      <div 
                        key={enemy.id} 
                        className={`border rounded-xl p-5 transition-all duration-300 ${
                          !canTarget ? 'opacity-60 bg-gray-500/5' : 'bg-gradient-to-r from-gray-800/40 to-gray-900/40'
                        } ${isAnimating ? 'border-orange-500 bg-orange-500/10 animate-pulse' : ''}`}
                      >
                        {/* Enemy Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Crown className="w-6 h-6 text-white" />
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                                enemy.lastSeen === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-lg flex items-center space-x-2">
                                <span>{enemy.name}</span>
                                <Badge variant={canTarget ? "default" : "secondary"} className="text-xs">
                                  Lv.{enemy.level}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getBattleStatusColor(enemy.battleStatus)} border-0`}
                                >
                                  {getBattleStatusIcon(enemy.battleStatus)}
                                  {enemy.battleStatus.toUpperCase()}
                                </Badge>
                              </h3>
                              
                              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Shield className="w-4 h-4" />
                                  <span>DEF: {enemy.defenseStrength}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>{enemy.wins}W/{enemy.losses}L</span>
                                </div>
                                <span className={canTarget ? 'text-green-500 font-semibold' : 'text-red-500'}>
                                  {canTarget ? '✓ VULNERABLE' : '✗ TOO STRONG'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-3 text-xs mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {enemy.reputation}
                                </Badge>
                                <span className="text-muted-foreground">Last seen: {enemy.lastSeen}</span>
                              </div>
                            </div>
                          </div>
                          
                          {!canTarget && (
                            <div className="text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <Lock className="w-6 h-6 mx-auto text-red-500 mb-2" />
                              <p className="text-xs text-red-500 font-medium">LOCKED</p>
                              <p className="text-xs text-red-400">Need {enemy.defenseStrength + 1} ATK</p>
                            </div>
                          )}
                        </div>

                        {canTarget && (
                          <>
                            {/* Money Heist Section */}
                            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                    💰
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-green-400 text-lg">Treasury Heist</h4>
                                    <p className="text-xs text-green-300/80">
                                      Target Treasury: <span className="font-semibold">${enemy.money.toLocaleString()}</span>
                                    </p>
                                  </div>
                                </div>
                                {enemy.battleStatus === 'battling' && (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                    <Activity className="w-3 h-3 mr-1 animate-pulse" />
                                    BUSY
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(Object.keys(ATTACK_TYPES) as AttackType[]).map((attackType) => {
                                  const attackInfo = ATTACK_TYPES[attackType]
                                  const cost = Math.floor(enemy.money * 0.08 * attackInfo.costMultiplier)
                                  const successRate = calculateSuccessRate(getTotalAttackPower(), enemy.defenseStrength, attackType)
                                  const potentialSteal = Math.floor(enemy.money * (0.15 + (successRate / 1000)))
                                  const isOnCooldown = attackCooldowns[attackType] > 0
                                  const canAfford = gameState.money >= cost
                                  const isBusy = enemy.battleStatus === 'battling'
                                  
                                  return (
                                    <div key={attackType} className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span style={{ color: attackInfo.color }}>
                                          {attackInfo.icon}
                                        </span>
                                        <span className="text-sm font-semibold">{attackInfo.name}</span>
                                      </div>
                                      
                                      <div className="space-y-1 text-xs mb-3">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Success Rate:</span>
                                          <span className={`font-bold ${
                                            successRate > 70 ? 'text-green-400' : 
                                            successRate > 40 ? 'text-yellow-400' : 'text-red-400'
                                          }`}>
                                            {successRate}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Attack Cost:</span>
                                          <span className="font-medium">${cost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Potential Loot:</span>
                                          <span className="text-green-400 font-bold">${potentialSteal.toLocaleString()}</span>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        size="sm"
                                        className="w-full text-xs font-bold"
                                        style={{ 
                                          backgroundColor: `${attackInfo.color}20`, 
                                          borderColor: attackInfo.color,
                                          color: attackInfo.color 
                                        }}
                                        onClick={() => handleMoneySteal(enemy.id, attackType)}
                                        disabled={isLoading || !canAfford || isOnCooldown || isBusy}
                                      >
                                        {isOnCooldown ? (
                                          <><Timer className="w-3 h-3 mr-1" />{attackCooldowns[attackType]}s</>
                                        ) : isBusy ? (
                                          'TARGET BUSY'
                                        ) : !canAfford ? (
                                          'INSUFFICIENT FUNDS'
                                        ) : (
                                          <>💰 HEIST NOW</>
                                        )}
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Block Raid Section */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                <h4 className="font-bold text-purple-400">Block Collection Raid</h4>
                              </div>
                              
                              {enemy.blocks.map((block) => (
                                <div 
                                  key={block.id} 
                                  className={`bg-gradient-to-r from-gray-800/60 to-gray-900/40 border rounded-lg p-4 ${
                                    battleAnimation === `attacking_${block.id}` ? 'border-orange-500 animate-pulse' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-4 mb-4">
                                    <div 
                                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2"
                                      style={{ 
                                        backgroundColor: `${block.color}15`, 
                                        color: block.color,
                                        borderColor: `${block.color}40`
                                      }}
                                    >
                                      {block.image}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-bold text-lg">{block.name}</h5>
                                      <div className="flex items-center space-x-3">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs capitalize ${
                                            block.rarity === 'legendary' ? 'border-yellow-500/50 text-yellow-400' :
                                            block.rarity === 'epic' ? 'border-purple-500/50 text-purple-400' :
                                            block.rarity === 'rare' ? 'border-blue-500/50 text-blue-400' :
                                            'border-gray-500/50 text-gray-400'
                                          }`}
                                        >
                                          <Star className="w-3 h-3 mr-1" />
                                          {block.rarity}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          Value: <span className="font-semibold">${block.value.toLocaleString()}</span>
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">{block.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {(Object.keys(ATTACK_TYPES) as AttackType[]).map((attackType) => {
                                      const attackInfo = ATTACK_TYPES[attackType]
                                      const cost = calculateAttackCost(block.value, attackType)
                                      const successRate = calculateSuccessRate(getTotalAttackPower(), enemy.defenseStrength, attackType)
                                      const isOnCooldown = attackCooldowns[attackType] > 0
                                      const canAfford = gameState.money >= cost
                                      const isBusy = enemy.battleStatus === 'defending'
                                      
                                      return (
                                        <div key={attackType} className="border rounded-lg p-3 bg-gray-800/20">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <span style={{ color: attackInfo.color }}>
                                              {attackInfo.icon}
                                            </span>
                                            <span className="text-sm font-semibold">{attackInfo.name}</span>
                                          </div>
                                          
                                          <div className="space-y-1 text-xs mb-3">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Success Rate:</span>
                                              <span className={`font-bold ${
                                                successRate > 70 ? 'text-green-400' : 
                                                successRate > 40 ? 'text-yellow-400' : 'text-red-400'
                                              }`}>
                                                {successRate}%
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Attack Cost:</span>
                                              <span className="font-medium">${cost.toLocaleString()}</span>
                                            </div>
                                          </div>
                                          
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs font-bold"
                                            style={{ borderColor: attackInfo.color, color: attackInfo.color }}
                                            onClick={() => handleStealAttempt(block, attackType)}
                                            disabled={isLoading || !canAfford || isOnCooldown || isBusy}
                                          >
                                            {isOnCooldown ? (
                                              <><Timer className="w-3 h-3 mr-1" />{attackCooldowns[attackType]}s</>
                                            ) : isBusy ? (
                                              '🛡️ DEFENDING'
                                            ) : !canAfford ? (
                                              'TOO EXPENSIVE'
                                            ) : (
                                              <>⚔️ RAID</>
                                            )}
                                          </Button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {!canTarget && (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Lock className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>{enemy.name}</strong> is too powerful for your current attack strength.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Visit the Store to upgrade your Attack Power and challenge stronger enemies.
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-500 animate-pulse" />
                <span>Live Battle Feed</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  LIVE
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time battles happening across the Dash Wars universe
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {battleLog.slice(-10).reverse().map((log, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 animate-fadeIn"
                  >
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      {log.includes('💰') ? '💰' : log.includes('🎯') ? '🎯' : log.includes('💥') ? '💥' : '⚔️'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{log}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor((index + 1) * 0.5)}m ago
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Fortress Defense Command Center</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Shield className="w-16 h-16 text-blue-500" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
                </div>
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Defense Rating: {getTotalDefenseStrength()}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-blue-400">Protection Status</h4>
                    <Progress value={Math.min(100, (getTotalDefenseStrength() / 200) * 100)} className="mb-2" />
                    <p className="text-sm font-medium">
                      {getTotalDefenseStrength() < 80 ? '🚨 VULNERABLE' : 
                       getTotalDefenseStrength() < 120 ? '✅ PROTECTED' : 
                       getTotalDefenseStrength() < 160 ? '🛡️ FORTIFIED' : '👑 LEGENDARY'}
                    </p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-green-400">Threat Assessment</h4>
                    <div className="flex items-center justify-center mb-2">
                      {getTotalDefenseStrength() < 80 ? (
                        <><XCircle className="w-6 h-6 text-red-500 mr-2" /><span className="text-red-500 font-bold">HIGH RISK</span></>
                      ) : getTotalDefenseStrength() < 120 ? (
                        <><AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" /><span className="text-yellow-500 font-bold">MODERATE</span></>
                      ) : (
                        <><CheckCircle className="w-6 h-6 text-green-500 mr-2" /><span className="text-green-500 font-bold">MINIMAL</span></>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Current danger level</p>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={onDefendBlocks}
                  disabled={isLoading || gameState.coins < 100}
                  className="w-full mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {gameState.coins < 100 ? 'Need 100 Coins' : 'Strengthen Fortress (+20 DEF) - 100 coins'}
                </Button>

                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center text-yellow-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Defense Strategy Intelligence
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Power Threshold</p>
                          <p className="text-xs text-muted-foreground">Enemies need &gt;{getTotalDefenseStrength()} attack to target you</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Success Rate Reduction</p>
                          <p className="text-xs text-muted-foreground">Higher defense drastically reduces enemy success rates</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Store Upgrades</p>
                          <p className="text-xs text-muted-foreground">Invest in Block Protection and Fortress Mode</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Strategic Timing</p>
                          <p className="text-xs text-muted-foreground">Maintain strong defense when holding valuable blocks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span>Advanced Battle Strategy & Intelligence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Attack Types Guide */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Sword className="w-5 h-5 mr-2 text-red-500" />
                    Combat Strategies Mastery
                  </h3>
                  <div className="grid gap-4">
                    {(Object.keys(ATTACK_TYPES) as AttackType[]).map((attackType) => {
                      const info = ATTACK_TYPES[attackType]
                      const cooldown = attackCooldowns[attackType]
                      
                      return (
                        <div key={attackType} className="border rounded-xl p-4 bg-gradient-to-r from-gray-800/40 to-gray-900/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${info.color}20` }}
                              >
                                <span style={{ color: info.color }}>{info.icon}</span>
                              </div>
                              <div>
                                <span className="font-bold text-lg">{info.name}</span>
                                {cooldown > 0 && (
                                  <Badge variant="outline" className="ml-2">
                                    <Timer className="w-3 h-3 mr-1" />
                                    {cooldown}s cooldown
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{info.description}</p>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Attack Cost</p>
                              <p className="text-lg font-bold" style={{ color: info.color }}>
                                {Math.round(info.costMultiplier * 100)}%
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Success Modifier</p>
                              <p className="text-lg font-bold" style={{ color: info.color }}>
                                {info.successModifier > 0 ? '+' : ''}{info.successModifier}%
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Cooldown Period</p>
                              <p className="text-lg font-bold" style={{ color: info.color }}>
                                {info.cooldown}s
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Battle Mechanics */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Crosshair className="w-5 h-5 mr-2 text-orange-500" />
                    Combat Mechanics & Rules
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-blue-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-400">Attack Requirements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                          <div>
                            <p className="font-medium">Power Superiority</p>
                            <p className="text-xs text-muted-foreground">Attack Power must exceed target Defense</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                          <div>
                            <p className="font-medium">Success Calculation</p>
                            <p className="text-xs text-muted-foreground">Higher power advantage = better success rates (10-95%)</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                          <div>
                            <p className="font-medium">Attack Cooldowns</p>
                            <p className="text-xs text-muted-foreground">Strategic timing prevents spam attacks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-green-400">Loot Mechanics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                          <div>
                            <p className="font-medium">Money Heists</p>
                            <p className="text-xs text-muted-foreground">Steal 15-25% of enemy treasury based on success rate</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                          <div>
                            <p className="font-medium">Block Raids</p>
                            <p className="text-xs text-muted-foreground">Capture valuable blocks for passive income</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                          <div>
                            <p className="font-medium">Risk vs Reward</p>
                            <p className="text-xs text-muted-foreground">Higher enemy levels = greater potential rewards</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Power Rankings */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    Your Battle Classification
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sword className="w-8 h-8 text-red-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Attack Classification</h4>
                        <p className="text-2xl font-bold text-red-400 mb-2">
                          {getTotalAttackPower() < 70 ? 'NOVICE' : 
                           getTotalAttackPower() < 110 ? 'FIGHTER' : 
                           getTotalAttackPower() < 150 ? 'WARRIOR' : 
                           getTotalAttackPower() < 200 ? 'CHAMPION' : 'LEGEND'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current Power: {getTotalAttackPower()}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Defense Classification</h4>
                        <p className="text-2xl font-bold text-blue-400 mb-2">
                          {getTotalDefenseStrength() < 80 ? 'EXPOSED' : 
                           getTotalDefenseStrength() < 120 ? 'GUARDED' : 
                           getTotalDefenseStrength() < 160 ? 'FORTIFIED' : 
                           getTotalDefenseStrength() < 220 ? 'FORTRESS' : 'IMPENETRABLE'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current Defense: {getTotalDefenseStrength()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
