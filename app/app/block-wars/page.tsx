
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Users,
  Loader2
} from 'lucide-react'
import { BlockCharacter } from '@/components/game/block-character'
import { GameStats } from '@/components/game/game-stats'
import { BlockCollection } from '@/components/game/block-collection'
import Leaderboard from '@/components/game/leaderboard'
import { BattleArena } from '@/components/game/battle-arena'
import { SpawnArea } from '@/components/game/spawn-area'
import { UserBoard } from '@/components/game/user-board'
import { TransactionTicker } from '@/components/game/transaction-ticker'

interface GameState {
  playerId: string
  coins: number
  money: number
  level: number
  experience: number
  ownedBlocks: Block[]
  defenseStrength: number
  attackPower: number
  lastSpawn: number
  nextSpawn: number
  lastMoneyUpdate: number // Track when money was last calculated
  secretBlockSpawns: number // Track secret blocks spawned today
  lastSecretSpawn: number // Last secret block spawn time
  nextSecretSpawn: number // Next scheduled secret block spawn
  isAdmin?: boolean // Admin privileges for manual spawning
  upgrades?: { [key: string]: number } // Track purchased upgrades and their levels
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

interface Block {
  id: string
  name: string
  type: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'secret'
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
  price?: number // New: Purchase price for premium blocks
  isPurchasable?: boolean // New: Whether this block can be purchased
}

// Money production rates per minute based on rarity
const MONEY_PRODUCTION_RATES = {
  common: 50,      // $50 per minute
  rare: 150,       // $150 per minute
  epic: 400,       // $400 per minute
  legendary: 1000, // $1000 per minute
  secret: 5000     // $5000 per minute - The ultimate block!
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
  { name: 'Dogecoin Block', type: 'doge', color: '#C2A633', emoji: '🐕' },
  { name: 'Secret Block', type: 'secret', color: '#FFD700', emoji: '🚀', isSecret: true }
]

// Helper function to calculate total money per minute from owned blocks
const calculateMoneyPerMinute = (ownedBlocks: Block[], upgradeEffects?: any): number => {
  const baseMoneyPerMinute = ownedBlocks.reduce((total, block) => {
    return total + MONEY_PRODUCTION_RATES[block.rarity]
  }, 0)
  
  // Apply money multiplier bonus from upgrades
  const multiplierBonus = upgradeEffects?.moneyMultiplierBonus || 0
  const multiplier = 1 + (multiplierBonus / 100) // Convert percentage to multiplier
  
  return Math.floor(baseMoneyPerMinute * multiplier)
}

// Helper function to calculate accumulated money since last update
const calculateAccumulatedMoney = (ownedBlocks: Block[], lastUpdate: number, upgradeEffects?: any): number => {
  const minutesElapsed = (Date.now() - lastUpdate) / 60000 // Convert to minutes
  const moneyPerMinute = calculateMoneyPerMinute(ownedBlocks, upgradeEffects)
  return Math.floor(moneyPerMinute * minutesElapsed)
}

// Helper function to get maximum collection size including bonuses
const getMaxCollectionSize = (upgradeEffects?: any): number => {
  const baseSize = 12
  const collectionBonus = upgradeEffects?.collectionSizeBonus || 0
  return baseSize + collectionBonus
}

export default function BlockWarsPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  // Initialize all state hooks at the top level with default values
  const [gameState, setGameState] = useState<GameState>({
    playerId: session?.user?.id || 'test_player_' + Math.random().toString(36).substr(2, 9), // TESTING: Use session or create test ID
    coins: 1000,
    money: 500000, // TESTING: Give enough money to test purchasing ($500k)
    level: 1,
    experience: 0,
    ownedBlocks: [],
    defenseStrength: 100,
    attackPower: 50,
    lastSpawn: Date.now(),
    nextSpawn: Date.now() + 120000, // 2 minutes
    lastMoneyUpdate: Date.now(),
    secretBlockSpawns: 0,
    lastSecretSpawn: 0,
    nextSecretSpawn: Date.now() + Math.random() * 12 * 60 * 60 * 1000, // Random time within 12 hours
    isAdmin: false,
    upgrades: {},
    upgradeEffects: {
      attackPowerBonus: 0,
      defenseStrengthBonus: 0,
      stealSuccessBonus: 0,
      blockProtectionBonus: 0,
      moneyMultiplierBonus: 0,
      collectionSizeBonus: 0,
      earlyDetection: false,
      stealInsurance: false
    }
  })
  
  const [spawnedBlocks, setSpawnedBlocks] = useState<Block[]>([])
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeUntilSpawn, setTimeUntilSpawn] = useState(120)
  const [isInitialized, setIsInitialized] = useState(false)
  const [storeItems, setStoreItems] = useState<any[]>([])
  const [storeCategories, setStoreCategories] = useState<any>({})
  const [selectedCategory, setSelectedCategory] = useState<'power' | 'defense' | 'special'>('power')

  // Update game state when session is available
  useEffect(() => {
    if (session?.user && gameState.playerId === 'loading') {
      setGameState(prev => ({
        ...prev,
        playerId: session.user.id,
        coins: session.user.gameMoney || 1000,
        level: session.user.gameLevel || 1,
        experience: session.user.gameExp || 0,
        isAdmin: session.user.isAdmin || false
      }))
    }
  }, [session?.user, gameState.playerId])

  // TEMPORARY: Skip authentication for testing
  // Comment out authentication checks for testing purposes
  /*
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
  }, [status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neon-green-bright mx-auto mb-4" />
          <p className="text-slate-300">Loading Block Wars...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated' || !session?.user) {
    return null // Will redirect via useEffect
  }
  */

  // TESTING: Skip the loading check since we're initializing with default values
  /*
  // Wait for gameState to be properly initialized
  if (gameState.playerId === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neon-green-bright mx-auto mb-4" />
          <p className="text-slate-300">Initializing Game...</p>
        </div>
      </div>
    )
  }
  */

  // Initialize game state from localStorage or API
  useEffect(() => {
    loadGameData()
  }, [])

  // Load initial blocks when game initializes
  useEffect(() => {
    if (!isInitialized) return

    // Initial load and start the spawn timer
    fetchGlobalBlocks()
    
    // Set initial timer value - start counting down from 2 minutes for first regular spawn
    setTimeUntilSpawn(120)
    
  }, [isInitialized])

  // Timer for updating time until spawn and triggering actual spawns
  useEffect(() => {
    if (!isInitialized) return

    const timer = setInterval(() => {
      setTimeUntilSpawn(prev => {
        const newTime = prev - 1
        
        // When timer reaches 0, trigger spawn and reset
        if (newTime <= 0 && spawnedBlocks.length < 12) {
          const newBlocksCount = Math.floor(Math.random() * 2) + 2 // 2-3 blocks
          generateLocalBlocks(newBlocksCount)
          setBattleLog(prevLog => [...prevLog, `🎁 ${newBlocksCount} new blocks spawned in the global arena! Timer reset to 2 minutes.`])
          return 120 // Reset to 2 minutes
        }
        
        return Math.max(0, newTime)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isInitialized, spawnedBlocks.length])

  // Passive money generation - update money every 5 seconds based on owned blocks
  useEffect(() => {
    if (!isInitialized || gameState.ownedBlocks.length === 0) return

    const moneyTimer = setInterval(() => {
      setGameState(prev => {
        const accumulatedMoney = calculateAccumulatedMoney(prev.ownedBlocks, prev.lastMoneyUpdate, prev.upgradeEffects)
        
        if (accumulatedMoney > 0) {
          return {
            ...prev,
            money: prev.money + accumulatedMoney,
            lastMoneyUpdate: Date.now()
          }
        }
        
        return prev
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(moneyTimer)
  }, [isInitialized, gameState.ownedBlocks.length])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('blockWarsGameState', JSON.stringify(gameState))
      localStorage.setItem('blockWarsBattleLog', JSON.stringify(battleLog))
    }
  }, [gameState, battleLog, isInitialized])

  const loadGameData = async () => {
    try {
      // First try to load from localStorage (check both new and old keys for backward compatibility)
      let savedState = localStorage.getItem('blockWarsGameState')
      let savedLog = localStorage.getItem('blockWarsBattleLog')
      
      // If not found, check for legacy "Block Battles" keys
      if (!savedState) {
        savedState = localStorage.getItem('blockBattlesGameState')
        savedLog = localStorage.getItem('blockBattlesBattleLog')
        
        // If found legacy data, migrate it to the new keys
        if (savedState) {
          localStorage.setItem('blockWarsGameState', savedState)
          localStorage.removeItem('blockBattlesGameState')
        }
        if (savedLog) {
          localStorage.setItem('blockWarsBattleLog', savedLog)
          localStorage.removeItem('blockBattlesBattleLog')
        }
      }
      
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        
        // Migrate legacy saves from points to money system
        if (parsedState.points !== undefined && parsedState.money === undefined) {
          parsedState.money = parsedState.points * 50 // Convert points to money (generous conversion)
          delete parsedState.points
        }
        
        // Handle legacy saves that don't have lastMoneyUpdate
        if (!parsedState.lastMoneyUpdate) {
          parsedState.lastMoneyUpdate = parsedState.lastPointsUpdate || Date.now()
        }
        
        // Calculate and add accumulated money from passive generation
        const accumulatedMoney = calculateAccumulatedMoney(parsedState.ownedBlocks, parsedState.lastMoneyUpdate, parsedState.upgradeEffects)
        if (accumulatedMoney > 0) {
          parsedState.money = (parsedState.money || 0) + accumulatedMoney
          parsedState.lastMoneyUpdate = Date.now()
          setBattleLog(prev => [...prev, `💰 You earned $${accumulatedMoney.toLocaleString()} while away from your blocks!`])
        }
        
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
        // Migrate from points to money if needed
        if (data.points !== undefined && data.money === undefined) {
          data.money = data.points * 50
          delete data.points
        }
        // Ensure new field exists
        if (!data.lastMoneyUpdate) {
          data.lastMoneyUpdate = data.lastPointsUpdate || Date.now()
        }
        setGameState(data)
      }
    } catch (error) {
      console.log('Using default game state')
    } finally {
      setIsInitialized(true)
    }
  }

  // Fetch blocks from the new global API
  const fetchGlobalBlocks = async () => {
    try {
      const response = await fetch('/api/game/global-blocks')
      if (response.ok) {
        const data = await response.json()
        setSpawnedBlocks(data.blocks || [])
        if (data.blocks?.length > 0) {
          setBattleLog(prev => [...prev, `🎁 Loaded ${data.blocks.length} blocks from global arena! Mix of FREE common blocks and PREMIUM purchasable blocks!`])
        }
      } else {
        // Fallback to local generation if API fails
        if (spawnedBlocks.length === 0) {
          generateLocalBlocks(3)
          setBattleLog(prev => [...prev, '🎁 Initial blocks spawned locally!'])
        }
      }
    } catch (error) {
      console.error('Error fetching global blocks:', error)
      // Fallback to local generation
      if (spawnedBlocks.length === 0) {
        generateLocalBlocks(3)
        setBattleLog(prev => [...prev, '🎁 Initial blocks spawned locally (API error)!'])
      }
    }
  }

  // Local block generation function - improved spawning system
  const generateLocalBlocks = (count: number) => {
    const newBlocks: Block[] = []
    
    for (let i = 0; i < count && spawnedBlocks.length + newBlocks.length < 12; i++) {
      const blockType = BLOCK_TYPES[Math.floor(Math.random() * (BLOCK_TYPES.length - 1))] // Exclude secret block
      
      // Improved weighted rarity system - more balanced distribution
      const rarities: Block['rarity'][] = ['common', 'rare', 'epic', 'legendary']
      const rarityWeights = [60, 25, 12, 3] // Favor common blocks but ensure premium variety
      
      let randomValue = Math.random() * 100
      let selectedRarity: Block['rarity'] = 'common'
      
      for (let j = 0; j < rarities.length; j++) {
        if (randomValue < rarityWeights[j]) {
          selectedRarity = rarities[j]
          break
        }
        randomValue -= rarityWeights[j]
      }
      
      const baseValue = selectedRarity === 'legendary' ? 500 : selectedRarity === 'epic' ? 200 : selectedRarity === 'rare' ? 100 : 50
      
      // Set purchase properties based on rarity - common blocks are FREE, others cost money
      const isPurchasable = selectedRarity !== 'common'
      const blockPrices = {
        common: 0,
        rare: 5000,
        epic: 25000,
        legendary: 100000,
        secret: 500000
      }

      newBlocks.push({
        id: `local_block_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        name: blockType.name,
        type: blockType.type,
        rarity: selectedRarity,
        value: baseValue + Math.floor(Math.random() * baseValue * 0.5),
        power: Math.floor(Math.random() * 100) + 20,
        defense: Math.floor(Math.random() * 80) + 10,
        image: blockType.emoji,
        color: blockType.color,
        description: `A powerful ${selectedRarity} ${blockType.name} with unique crypto powers!`,
        isStealable: !isPurchasable, // Common blocks can be stolen, premium blocks cannot
        spawnTime: Date.now(),
        traits: [`${selectedRarity} rarity`, `${blockType.type.toUpperCase()} power`],
        price: isPurchasable ? blockPrices[selectedRarity] : undefined,
        isPurchasable
      })
    }
    
    if (newBlocks.length > 0) {
      setSpawnedBlocks(prev => [...prev, ...newBlocks])
    }
  }

  const resetGame = () => {
    // Clear localStorage
    localStorage.removeItem('blockWarsGameState')
    localStorage.removeItem('blockWarsBattleLog')
    
    // Reset to default state
    setGameState({
      playerId: 'player_' + Math.random().toString(36).substr(2, 9),
      coins: 1000,
      money: 0,
      level: 1,
      experience: 0,
      ownedBlocks: [],
      defenseStrength: 100,
      attackPower: 50,
      lastSpawn: Date.now(),
      nextSpawn: Date.now() + 120000,
      lastMoneyUpdate: Date.now(),
      secretBlockSpawns: 0,
      lastSecretSpawn: 0,
      nextSecretSpawn: Date.now() + Math.random() * 12 * 60 * 60 * 1000,
      isAdmin: false
    })
    
    setSpawnedBlocks([])
    setBattleLog([`🔄 Game reset! Welcome to Block Wars! You'll compete for blocks in the global arena.`])
    
    // Fetch fresh global blocks after reset
    setTimeout(() => {
      fetchGlobalBlocks()
    }, 1000)
  }



  // Admin function to manually spawn secret block via global API
  const adminSpawnSecretBlock = async () => {
    if (!gameState.isAdmin) {
      setBattleLog(prev => [...prev, `❌ Access denied! Only admins can manually spawn Secret Blocks.`])
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/game/global-blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'spawn_secret',
          adminKey: 'block_wars_admin_2025' // In production, this would be more secure
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setBattleLog(prev => [...prev, `🔧 ✨ Admin spawned a Secret Block in the global arena! All players can see it now!`])
        
        // Immediately refresh to show the new secret block
        fetchGlobalBlocks()
      } else {
        const errorData = await response.json()
        setBattleLog(prev => [...prev, `❌ Failed to spawn secret block: ${errorData.error || 'Unknown error'}`])
      }
    } catch (error) {
      setBattleLog(prev => [...prev, `❌ Network error while spawning secret block. Please try again!`])
    }
    
    setIsLoading(false)
  }



  const claimBlock = async (blockId: string) => {
    const block = spawnedBlocks.find(b => b.id === blockId)
    if (!block) {
      setBattleLog(prev => [...prev, `❌ Block not found or already claimed!`])
      return
    }

    // Check if this is a purchasable premium block
    if (block.isPurchasable) {
      setBattleLog(prev => [...prev, `❌ This is a premium block! Use the purchase button instead.`])
      return
    }

    // Check if user already has 12 blocks
    if (gameState.ownedBlocks.length >= 12) {
      setBattleLog(prev => [...prev, `❌ Collection full! You can only own 12 blocks. Sell some blocks to make space for new ones.`])
      return
    }

    setIsLoading(true)
    
    try {
      // Update game state with the claimed block
      updateGameStateAfterClaim(block)
      
      // Remove the block from spawned blocks
      setSpawnedBlocks(prev => prev.filter(b => b.id !== blockId))
      
      setBattleLog(prev => [...prev, `🎯 Successfully claimed ${block.name} for FREE! +${block.value} coins, +${block.power} attack power!`])
      
      // Record the transaction
      recordTransaction(
        block.id,
        block.name,
        block.type,
        block.rarity,
        'claim',
        undefined, // No price for claims
        block.value
      )
      
      // Don't fetch new blocks immediately - let natural spawn timer handle it
      // This prevents claimed blocks from "reappearing" immediately
    } catch (error) {
      setBattleLog(prev => [...prev, `❌ Error claiming block. Please try again!`])
    }
    
    setIsLoading(false)
  }

  const purchaseBlock = async (blockId: string) => {
    const block = spawnedBlocks.find(b => b.id === blockId)
    if (!block) {
      setBattleLog(prev => [...prev, `❌ Block not found!`])
      return
    }

    if (!block.isPurchasable || !block.price) {
      setBattleLog(prev => [...prev, `❌ This block is not for sale!`])
      return
    }

    // Check if user already has 12 blocks
    if (gameState.ownedBlocks.length >= 12) {
      setBattleLog(prev => [...prev, `❌ Collection full! You can only own 12 blocks. Sell some blocks to make space for new ones.`])
      return
    }

    // No common block requirement for purchasing - just need money

    // Check if user has enough money
    if (gameState.money < block.price!) {
      setBattleLog(prev => [...prev, `❌ Not enough money! Need $${block.price!.toLocaleString()}, you have $${gameState.money.toLocaleString()}`])
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/game/purchase-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId,
          playerId: gameState.playerId,
          playerMoney: gameState.money,
          ownedBlocks: gameState.ownedBlocks,
          blockData: block // Pass the complete block data
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update game state - add purchased block and subtract money
        setGameState(prev => ({
          ...prev,
          ownedBlocks: [...prev.ownedBlocks, { ...result.purchasedBlock, owner: prev.playerId, isPurchasable: false }],
          money: prev.money - result.price,
          coins: prev.coins + result.purchasedBlock.value, // Still get coins
          experience: prev.experience + 25, // Bonus XP for purchasing
          lastMoneyUpdate: Date.now()
        }))
        
        // Remove the block from spawned blocks
        setSpawnedBlocks(prev => prev.filter(b => b.id !== blockId))
        
        setBattleLog(prev => [...prev, `💳 ${result.message} +25 XP for smart investing!`])
        
        // Record the transaction
        recordTransaction(
          block.id,
          block.name,
          block.type,
          block.rarity,
          'purchase',
          block.price,
          block.value
        )
        
        // Don't fetch new blocks immediately - let natural spawn timer handle it
        // This prevents purchased blocks from "reappearing" immediately
      } else {
        const errorData = await response.json()
        setBattleLog(prev => [...prev, `❌ Purchase failed: ${errorData.error}`])
      }
    } catch (error) {
      setBattleLog(prev => [...prev, `❌ Network error during purchase. Please try again!`])
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
        ownedBlocks: [...prev.ownedBlocks, { ...block, owner: prev.playerId, isPurchasable: false }],
        coins: prev.coins + block.value,
        // Removed immediate money reward - blocks will earn money passively!
        experience: newExperience,
        level: newLevel,
        attackPower: prev.attackPower + (leveledUp ? 5 : 0),
        defenseStrength: prev.defenseStrength + (leveledUp ? 10 : 0),
        lastMoneyUpdate: Date.now() // Reset the money update timer
      }
    })
    
    setSpawnedBlocks(prev => prev.filter(b => b.id !== block.id))
    const moneyPerMinute = MONEY_PRODUCTION_RATES[block.rarity]
    setBattleLog(prev => [...prev, `✅ Successfully claimed ${block.name} for ${block.value} coins! This ${block.rarity} block will earn $${moneyPerMinute}/minute! (+${block.rarity === 'legendary' ? 50 : block.rarity === 'epic' ? 30 : block.rarity === 'rare' ? 20 : 10} XP)`])
  }

  const sellBlock = async (blockId: string) => {
    console.log('Attempting to sell block:', blockId)
    
    const blockToSell = gameState.ownedBlocks.find(b => b.id === blockId)
    if (!blockToSell) {
      setBattleLog(prev => [...prev, `❌ Block not found in your collection!`])
      return
    }

    console.log('Block found:', blockToSell.name, 'Value:', blockToSell.value)
    setIsLoading(true)
    
    try {
      const requestData = { 
        blockId,
        playerId: gameState.playerId,
        ownedBlocks: gameState.ownedBlocks
      }
      
      console.log('Sending sell request:', requestData)
      
      const response = await fetch('/api/game/sell-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Sell result:', result)
        
        // Update game state - remove sold block and add money (not coins)
        setGameState(prev => ({
          ...prev,
          ownedBlocks: prev.ownedBlocks.filter(block => block.id !== blockId),
          money: prev.money + result.sellPrice, // Add to money instead of coins
          experience: prev.experience + 5, // Small XP bonus for selling
          lastMoneyUpdate: Date.now() // Reset money timer since collection changed
        }))
        
        setBattleLog(prev => [...prev, `💰 ${result.message} +5 XP for trade experience!`])
        
        // Record the transaction
        recordTransaction(
          blockToSell.id,
          blockToSell.name,
          blockToSell.type,
          blockToSell.rarity,
          'sell',
          result.sellPrice, // The price received for selling
          blockToSell.value
        )
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Sell error:', errorData)
        setBattleLog(prev => [...prev, `❌ Failed to sell block: ${errorData.error}`])
      }
    } catch (error) {
      console.error('Network error selling block:', error)
      setBattleLog(prev => [...prev, `❌ Network error while selling block. Please try again!`])
    }
    
    setIsLoading(false)
  }

  const stealBlock = async (targetBlock: Block, attackType: string = 'direct') => {
    setIsLoading(true)
    
    // Get total attack power and defense including bonuses
    const totalAttackPower = gameState.attackPower + (gameState.upgradeEffects?.attackPowerBonus || 0)
    const totalDefenseStrength = gameState.defenseStrength + (gameState.upgradeEffects?.defenseStrengthBonus || 0)
    
    // Find the target enemy based on block owner
    const targetEnemy = {
      'enemy_block_1': { defenseStrength: 65, name: 'CryptoNovice' },
      'enemy_block_2': { defenseStrength: 95, name: 'BlockHunter' },
      'enemy_block_3': { defenseStrength: 130, name: 'CryptoWarrior' },
      'enemy_block_4': { defenseStrength: 180, name: 'WhaleKiller' }
    }[targetBlock.id] || { defenseStrength: 100, name: 'Unknown Player' }
    
    // Check if player can attempt steal (attack power must be > enemy defense)
    if (totalAttackPower <= targetEnemy.defenseStrength) {
      setBattleLog(prev => [...prev, `❌ Attack power too low! You need ${targetEnemy.defenseStrength + 1} attack power to target ${targetEnemy.name}.`])
      setIsLoading(false)
      return
    }
    
    // Attack type modifiers
    const attackTypeModifiers = {
      'stealth': { costMultiplier: 0.7, successModifier: -5, name: 'Stealth Strike' },
      'direct': { costMultiplier: 1.0, successModifier: 0, name: 'Direct Assault' },
      'calculated': { costMultiplier: 1.5, successModifier: 15, name: 'Calculated Strike' }
    }
    
    const attackInfo = attackTypeModifiers[attackType as keyof typeof attackTypeModifiers] || attackTypeModifiers['direct']
    
    // Calculate attack cost (now using money instead of coins)
    const baseCost = Math.floor(targetBlock.value * 0.15) // 15% of block value
    const actualCost = Math.floor(baseCost * attackInfo.costMultiplier)
    
    if (gameState.money < actualCost) {
      setBattleLog(prev => [...prev, `❌ Not enough money for ${attackInfo.name}! Need $${actualCost.toLocaleString()}.`])
      setIsLoading(false)
      return
    }
    
    // Check if collection is full
    if (gameState.ownedBlocks.length >= 12) {
      setBattleLog(prev => [...prev, `❌ Collection full! Sell some blocks to make space.`])
      setIsLoading(false)
      return
    }
    
    // Calculate success rate based on strategic formula
    const powerAdvantage = totalAttackPower - targetEnemy.defenseStrength
    const baseSuccessRate = Math.min(85, 45 + (powerAdvantage * 2)) // Max 85% base success
    const upgradeBonus = gameState.upgradeEffects?.stealSuccessBonus || 0
    const finalSuccessRate = Math.max(10, Math.min(95, baseSuccessRate + attackInfo.successModifier + upgradeBonus))
    
    const success = Math.random() * 100 < finalSuccessRate
    
    if (success) {
      // Apply steal insurance refund if available and this was a failure (but it succeeded, so no refund)
      setGameState(prev => ({
        ...prev,
        ownedBlocks: [...prev.ownedBlocks, { ...targetBlock, owner: prev.playerId, isPurchasable: false }],
        money: prev.money - actualCost,
        coins: prev.coins + targetBlock.value, // Still get coins as reward
        experience: prev.experience + (25 + (powerAdvantage * 2)), // More XP for harder targets
        lastMoneyUpdate: Date.now()
      }))
      
      const moneyPerMinute = MONEY_PRODUCTION_RATES[targetBlock.rarity]
      setBattleLog(prev => [...prev, `🎯 ${attackInfo.name} SUCCESS! Stole ${targetBlock.name} from ${targetEnemy.name}! Now earning $${moneyPerMinute}/min! (+${25 + (powerAdvantage * 2)} XP)`])
      
      // Record the transaction
      recordTransaction(
        targetBlock.id,
        targetBlock.name,
        targetBlock.type,
        targetBlock.rarity,
        'steal',
        actualCost, // Cost paid for the steal attempt
        targetBlock.value
      )
    } else {
      // Handle steal insurance refund
      const refundAmount = gameState.upgradeEffects?.stealInsurance ? Math.floor(actualCost * 0.5) : 0
      const finalCost = actualCost - refundAmount
      
      setGameState(prev => ({
        ...prev,
        money: prev.money - finalCost,
        experience: prev.experience + 5 // Small consolation XP
      }))
      
      let failMessage = `💥 ${attackInfo.name} failed against ${targetEnemy.name}! Lost $${actualCost.toLocaleString()}.`
      if (refundAmount > 0) {
        failMessage += ` Steal Insurance refunded $${refundAmount.toLocaleString()}!`
      }
      failMessage += ` (+5 XP)`
      
      setBattleLog(prev => [...prev, failMessage])
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

  const stealMoney = async (enemyId: string, attackType: string = 'direct') => {
    setIsLoading(true)
    
    // Get total attack power and defense including bonuses
    const totalAttackPower = gameState.attackPower + (gameState.upgradeEffects?.attackPowerBonus || 0)
    
    // Find the target enemy
    const enemyData = {
      'enemy_1': { defenseStrength: 65, money: 12500, name: 'CryptoNovice' },
      'enemy_2': { defenseStrength: 95, money: 28750, name: 'BlockHunter' },
      'enemy_3': { defenseStrength: 130, money: 67500, name: 'CryptoWarrior' },
      'enemy_4': { defenseStrength: 180, money: 142500, name: 'WhaleKiller' }
    }[enemyId] || { defenseStrength: 100, money: 50000, name: 'Unknown Player' }
    
    // Check if player can attempt steal (attack power must be > enemy defense)
    if (totalAttackPower <= enemyData.defenseStrength) {
      setBattleLog(prev => [...prev, `❌ Attack power too low! You need ${enemyData.defenseStrength + 1} attack power to target ${enemyData.name}.`])
      setIsLoading(false)
      return
    }
    
    // Attack type modifiers
    const attackTypeModifiers = {
      'stealth': { costMultiplier: 0.7, successModifier: -5, name: 'Stealth Strike' },
      'direct': { costMultiplier: 1.0, successModifier: 0, name: 'Direct Assault' },
      'calculated': { costMultiplier: 1.5, successModifier: 15, name: 'Calculated Strike' }
    }
    
    const attackInfo = attackTypeModifiers[attackType as keyof typeof attackTypeModifiers] || attackTypeModifiers['direct']
    
    // Calculate attack cost (8% of enemy's money as base cost)
    const baseCost = Math.floor(enemyData.money * 0.08)
    const actualCost = Math.floor(baseCost * attackInfo.costMultiplier)
    
    if (gameState.money < actualCost) {
      setBattleLog(prev => [...prev, `❌ Not enough money for ${attackInfo.name}! Need $${actualCost.toLocaleString()}.`])
      setIsLoading(false)
      return
    }
    
    // Calculate success rate based on strategic formula
    const powerAdvantage = totalAttackPower - enemyData.defenseStrength
    const baseSuccessRate = Math.min(85, 45 + (powerAdvantage * 2)) // Max 85% base success
    const upgradeBonus = gameState.upgradeEffects?.stealSuccessBonus || 0
    const finalSuccessRate = Math.max(10, Math.min(95, baseSuccessRate + attackInfo.successModifier + upgradeBonus))
    
    // Calculate potential money steal (15-25% of enemy's money based on success rate)
    const stealPercentage = 0.15 + (finalSuccessRate / 1000)
    const potentialSteal = Math.floor(enemyData.money * stealPercentage)
    
    const success = Math.random() * 100 < finalSuccessRate
    
    if (success) {
      // Apply money multiplier bonus if available
      const moneyMultiplier = 1 + (gameState.upgradeEffects?.moneyMultiplierBonus || 0)
      const finalSteal = Math.floor(potentialSteal * moneyMultiplier)
      
      setGameState(prev => ({
        ...prev,
        money: prev.money - actualCost + finalSteal, // Lose cost, gain stolen money
        experience: prev.experience + (20 + (powerAdvantage * 1.5)), // XP based on difficulty
        lastMoneyUpdate: Date.now()
      }))
      
      let successMessage = `💰 ${attackInfo.name} SUCCESS! Stole $${finalSteal.toLocaleString()} from ${enemyData.name}!`
      if (moneyMultiplier > 1) {
        successMessage += ` Money multiplier bonus applied! (+${Math.round((moneyMultiplier - 1) * 100)}%)`
      }
      successMessage += ` (+${20 + Math.floor(powerAdvantage * 1.5)} XP)`
      
      setBattleLog(prev => [...prev, successMessage])
    } else {
      // Handle steal insurance refund
      const refundAmount = gameState.upgradeEffects?.stealInsurance ? Math.floor(actualCost * 0.5) : 0
      const finalCost = actualCost - refundAmount
      
      setGameState(prev => ({
        ...prev,
        money: prev.money - finalCost,
        experience: prev.experience + 3 // Small consolation XP
      }))
      
      let failMessage = `💥 ${attackInfo.name} failed against ${enemyData.name}! Lost $${actualCost.toLocaleString()}.`
      if (refundAmount > 0) {
        failMessage += ` Steal Insurance refunded $${refundAmount.toLocaleString()}!`
      }
      failMessage += ` (+3 XP)`
      
      setBattleLog(prev => [...prev, failMessage])
    }
    
    setIsLoading(false)
  }

  const toggleAdminMode = () => {
    setGameState(prev => ({
      ...prev,
      isAdmin: !prev.isAdmin
    }))
    setBattleLog(prev => [...prev, `🔧 Admin mode ${!gameState.isAdmin ? 'enabled' : 'disabled'}!`])
  }

  // Fetch store items from API
  const fetchStoreItems = async () => {
    try {
      const response = await fetch('/api/game/store', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Store data received:', data) // Debug log
        
        if (data.success) {
          setStoreItems(data.items || [])
          setStoreCategories(data.categories || {
            power: 'Increase your offensive capabilities',
            defense: 'Protect your blocks from thieves', 
            special: 'Unique abilities and bonuses'
          })
          setBattleLog(prev => [...prev, `✅ Loaded ${data.totalItems || data.items?.length || 0} store items`])
        } else {
          throw new Error(data.error || 'Failed to load store data')
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching store items:', error)
      setBattleLog(prev => [...prev, '❌ Failed to load store items - using fallback data'])
      
      // Set fallback categories
      setStoreCategories({
        power: 'Increase your offensive capabilities with attack upgrades, critical strikes, and combat bonuses',
        defense: 'Protect your blocks from thieves with shields, fortifications, and defensive abilities', 
        special: 'Unique abilities and economic bonuses including profit boosters, passive income, and utility upgrades'
      })
    }
  }

  // Purchase upgrade from store
  const purchaseUpgrade = async (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId)
    if (!item) {
      setBattleLog(prev => [...prev, `❌ Item not found!`])
      return
    }

    const currentLevel = gameState.upgrades?.[itemId] || 0
    const actualPrice = Math.floor(item.price * Math.pow(1.5, currentLevel))

    if (gameState.money < actualPrice) {
      setBattleLog(prev => [...prev, `❌ Not enough money! Need $${actualPrice.toLocaleString()}, you have $${gameState.money.toLocaleString()}`])
      return
    }

    if (currentLevel >= item.maxLevel) {
      setBattleLog(prev => [...prev, `❌ ${item.name} is already at maximum level!`])
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/game/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          playerId: gameState.playerId,
          playerMoney: gameState.money,
          currentUpgrades: gameState.upgrades
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update game state with new upgrade
        setGameState(prev => {
          const newUpgrades = { ...prev.upgrades, [itemId]: result.newLevel }
          const currentEffects = prev.upgradeEffects || {
            attackPowerBonus: 0,
            defenseStrengthBonus: 0,
            stealSuccessBonus: 0,
            blockProtectionBonus: 0,
            moneyMultiplierBonus: 0,
            collectionSizeBonus: 0,
            earlyDetection: false,
            stealInsurance: false
          }
          
          // Apply new upgrade effects
          const newEffects = {
            attackPowerBonus: currentEffects.attackPowerBonus + result.upgradeEffects.attackPowerBonus,
            defenseStrengthBonus: currentEffects.defenseStrengthBonus + result.upgradeEffects.defenseStrengthBonus,
            stealSuccessBonus: currentEffects.stealSuccessBonus + result.upgradeEffects.stealSuccessBonus,
            blockProtectionBonus: currentEffects.blockProtectionBonus + result.upgradeEffects.blockProtectionBonus,
            moneyMultiplierBonus: currentEffects.moneyMultiplierBonus + result.upgradeEffects.moneyMultiplierBonus,
            collectionSizeBonus: currentEffects.collectionSizeBonus + result.upgradeEffects.collectionSizeBonus,
            earlyDetection: currentEffects.earlyDetection || result.upgradeEffects.earlyDetection,
            stealInsurance: currentEffects.stealInsurance || result.upgradeEffects.stealInsurance
          }

          return {
            ...prev,
            money: result.remainingMoney,
            upgrades: newUpgrades,
            upgradeEffects: newEffects,
            // Apply permanent stat bonuses
            attackPower: itemId.includes('attack') ? prev.attackPower + result.upgradeEffects.attackPowerBonus : prev.attackPower,
            defenseStrength: itemId.includes('defense') ? prev.defenseStrength + result.upgradeEffects.defenseStrengthBonus : prev.defenseStrength
          }
        })
        
        setBattleLog(prev => [...prev, `🛒 ${result.message} Power up complete!`])
        
      } else {
        const errorData = await response.json()
        setBattleLog(prev => [...prev, `❌ Purchase failed: ${errorData.error}`])
      }
    } catch (error) {
      setBattleLog(prev => [...prev, `❌ Network error during purchase. Please try again!`])
    }
    
    setIsLoading(false)
  }

  // Load store items on initialization
  useEffect(() => {
    fetchStoreItems()
  }, [])

  // Also load store items when game is initialized (backup)
  useEffect(() => {
    if (isInitialized) {
      fetchStoreItems()
    }
  }, [isInitialized])

  // Helper function to record block transactions
  const recordTransaction = async (
    blockId: string,
    blockName: string,
    blockType: string,
    blockRarity: string,
    transactionType: string,
    price?: number,
    value?: number
  ) => {
    try {
      await fetch('/api/game/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: gameState.playerId,
          playerName: session?.user?.name || `Player ${gameState.playerId.slice(-6)}`,
          blockId,
          blockName,
          blockType,
          blockRarity,
          transactionType,
          price,
          value
        })
      })
    } catch (error) {
      console.error('Error recording transaction:', error)
      // Don't fail the main operation if transaction logging fails
    }
  }

  return (
    <div className="min-h-screen bg-tech-gradient p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border-neon-green/30 glow-green">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neon-gradient rounded-xl flex items-center justify-center glow-hover">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-neon-green-bright to-neon-blue-bright bg-clip-text text-transparent">
                    Block Wars - Competitive Economy
                  </CardTitle>
                  <p className="text-muted-foreground">🆓 Common blocks are FREE • 💳 Premium blocks cost money • 💰 All blocks earn money passively!</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-yellow-500">{gameState.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-green-500">${gameState.money.toLocaleString()}</span>
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

        {/* Defidash Rewards Section */}
        <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 shadow-lg">
          <CardHeader className="pb-4">
            <div className="text-center">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>🏆 Weekly Defidash Rewards 🏆</span>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">Top 5 leaderboard positions earn $DEFIDASH tokens every week!</p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mt-4">
              {/* 1st Place */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-2 border-yellow-400/40 rounded-lg p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-2xl mb-1">🥇</div>
                  <div className="text-xs font-bold text-yellow-400 mb-1">1st Place</div>
                  <div className="text-lg font-bold text-yellow-300">1,000</div>
                  <div className="text-xs text-yellow-400/80">$DEFIDASH</div>
                </div>
              </div>

              {/* 2nd Place */}
              <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/30 border-2 border-gray-400/40 rounded-lg p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="text-xs font-bold text-gray-300 mb-1">2nd Place</div>
                  <div className="text-lg font-bold text-gray-200">750</div>
                  <div className="text-xs text-gray-300/80">$DEFIDASH</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/30 border-2 border-orange-500/40 rounded-lg p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="text-xs font-bold text-orange-400 mb-1">3rd Place</div>
                  <div className="text-lg font-bold text-orange-300">500</div>
                  <div className="text-xs text-orange-400/80">$DEFIDASH</div>
                </div>
              </div>

              {/* 4th Place */}
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/30 border-2 border-blue-500/40 rounded-lg p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-2xl mb-1">🎖️</div>
                  <div className="text-xs font-bold text-blue-400 mb-1">4th Place</div>
                  <div className="text-lg font-bold text-blue-300">300</div>
                  <div className="text-xs text-blue-400/80">$DEFIDASH</div>
                </div>
              </div>

              {/* 5th Place */}
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/30 border-2 border-purple-500/40 rounded-lg p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-2xl mb-1">🏅</div>
                  <div className="text-xs font-bold text-purple-400 mb-1">5th Place</div>
                  <div className="text-lg font-bold text-purple-300">200</div>
                  <div className="text-xs text-purple-400/80">$DEFIDASH</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">Weekly Reset: Sunday 12:00 UTC</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Transaction Ticker - Rolling Bar */}
        <TransactionTicker />

        {/* New Economy Status */}
        <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <span>Economy Status</span>
                </CardTitle>
              </div>
              <div className="text-right">
                {gameState.ownedBlocks.length > 0 ? (
                  <div className="flex items-center space-x-2 text-green-500">
                    <Crown className="w-4 h-4" />
                    <span className="font-bold">EARNING MONEY!</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-orange-500">
                    <Timer className="w-4 h-4" />
                    <span className="font-bold">COLLECT BLOCKS TO START</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-500/10 border border-gray-500/20 rounded p-2 text-center">
                <p className="text-muted-foreground">Total Blocks</p>
                <p className="font-bold text-lg">
                  {gameState.ownedBlocks.length}
                  <span className="text-sm text-muted-foreground">/12</span>
                </p>
                <p className="text-xs text-muted-foreground">Collection size limit</p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-center">
                <p className="text-muted-foreground">Money Earned</p>
                <p className="font-bold text-lg text-green-500">${gameState.money.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateMoneyPerMinute(gameState.ownedBlocks) > 0 ? 
                    `+$${calculateMoneyPerMinute(gameState.ownedBlocks)}/min` : 
                    'Collect blocks to start earning!'
                  }
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-center">
                <p className="text-muted-foreground">Premium Access</p>
                <p className="font-bold text-lg">✅ ALWAYS UNLOCKED</p>
                <p className="text-xs text-muted-foreground">Buy premium blocks with money</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile & Game Stats */}
          <div className="lg:col-span-1 space-y-4">
            <UserBoard 
              gameMoney={gameState.money}
              gameLevel={gameState.level}
              gameExp={gameState.experience}
            />
            <GameStats gameState={gameState} />
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="arena" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="arena" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Arena</span>
                </TabsTrigger>
                <TabsTrigger value="collection" className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Collection</span>
                </TabsTrigger>
                <TabsTrigger value="store" className="flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span>Store</span>
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
                  onPurchaseBlock={purchaseBlock}
                  isLoading={isLoading}
                  currentBlockCount={gameState.ownedBlocks.length}
                  playerMoney={gameState.money}
                />
              </TabsContent>

              <TabsContent value="collection">
                <BlockCollection 
                  ownedBlocks={gameState.ownedBlocks}
                  coins={gameState.coins}
                  onSellBlock={sellBlock}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="store" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span>Upgrade Store</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Use your earned money to buy powerful upgrades! Upgrades stack and get more expensive with each level.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Category Selection */}
                      <div className="flex space-x-2">
                        {['power', 'defense', 'special'].map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category as any)}
                            className={`capitalize ${
                              selectedCategory === category 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'hover:bg-purple-600/20'
                            }`}
                          >
                            {category === 'power' && '⚔️'}
                            {category === 'defense' && '🛡️'}
                            {category === 'special' && '✨'}
                            {' '}
                            {category}
                          </Button>
                        ))}
                      </div>

                      {/* Category Description */}
                      <div className="text-sm text-muted-foreground">
                        {storeCategories[selectedCategory] || (Object.keys(storeCategories).length === 0 ? 'Loading category info...' : 'Category information unavailable')}
                      </div>

                      {/* Store Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {storeItems
                          .filter(item => item.category === selectedCategory)
                          .map(item => {
                            const currentLevel = gameState.upgrades?.[item.id] || 0
                            const actualPrice = Math.floor(item.price * Math.pow(1.5, currentLevel))
                            const canAfford = gameState.money >= actualPrice
                            const maxLevel = currentLevel >= item.maxLevel
                            
                            return (
                              <Card key={item.id} className={`border-2 ${maxLevel ? 'border-green-500/50 bg-green-500/5' : canAfford ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-500/20'}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-2xl" style={{ color: item.color }}>
                                        {item.icon}
                                      </span>
                                      <div>
                                        <h3 className="font-bold text-sm">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                          Level {currentLevel}/{item.maxLevel}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-sm" style={{ color: item.color }}>
                                        ${actualPrice.toLocaleString()}
                                      </p>
                                      {currentLevel > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          Base: ${item.price.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {item.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {item.effect}
                                    </Badge>
                                    
                                    <Button
                                      size="sm"
                                      disabled={!canAfford || maxLevel || isLoading}
                                      onClick={() => purchaseUpgrade(item.id)}
                                      className={`text-xs ${
                                        maxLevel 
                                          ? 'bg-green-600 text-white'
                                          : canAfford
                                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                          : 'bg-gray-600 text-gray-300'
                                      }`}
                                    >
                                      {isLoading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                      {maxLevel ? 'MAX' : canAfford ? 'BUY' : 'TOO EXPENSIVE'}
                                    </Button>
                                  </div>
                                  
                                  {currentLevel > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-500/20">
                                      <p className="text-xs text-green-400">
                                        ✅ Owned (Level {currentLevel}) - {item.effect} active
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )
                          })}
                      </div>

                      {/* Current Upgrades Summary */}
                      {gameState.upgrades && Object.keys(gameState.upgrades).length > 0 && (
                        <Card className="bg-blue-500/10 border-blue-500/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Star className="w-5 h-5 text-blue-400" />
                              <span>Active Upgrades</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {(gameState.upgradeEffects?.attackPowerBonus || 0) > 0 && (
                                <div className="text-red-400">⚔️ +{gameState.upgradeEffects?.attackPowerBonus || 0} Attack</div>
                              )}
                              {(gameState.upgradeEffects?.defenseStrengthBonus || 0) > 0 && (
                                <div className="text-blue-400">🛡️ +{gameState.upgradeEffects?.defenseStrengthBonus || 0} Defense</div>
                              )}
                              {(gameState.upgradeEffects?.stealSuccessBonus || 0) > 0 && (
                                <div className="text-orange-400">💥 +{gameState.upgradeEffects?.stealSuccessBonus || 0}% Steal Rate</div>
                              )}
                              {(gameState.upgradeEffects?.blockProtectionBonus || 0) > 0 && (
                                <div className="text-cyan-400">🏰 +{gameState.upgradeEffects?.blockProtectionBonus || 0}% Protection</div>
                              )}
                              {(gameState.upgradeEffects?.moneyMultiplierBonus || 0) > 0 && (
                                <div className="text-green-400">💰 +{gameState.upgradeEffects?.moneyMultiplierBonus || 0}% Money</div>
                              )}
                              {(gameState.upgradeEffects?.collectionSizeBonus || 0) > 0 && (
                                <div className="text-yellow-400">📦 +{gameState.upgradeEffects?.collectionSizeBonus || 0} Slots</div>
                              )}
                              {gameState.upgradeEffects?.earlyDetection && (
                                <div className="text-purple-400">📡 Early Detection</div>
                              )}
                              {gameState.upgradeEffects?.stealInsurance && (
                                <div className="text-pink-400">🔒 Steal Insurance</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="battles">
                <BattleArena 
                  gameState={gameState}
                  onStealBlock={stealBlock}
                  onStealMoney={stealMoney}
                  onDefendBlocks={defendBlocks}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="leaderboard">
                <Leaderboard gameState={gameState} />
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
                  <p className="text-sm text-muted-foreground">Welcome to Block Wars! Start claiming blocks to see activity here.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
