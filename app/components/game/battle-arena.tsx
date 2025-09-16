
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  XCircle
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

interface BattleArenaProps {
  gameState: GameState
  onStealBlock: (block: any, attackType: string) => void
  onStealMoney: (enemyId: string, attackType: string) => void
  onDefendBlocks: () => void
  isLoading: boolean
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
    description: 'Quiet approach with lower cost but reduced success against strong defenses',
    costMultiplier: 0.7,
    successModifier: -5,
    cooldown: 30, // seconds
    color: '#10B981'
  },
  direct: {
    name: 'Direct Assault',
    icon: <Sword className="w-4 h-4" />,
    description: 'Frontal attack with standard cost and effectiveness',
    costMultiplier: 1.0,
    successModifier: 0,
    cooldown: 60,
    color: '#EF4444'
  },
  calculated: {
    name: 'Calculated Strike',
    icon: <Target className="w-4 h-4" />,
    description: 'Precise attack with higher cost but increased success rate',
    costMultiplier: 1.5,
    successModifier: 15,
    cooldown: 90,
    color: '#8B5CF6'
  }
}

// More dynamic enemy players with varied difficulty
const ENEMY_PLAYERS = [
  {
    id: 'enemy_1',
    name: 'CryptoNovice',
    level: 8,
    defenseStrength: 65,
    money: 12500, // Available money to steal
    reputation: 'Newcomer',
    lastSeen: 'Online',
    blocks: [
      {
        id: 'enemy_block_1',
        name: 'Dogecoin Block',
        type: 'doge',
        rarity: 'common' as const,
        value: 120,
        power: 45,
        defense: 35,
        image: '🐕',
        color: '#C2A633',
        description: 'A humble Dogecoin block - easy target for beginners',
        owner: 'enemy_1',
        isStealable: true,
        spawnTime: Date.now() - 120000,
        traits: ['Common rarity', 'DOGE power']
      }
    ]
  },
  {
    id: 'enemy_2',
    name: 'BlockHunter',
    level: 15,
    defenseStrength: 95,
    money: 28750, // Available money to steal
    reputation: 'Experienced',
    lastSeen: '2m ago',
    blocks: [
      {
        id: 'enemy_block_2',
        name: 'Ethereum Block',
        type: 'eth',
        rarity: 'rare' as const,
        value: 280,
        power: 70,
        defense: 55,
        image: 'Ξ',
        color: '#627EEA',
        description: 'A solid Ethereum block with smart contract defenses',
        owner: 'enemy_2',
        isStealable: true,
        spawnTime: Date.now() - 180000,
        traits: ['Rare rarity', 'ETH power', 'Smart Defense']
      }
    ]
  },
  {
    id: 'enemy_3',
    name: 'CryptoWarrior',
    level: 22,
    defenseStrength: 130,
    money: 67500, // Available money to steal
    reputation: 'Veteran',
    lastSeen: '10m ago',
    blocks: [
      {
        id: 'enemy_block_3',
        name: 'Bitcoin Block',
        type: 'btc',
        rarity: 'epic' as const,
        value: 450,
        power: 95,
        defense: 75,
        image: '₿',
        color: '#F7931A',
        description: 'A heavily fortified Bitcoin block - high risk, high reward',
        owner: 'enemy_3',
        isStealable: true,
        spawnTime: Date.now() - 300000,
        traits: ['Epic rarity', 'BTC power', 'Fortress Defense']
      }
    ]
  },
  {
    id: 'enemy_4',
    name: 'WhaleKiller',
    level: 35,
    defenseStrength: 180,
    money: 142500, // Available money to steal
    reputation: 'Champion',
    lastSeen: 'Online',
    blocks: [
      {
        id: 'enemy_block_4',
        name: 'Secret Solana Block',
        type: 'sol',
        rarity: 'legendary' as const,
        value: 850,
        power: 120,
        defense: 100,
        image: '◎',
        color: '#9945FF',
        description: 'Ultra-rare Solana block with quantum encryption - for masters only',
        owner: 'enemy_4',
        isStealable: true,
        spawnTime: Date.now() - 600000,
        traits: ['Legendary rarity', 'SOL power', 'Quantum Shield', 'Master Tier']
      }
    ]
  }
]

export function BattleArena({ gameState, onStealBlock, onStealMoney, onDefendBlocks, isLoading }: BattleArenaProps) {
  const [selectedTarget, setSelectedTarget] = useState<{ blockId: string; attackType: AttackType } | null>(null)
  const [attackCooldowns, setAttackCooldowns] = useState<Record<AttackType, number>>({
    stealth: 0,
    direct: 0,
    calculated: 0
  })

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

  // Calculate success rate based on power vs defense with attack type modifier
  const calculateSuccessRate = (playerPower: number, targetDefense: number, attackType: AttackType) => {
    if (playerPower <= targetDefense) return 0 // Can't steal if not stronger
    
    const powerAdvantage = playerPower - targetDefense
    const baseSuccessRate = Math.min(85, 45 + (powerAdvantage * 2)) // Max 85% base success
    const attackModifier = ATTACK_TYPES[attackType].successModifier
    const upgradeBonus = gameState.upgradeEffects?.stealSuccessBonus || 0
    
    return Math.max(10, Math.min(95, baseSuccessRate + attackModifier + upgradeBonus))
  }

  // Calculate attack cost
  const calculateAttackCost = (blockValue: number, attackType: AttackType) => {
    const baseCost = Math.floor(blockValue * 0.15) // Higher base cost for strategy
    const typeCostMultiplier = ATTACK_TYPES[attackType].costMultiplier
    return Math.floor(baseCost * typeCostMultiplier)
  }

  const handleStealAttempt = (block: any, attackType: AttackType) => {
    const cooldownTime = ATTACK_TYPES[attackType].cooldown
    setAttackCooldowns(prev => ({ ...prev, [attackType]: cooldownTime }))
    onStealBlock(block, attackType)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Combat Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-xl font-bold">{getTotalAttackPower()}</p>
            <p className="text-xs text-muted-foreground">Attack Power</p>
            {(gameState.upgradeEffects?.attackPowerBonus || 0) > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                +{gameState.upgradeEffects?.attackPowerBonus} Bonus
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-xl font-bold">{getTotalDefenseStrength()}</p>
            <p className="text-xs text-muted-foreground">Defense Power</p>
            {(gameState.upgradeEffects?.defenseStrengthBonus || 0) > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                +{gameState.upgradeEffects?.defenseStrengthBonus} Bonus
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-xl font-bold">{gameState.ownedBlocks.length}</p>
            <p className="text-xs text-muted-foreground">Protected Blocks</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-xl font-bold">{gameState.level}</p>
            <p className="text-xs text-muted-foreground">Battle Level</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="steal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="steal" className="flex items-center space-x-2">
            <Sword className="w-4 h-4" />
            <span>Attack</span>
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

        <TabsContent value="steal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Enemy Targets</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ⚠️ <strong>Rule:</strong> You can only steal from players with lower defense than your attack power!
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                  {ENEMY_PLAYERS.map((enemy) => {
                    const canTarget = canAttemptSteal(enemy.defenseStrength)
                    
                    return (
                      <div key={enemy.id} className={`border rounded-lg p-4 ${!canTarget ? 'opacity-60 bg-gray-500/5' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-center">
                              <Crown className="w-5 h-5 text-yellow-500" />
                              <div className={`w-2 h-2 rounded-full ${enemy.lastSeen === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <div>
                              <h3 className="font-bold flex items-center space-x-2">
                                <span>{enemy.name}</span>
                                <Badge variant={canTarget ? "default" : "secondary"}>
                                  Level {enemy.level}
                                </Badge>
                              </h3>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>Defense: {enemy.defenseStrength}</span>
                                <span>•</span>
                                <span className={canTarget ? 'text-green-500' : 'text-red-500'}>
                                  {canTarget ? 'VULNERABLE' : 'TOO STRONG'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {enemy.reputation}
                                </Badge>
                                <span className="text-muted-foreground">{enemy.lastSeen}</span>
                              </div>
                            </div>
                          </div>
                          {!canTarget && (
                            <div className="text-right">
                              <Lock className="w-5 h-5 mx-auto text-red-500 mb-1" />
                              <p className="text-xs text-red-500">Need {enemy.defenseStrength + 1} Attack</p>
                            </div>
                          )}
                        </div>

                        {/* Money Stealing Section */}
                        {canTarget && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                                  💰
                                </div>
                                <div>
                                  <h4 className="font-semibold text-green-700 dark:text-green-400">Steal Money</h4>
                                  <p className="text-xs text-muted-foreground">Target has ${enemy.money.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Money Attack Options */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {(Object.keys(ATTACK_TYPES) as AttackType[]).map((attackType) => {
                                const attackInfo = ATTACK_TYPES[attackType]
                                const cost = Math.floor(enemy.money * 0.08 * attackInfo.costMultiplier) // 8% of enemy's money as base cost
                                const successRate = calculateSuccessRate(getTotalAttackPower(), enemy.defenseStrength, attackType)
                                const potentialSteal = Math.floor(enemy.money * (0.15 + (successRate / 1000))) // Steal 15-25% based on success rate
                                const isOnCooldown = attackCooldowns[attackType] > 0
                                const canAfford = gameState.money >= cost
                                
                                return (
                                  <div key={attackType} className="border border-green-500/30 rounded p-2 bg-green-500/5">
                                    <div className="flex items-center space-x-1 mb-1">
                                      <span style={{ color: attackInfo.color }}>
                                        {attackInfo.icon}
                                      </span>
                                      <span className="text-xs font-medium">{attackInfo.name}</span>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs text-muted-foreground mb-2">
                                      <div className="flex justify-between">
                                        <span>Success:</span>
                                        <span className={successRate > 70 ? 'text-green-500' : successRate > 40 ? 'text-yellow-500' : 'text-red-500'}>
                                          {successRate}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Cost:</span>
                                        <span>${cost.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Steal:</span>
                                        <span className="text-green-600 font-medium">${potentialSteal.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs bg-green-500/10 hover:bg-green-500/20"
                                      style={{ borderColor: '#16a34a', color: '#16a34a' }}
                                      onClick={() => {
                                        const cooldownTime = ATTACK_TYPES[attackType].cooldown
                                        setAttackCooldowns(prev => ({ ...prev, [attackType]: cooldownTime }))
                                        onStealMoney(enemy.id, attackType)
                                      }}
                                      disabled={isLoading || !canAfford || isOnCooldown}
                                    >
                                      {isOnCooldown ? (
                                        <><Clock className="w-3 h-3 mr-1" />{attackCooldowns[attackType]}s</>
                                      ) : !canAfford ? (
                                        'Too Expensive'
                                      ) : (
                                        'STEAL MONEY'
                                      )}
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Enemy Blocks */}
                        {canTarget && (
                          <div className="space-y-3">
                            {enemy.blocks.map((block) => (
                              <div key={block.id} className="bg-gray-500/5 border rounded-lg p-3">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div 
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                                    style={{ backgroundColor: `${block.color}20`, color: block.color }}
                                  >
                                    {block.image}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{block.name}</h4>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {block.rarity}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Value: ${block.value.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Attack Options */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {(Object.keys(ATTACK_TYPES) as AttackType[]).map((attackType) => {
                                    const attackInfo = ATTACK_TYPES[attackType]
                                    const cost = calculateAttackCost(block.value, attackType)
                                    const successRate = calculateSuccessRate(getTotalAttackPower(), enemy.defenseStrength, attackType)
                                    const isOnCooldown = attackCooldowns[attackType] > 0
                                    const canAfford = gameState.money >= cost
                                    
                                    return (
                                      <div key={attackType} className="border rounded p-2">
                                        <div className="flex items-center space-x-1 mb-1">
                                          <span style={{ color: attackInfo.color }}>
                                            {attackInfo.icon}
                                          </span>
                                          <span className="text-xs font-medium">{attackInfo.name}</span>
                                        </div>
                                        
                                        <div className="space-y-1 text-xs text-muted-foreground mb-2">
                                          <div className="flex justify-between">
                                            <span>Success:</span>
                                            <span className={successRate > 70 ? 'text-green-500' : successRate > 40 ? 'text-yellow-500' : 'text-red-500'}>
                                              {successRate}%
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Cost:</span>
                                            <span>${cost.toLocaleString()}</span>
                                          </div>
                                        </div>
                                        
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full text-xs"
                                          style={{ borderColor: attackInfo.color, color: attackInfo.color }}
                                          onClick={() => handleStealAttempt(block, attackType)}
                                          disabled={isLoading || !canAfford || isOnCooldown}
                                        >
                                          {isOnCooldown ? (
                                            <><Clock className="w-3 h-3 mr-1" />{attackCooldowns[attackType]}s</>
                                          ) : !canAfford ? (
                                            'Too Expensive'
                                          ) : (
                                            'ATTACK'
                                          )}
                                        </Button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!canTarget && (
                          <div className="text-center py-4">
                            <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-muted-foreground">
                              This player's defense is too strong for your current attack power.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upgrade your attack power in the Store to challenge stronger opponents.
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

        <TabsContent value="defend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Fortress Defense</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Defense Rating: {getTotalDefenseStrength()}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-1">Protection Level</h4>
                    <Progress value={Math.min(100, (getTotalDefenseStrength() / 200) * 100)} className="mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {getTotalDefenseStrength() < 80 ? 'Vulnerable' : 
                       getTotalDefenseStrength() < 120 ? 'Protected' : 
                       getTotalDefenseStrength() < 160 ? 'Fortified' : 'Impenetrable'}
                    </p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-1">Threat Level</h4>
                    <div className="flex items-center space-x-1 mb-1">
                      {getTotalDefenseStrength() < 80 ? (
                        <><XCircle className="w-4 h-4 text-red-500" /><span className="text-red-500 text-sm">HIGH</span></>
                      ) : getTotalDefenseStrength() < 120 ? (
                        <><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-yellow-500 text-sm">MEDIUM</span></>
                      ) : (
                        <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-500 text-sm">LOW</span></>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Risk Assessment</p>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={onDefendBlocks}
                  disabled={isLoading || gameState.coins < 100}
                  className="w-full mb-4"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {gameState.coins < 100 ? 'Need 100 Coins' : 'Strengthen Defenses (+20) - 100 coins'}
                </Button>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                    Defense Strategy Tips
                  </h4>
                  <ul className="text-xs text-left text-muted-foreground space-y-1">
                    <li>• Players need Attack Power &gt; {getTotalDefenseStrength()} to target you</li>
                    <li>• Higher defense reduces enemy success rates significantly</li>
                    <li>• Consider Store upgrades for Block Protection and Fortress Mode</li>
                    <li>• Keep valuable blocks when your defense is strong</li>
                  </ul>
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
                <span>Battle Strategy Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Attack Types Guide */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Sword className="w-4 h-4 mr-2" />
                    Attack Strategies
                  </h3>
                  <div className="grid gap-3">
                    {(Object.keys(ATTACK_TYPES) as AttackType[]).map((attackType) => {
                      const info = ATTACK_TYPES[attackType]
                      const cooldown = attackCooldowns[attackType]
                      
                      return (
                        <div key={attackType} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span style={{ color: info.color }}>{info.icon}</span>
                            <span className="font-medium">{info.name}</span>
                            {cooldown > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {cooldown}s
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="ml-1 font-medium">{Math.round(info.costMultiplier * 100)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Success:</span>
                              <span className="ml-1 font-medium">{info.successModifier > 0 ? '+' : ''}{info.successModifier}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cooldown:</span>
                              <span className="ml-1 font-medium">{info.cooldown}s</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Battle Rules */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Battle Rules
                  </h3>
                  <div className="bg-gray-500/10 border rounded-lg p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <span><strong>Power Requirement:</strong> Your Attack Power must exceed the target's Defense to attempt stealing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <span><strong>Success Rates:</strong> Higher power advantage = better success rates (10-95%)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <span><strong>Attack Cooldowns:</strong> Each attack type has a cooldown period after use</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <span><strong>Strategic Choice:</strong> Choose between low-cost stealth, balanced direct, or high-success calculated attacks</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <span><strong>Store Upgrades:</strong> Enhance your Attack Power, Defense, and special abilities in the Store</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Money Stealing Mechanics */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <div className="w-4 h-4 mr-2 text-green-600">💰</div>
                    Money Stealing Strategy
                  </h3>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">Direct Money Attacks</p>
                          <p className="text-xs text-muted-foreground">Attack players directly to steal 15-25% of their money without taking their blocks</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">High Risk, High Reward</p>
                          <p className="text-xs text-muted-foreground">Stronger enemies have more money to steal but higher defense - choose targets wisely</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">Success-Based Returns</p>
                          <p className="text-xs text-muted-foreground">Higher success rates = larger percentage stolen (up to 25% at 95% success rate)</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">Money Multiplier Bonuses</p>
                          <p className="text-xs text-muted-foreground">Store upgrades can increase your stolen money with multiplier bonuses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Power Rankings */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    Your Current Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                      <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
                      <p className="font-bold">Attack Tier</p>
                      <p className="text-sm text-muted-foreground">
                        {getTotalAttackPower() < 70 ? 'Novice' : 
                         getTotalAttackPower() < 110 ? 'Fighter' : 
                         getTotalAttackPower() < 150 ? 'Warrior' : 'Champion'}
                      </p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                      <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="font-bold">Defense Tier</p>
                      <p className="text-sm text-muted-foreground">
                        {getTotalDefenseStrength() < 80 ? 'Vulnerable' : 
                         getTotalDefenseStrength() < 120 ? 'Protected' : 
                         getTotalDefenseStrength() < 160 ? 'Fortified' : 'Legendary'}
                      </p>
                    </div>
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
