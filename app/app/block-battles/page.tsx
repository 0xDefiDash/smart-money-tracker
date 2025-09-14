
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Coins, 
  Shield, 
  Sword, 
  Trophy, 
  Timer, 
  Zap, 
  Crown,
  Gamepad2,
  Target,
  Star,
  TrendingUp,
  Users
} from 'lucide-react'
import { BlockCharacter } from '@/components/game/block-character'
import { GameStats } from '@/components/game/game-stats'
import { BlockCollection } from '@/components/game/block-collection'
import { BattleArena } from '@/components/game/battle-arena'
import { SpawnArea } from '@/components/game/spawn-area'

interface GameState {
  playerId: string
  coins: number
  points: number
  level: number
  experience: number
  ownedBlocks: Block[]
  defenseStrength: number
  attackPower: number
  lastSpawn: number
  nextSpawn: number
}

interface Block {
  id: string
  name: string
  type: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  value: number
  power: number
  defense: number
  image: string
  color: string
  description: string
  owner?: string
  isStealable: boolean
  spawnTime: number
  traits: string[]
}

const BLOCK_TYPES = [
  { name: 'Bitcoin Block', type: 'btc', color: '#F7931A', emoji: '₿' },
  { name: 'Ethereum Block', type: 'eth', color: '#627EEA', emoji: 'Ξ' },
  { name: 'Solana Block', type: 'sol', color: '#9945FF', emoji: '◎' },
  { name: 'Cardano Block', type: 'ada', color: '#0033AD', emoji: '₳' },
  { name: 'Polygon Block', type: 'matic', color: '#8247E5', emoji: '⟐' },
  { name: 'Avalanche Block', type: 'avax', color: '#E84142', emoji: '🔺' },
  { name: 'Chainlink Block', type: 'link', color: '#375BD2', emoji: '🔗' },
  { name: 'Uniswap Block', type: 'uni', color: '#FF007A', emoji: '🦄' },
  { name: 'Aave Block', type: 'aave', color: '#B6509E', emoji: '👻' },
  { name: 'Compound Block', type: 'comp', color: '#00D395', emoji: '🏛️' },
  { name: 'SushiSwap Block', type: 'sushi', color: '#FA52A0', emoji: '🍣' },
  { name: 'PancakeSwap Block', type: 'cake', color: '#1FC7D4', emoji: '🥞' },
  { name: 'Curve Block', type: 'crv', color: '#FFE31A', emoji: '📈' },
  { name: 'Yearn Block', type: 'yfi', color: '#0074D9', emoji: '💎' },
  { name: 'Maker Block', type: 'mkr', color: '#1AAB9B', emoji: '🏭' },
  { name: 'The Graph Block', type: 'grt', color: '#6747ED', emoji: '📊' },
  { name: 'Filecoin Block', type: 'fil', color: '#0090FF', emoji: '💾' },
  { name: 'Polkadot Block', type: 'dot', color: '#E6007A', emoji: '●' },
  { name: 'Cosmos Block', type: 'atom', color: '#2E3148', emoji: '🌌' },
  { name: 'Dogecoin Block', type: 'doge', color: '#C2A633', emoji: '🐕' }
]

export default function BlockBattlesPage() {
  const [gameState, setGameState] = useState<GameState>({
    playerId: 'player_' + Math.random().toString(36).substr(2, 9),
    coins: 1000,
    points: 0,
    level: 1,
    experience: 0,
    ownedBlocks: [],
    defenseStrength: 100,
    attackPower: 50,
    lastSpawn: Date.now(),
    nextSpawn: Date.now() + 120000 // 2 minutes
  })

  const [spawnedBlocks, setSpawnedBlocks] = useState<Block[]>([])
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeUntilSpawn, setTimeUntilSpawn] = useState(120)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize game state from localStorage or API
  useEffect(() => {
    loadGameData()
  }, [])

  // Spawn initial blocks when game starts
  useEffect(() => {
    if (isInitialized && spawnedBlocks.length === 0) {
      // Small delay to let the UI settle, then spawn initial blocks
      setTimeout(() => {
        generateLocalBlocks()
        setBattleLog(prev => [...prev, `🎮 Welcome to Block Battles! Some blocks are ready to claim!`])
      }, 500)
    }
  }, [isInitialized])

  // Timer for spawning new blocks
  useEffect(() => {
    if (!isInitialized) return

    const timer = setInterval(() => {
      const now = Date.now()
      const timeLeft = Math.max(0, Math.floor((gameState.nextSpawn - now) / 1000))
      setTimeUntilSpawn(timeLeft)
      
      if (timeLeft === 0) {
        spawnNewBlocks()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.nextSpawn, isInitialized])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('blockBattlesGameState', JSON.stringify(gameState))
      localStorage.setItem('blockBattlesBattleLog', JSON.stringify(battleLog))
    }
  }, [gameState, battleLog, isInitialized])

  const loadGameData = async () => {
    try {
      // First try to load from localStorage
      const savedState = localStorage.getItem('blockBattlesGameState')
      const savedLog = localStorage.getItem('blockBattlesBattleLog')
      
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        setGameState(parsedState)
        
        if (savedLog) {
          const parsedLog = JSON.parse(savedLog)
          setBattleLog(parsedLog)
        }
        
        setIsInitialized(true)
        setBattleLog(prev => [...prev, `🎮 Welcome back! Your game state has been restored.`])
        return
      }

      // If no local state, try API
      const response = await fetch('/api/game/state')
      if (response.ok) {
        const data = await response.json()
        setGameState(data)
      }
    } catch (error) {
      console.log('Using default game state')
    } finally {
      setIsInitialized(true)
    }
  }

  const resetGame = () => {
    // Clear localStorage
    localStorage.removeItem('blockBattlesGameState')
    localStorage.removeItem('blockBattlesBattleLog')
    
    // Reset to default state
    setGameState({
      playerId: 'player_' + Math.random().toString(36).substr(2, 9),
      coins: 1000,
      points: 0,
      level: 1,
      experience: 0,
      ownedBlocks: [],
      defenseStrength: 100,
      attackPower: 50,
      lastSpawn: Date.now(),
      nextSpawn: Date.now() + 120000
    })
    
    setSpawnedBlocks([])
    setBattleLog([`🔄 Game reset! Welcome to Block Battles!`])
    
    // Spawn some initial blocks
    setTimeout(() => {
      generateLocalBlocks()
    }, 1000)
  }

  const spawnNewBlocks = useCallback(async () => {
    try {
      const response = await fetch('/api/game/spawn', { method: 'POST' })
      const newBlocks = await response.json()
      
      setSpawnedBlocks(prev => [...prev, ...newBlocks])
      setGameState(prev => ({
        ...prev,
        lastSpawn: Date.now(),
        nextSpawn: Date.now() + 120000
      }))
      
      setBattleLog(prev => [...prev, `🎁 New blocks have spawned in the arena!`])
    } catch (error) {
      // Generate blocks locally as fallback
      generateLocalBlocks()
    }
  }, [])

  const generateLocalBlocks = () => {
    const numBlocks = Math.floor(Math.random() * 3) + 1
    const newBlocks: Block[] = []
    
    for (let i = 0; i < numBlocks; i++) {
      const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
      const rarities: Block['rarity'][] = ['common', 'rare', 'epic', 'legendary']
      const rarity = rarities[Math.floor(Math.random() * rarities.length)]
      
      const baseValue = rarity === 'legendary' ? 500 : rarity === 'epic' ? 200 : rarity === 'rare' ? 100 : 50
      
      newBlocks.push({
        id: `block_${Date.now()}_${i}`,
        name: blockType.name,
        type: blockType.type,
        rarity,
        value: baseValue + Math.floor(Math.random() * baseValue),
        power: Math.floor(Math.random() * 100) + 20,
        defense: Math.floor(Math.random() * 80) + 10,
        image: blockType.emoji,
        color: blockType.color,
        description: `A powerful ${rarity} ${blockType.name} with unique crypto powers!`,
        isStealable: true,
        spawnTime: Date.now(),
        traits: [`${rarity} rarity`, `${blockType.type.toUpperCase()} power`]
      })
    }
    
    setSpawnedBlocks(prev => [...prev, ...newBlocks])
    setGameState(prev => ({
      ...prev,
      lastSpawn: Date.now(),
      nextSpawn: Date.now() + 120000
    }))
    
    setBattleLog(prev => [...prev, `🎁 ${numBlocks} new blocks spawned!`])
  }

  const claimBlock = async (blockId: string) => {
    const block = spawnedBlocks.find(b => b.id === blockId)
    if (!block) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/game/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, playerId: gameState.playerId })
      })
      
      if (response.ok) {
        const result = await response.json()
        updateGameStateAfterClaim(block)
      }
    } catch (error) {
      // Handle locally
      updateGameStateAfterClaim(block)
    }
    
    setIsLoading(false)
  }

  const updateGameStateAfterClaim = (block: Block) => {
    setGameState(prev => {
      const experienceGained = block.rarity === 'legendary' ? 50 : block.rarity === 'epic' ? 30 : block.rarity === 'rare' ? 20 : 10
      const newExperience = prev.experience + experienceGained
      const experienceNeeded = prev.level * 100
      const newLevel = Math.floor(newExperience / 100) + 1
      const leveledUp = newLevel > prev.level
      
      if (leveledUp) {
        setBattleLog(prevLog => [...prevLog, `🎉 LEVEL UP! You reached level ${newLevel}!`])
      }

      return {
        ...prev,
        ownedBlocks: [...prev.ownedBlocks, { ...block, owner: prev.playerId }],
        coins: prev.coins + block.value,
        points: prev.points + block.value * 2,
        experience: newExperience,
        level: newLevel,
        attackPower: prev.attackPower + (leveledUp ? 5 : 0),
        defenseStrength: prev.defenseStrength + (leveledUp ? 10 : 0)
      }
    })
    
    setSpawnedBlocks(prev => prev.filter(b => b.id !== block.id))
    setBattleLog(prev => [...prev, `✅ Successfully claimed ${block.name} for ${block.value} coins! (+${block.rarity === 'legendary' ? 50 : block.rarity === 'epic' ? 30 : block.rarity === 'rare' ? 20 : 10} XP)`])
  }

  const stealBlock = async (targetBlock: Block) => {
    setIsLoading(true)
    
    const success = Math.random() > 0.5 // 50% success rate
    const cost = Math.floor(targetBlock.value * 0.1)
    
    if (gameState.coins < cost) {
      setBattleLog(prev => [...prev, `❌ Not enough coins to attempt steal! Need ${cost} coins.`])
      setIsLoading(false)
      return
    }
    
    if (success) {
      setGameState(prev => ({
        ...prev,
        ownedBlocks: [...prev.ownedBlocks, { ...targetBlock, owner: prev.playerId }],
        coins: prev.coins - cost + targetBlock.value,
        points: prev.points + targetBlock.value,
        experience: prev.experience + 15
      }))
      
      setBattleLog(prev => [...prev, `🎯 Successfully stole ${targetBlock.name}! Gained ${targetBlock.value} value!`])
    } else {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - cost
      }))
      
      setBattleLog(prev => [...prev, `💥 Steal attempt failed! Lost ${cost} coins to defense systems.`])
    }
    
    setIsLoading(false)
  }

  const defendBlocks = async () => {
    const cost = 100
    
    if (gameState.coins < cost) {
      setBattleLog(prev => [...prev, `❌ Not enough coins for defense upgrade! Need ${cost} coins.`])
      return
    }
    
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      defenseStrength: prev.defenseStrength + 20
    }))
    
    setBattleLog(prev => [...prev, `🛡️ Defense upgraded! +20 defense strength for 100 coins.`])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Block Battles
                  </CardTitle>
                  <p className="text-muted-foreground">Collect, Battle, and Dominate the Crypto Arena!</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-yellow-500">{gameState.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-purple-500">{gameState.points.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetGame}
                  className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 hover:text-red-300"
                >
                  Reset Game
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Stats */}
          <div className="lg:col-span-1">
            <GameStats gameState={gameState} />
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="arena" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="arena" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Arena</span>
                </TabsTrigger>
                <TabsTrigger value="collection" className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Collection</span>
                </TabsTrigger>
                <TabsTrigger value="battles" className="flex items-center space-x-2">
                  <Sword className="w-4 h-4" />
                  <span>Battles</span>
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Leaderboard</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="arena" className="space-y-6">
                <SpawnArea 
                  spawnedBlocks={spawnedBlocks}
                  timeUntilSpawn={timeUntilSpawn}
                  onClaimBlock={claimBlock}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="collection">
                <BlockCollection 
                  ownedBlocks={gameState.ownedBlocks}
                  coins={gameState.coins}
                />
              </TabsContent>

              <TabsContent value="battles">
                <BattleArena 
                  gameState={gameState}
                  onStealBlock={stealBlock}
                  onDefendBlocks={defendBlocks}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>Global Leaderboard</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-center space-x-3">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-bold">CryptoKing_2025</p>
                            <p className="text-sm text-muted-foreground">Level 47</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-500">2,847,392 pts</p>
                          <p className="text-sm text-muted-foreground">834 blocks</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-500/10 rounded-lg border border-slate-500/20">
                        <div className="flex items-center space-x-3">
                          <Star className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-bold">BlockMaster_Pro</p>
                            <p className="text-sm text-muted-foreground">Level 42</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-400">1,923,847 pts</p>
                          <p className="text-sm text-muted-foreground">567 blocks</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="font-bold">WhaleHunter_77</p>
                            <p className="text-sm text-muted-foreground">Level 38</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">1,456,291 pts</p>
                          <p className="text-sm text-muted-foreground">412 blocks</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center space-x-3">
                          <Gamepad2 className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-bold">You</p>
                            <p className="text-sm text-muted-foreground">Level {gameState.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-500">{gameState.points.toLocaleString()} pts</p>
                          <p className="text-sm text-muted-foreground">{gameState.ownedBlocks.length} blocks</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Battle Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Battle Log</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {battleLog.slice(-10).reverse().map((log, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {log}
                  </p>
                ))}
                {battleLog.length === 0 && (
                  <p className="text-sm text-muted-foreground">Welcome to Block Battles! Start claiming blocks to see activity here.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
