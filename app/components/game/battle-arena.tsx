
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sword, 
  Shield, 
  Target, 
  Users,
  Zap,
  TrendingUp,
  Crown,
  AlertTriangle
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
}

interface BattleArenaProps {
  gameState: GameState
  onStealBlock: (block: any) => void
  onDefendBlocks: () => void
  isLoading: boolean
}

// Mock enemy players with blocks
const ENEMY_PLAYERS = [
  {
    id: 'enemy_1',
    name: 'CryptoWarrior',
    level: 15,
    defenseStrength: 120,
    blocks: [
      {
        id: 'enemy_block_1',
        name: 'Bitcoin Block',
        type: 'btc',
        rarity: 'epic' as const,
        value: 250,
        power: 85,
        defense: 60,
        image: '₿',
        color: '#F7931A',
        description: 'A powerful Bitcoin block with high value',
        owner: 'enemy_1',
        isStealable: true,
        spawnTime: Date.now() - 300000,
        traits: ['Epic rarity', 'BTC power']
      }
    ]
  },
  {
    id: 'enemy_2',
    name: 'BlockHunter',
    level: 22,
    defenseStrength: 95,
    blocks: [
      {
        id: 'enemy_block_2',
        name: 'Ethereum Block',
        type: 'eth',
        rarity: 'rare' as const,
        value: 180,
        power: 70,
        defense: 45,
        image: 'Ξ',
        color: '#627EEA',
        description: 'A rare Ethereum block with smart contract power',
        owner: 'enemy_2',
        isStealable: true,
        spawnTime: Date.now() - 180000,
        traits: ['Rare rarity', 'ETH power']
      }
    ]
  },
  {
    id: 'enemy_3',
    name: 'WhaleKiller',
    level: 28,
    defenseStrength: 150,
    blocks: [
      {
        id: 'enemy_block_3',
        name: 'Solana Block',
        type: 'sol',
        rarity: 'legendary' as const,
        value: 450,
        power: 95,
        defense: 80,
        image: '◎',
        color: '#9945FF',
        description: 'A legendary Solana block with lightning speed',
        owner: 'enemy_3',
        isStealable: true,
        spawnTime: Date.now() - 600000,
        traits: ['Legendary rarity', 'SOL power']
      }
    ]
  }
]

export function BattleArena({ gameState, onStealBlock, onDefendBlocks, isLoading }: BattleArenaProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  const calculateStealChance = (playerPower: number, targetDefense: number) => {
    const baseChance = 50
    const powerDiff = playerPower - targetDefense
    const chance = Math.max(10, Math.min(90, baseChance + powerDiff))
    return Math.round(chance)
  }

  return (
    <div className="space-y-6">
      {/* Player Combat Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Sword className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{gameState.attackPower}</p>
            <p className="text-sm text-muted-foreground">Attack Power</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{gameState.defenseStrength}</p>
            <p className="text-sm text-muted-foreground">Defense Strength</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{gameState.ownedBlocks.length}</p>
            <p className="text-sm text-muted-foreground">Protected Blocks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="steal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="steal" className="flex items-center space-x-2">
            <Sword className="w-4 h-4" />
            <span>Steal Blocks</span>
          </TabsTrigger>
          <TabsTrigger value="defend" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Defense</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Enemy Players</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ENEMY_PLAYERS.map((enemy) => (
                  <div key={enemy.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span>{enemy.name}</span>
                          <Badge variant="secondary">Level {enemy.level}</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Defense: {enemy.defenseStrength}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{enemy.blocks.length} blocks</p>
                      </div>
                    </div>

                    {/* Enemy Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {enemy.blocks.map((block) => {
                        const stealCost = Math.floor(block.value * 0.1)
                        const stealChance = calculateStealChance(gameState.attackPower, enemy.defenseStrength)
                        
                        return (
                          <div key={block.id} className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                                style={{ backgroundColor: `${block.color}20`, color: block.color }}
                              >
                                {block.image}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{block.name}</h4>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {block.rarity}
                                </Badge>
                              </div>
                              <div className="text-right text-xs">
                                <p className="font-bold">Value: {block.value}</p>
                                <p className="text-muted-foreground">Defense: {block.defense}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                <span>Success: {stealChance}%</span>
                              </div>
                              <span className="text-muted-foreground">Cost: {stealCost} coins</span>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="w-full" 
                              onClick={() => onStealBlock(block)}
                              disabled={isLoading || gameState.coins < stealCost}
                            >
                              {gameState.coins < stealCost ? 'Not Enough Coins' : `Steal Block (${stealCost} coins)`}
                            </Button>
                          </div>
                        )
                      })}
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
                <span>Defense Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Current Defense: {gameState.defenseStrength}</h3>
                <p className="text-muted-foreground mb-4">
                  Higher defense makes it harder for enemies to steal your blocks
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">Defense Effectiveness</h4>
                  <Progress value={Math.min(100, (gameState.defenseStrength / 200) * 100)} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {gameState.defenseStrength < 100 ? 'Weak' : 
                     gameState.defenseStrength < 150 ? 'Moderate' : 
                     gameState.defenseStrength < 200 ? 'Strong' : 'Legendary'} Defense
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={onDefendBlocks}
                  disabled={isLoading || gameState.coins < 100}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {gameState.coins < 100 ? 'Not Enough Coins' : 'Upgrade Defense (+20) - 100 coins'}
                </Button>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <p className="font-semibold">Blocks Protected</p>
                    <p className="text-muted-foreground">{gameState.ownedBlocks.length}</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <p className="font-semibold">Success Rate vs You</p>
                    <p className="text-muted-foreground">
                      ~{Math.max(10, 70 - gameState.defenseStrength)}%
                    </p>
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
