
import { NextRequest, NextResponse } from 'next/server'

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
  { name: 'Dogecoin Block', type: 'doge', color: '#C2A633', emoji: '🐕' },
  { name: 'Secret Block', type: 'secret', color: '#FFD700', emoji: '🚀', isSecret: true }
]

// Global shared state for all users - in production, this would be in a database
let globalBlocks: Block[] = []
let lastSpawnTime = Date.now()
let nextSpawnTime = Date.now() + 120000 // 2 minutes from now

// Initialize with some blocks on server start
if (globalBlocks.length === 0) {
  generateInitialBlocks()
}

function generateInitialBlocks() {
  const numBlocks = 3 // Start with 3 blocks
  const newBlocks: Block[] = []
  
  for (let i = 0; i < numBlocks; i++) {
    const blockType = BLOCK_TYPES[Math.floor(Math.random() * (BLOCK_TYPES.length - 1))] // Exclude secret block from random generation
    
    // Weighted rarity system
    const rarities: Block['rarity'][] = ['common', 'rare', 'epic', 'legendary']
    const rarityWeights = [50, 30, 15, 5] // Weighted probability
    
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
    
    newBlocks.push({
      id: `global_block_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      name: blockType.name,
      type: blockType.type,
      rarity: selectedRarity,
      value: baseValue + Math.floor(Math.random() * baseValue * 0.5),
      power: Math.floor(Math.random() * 100) + 20,
      defense: Math.floor(Math.random() * 80) + 10,
      image: blockType.emoji,
      color: blockType.color,
      description: `A powerful ${selectedRarity} ${blockType.name} with unique crypto powers!`,
      isStealable: true,
      spawnTime: Date.now(),
      traits: [`${selectedRarity} rarity`, `${blockType.type.toUpperCase()} power`]
    })
  }
  
  globalBlocks = newBlocks
  console.log(`Global spawn: Generated ${numBlocks} initial blocks`)
}

function generateNewBlocks() {
  // Don't spawn if we already have too many blocks (limit to 12 total)
  if (globalBlocks.length >= 12) {
    console.log('Global arena is full, skipping spawn')
    return 0
  }

  // Generate 2-3 blocks
  const numBlocks = Math.floor(Math.random() * 2) + 2
  const newBlocks: Block[] = []
  
  for (let i = 0; i < numBlocks && (globalBlocks.length + i) < 12; i++) {
    const blockType = BLOCK_TYPES[Math.floor(Math.random() * (BLOCK_TYPES.length - 1))] // Exclude secret block
    
    // Weighted rarity system
    const rarities: Block['rarity'][] = ['common', 'rare', 'epic', 'legendary']
    const rarityWeights = [50, 30, 15, 5]
    
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
    
    newBlocks.push({
      id: `global_block_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      name: blockType.name,
      type: blockType.type,
      rarity: selectedRarity,
      value: baseValue + Math.floor(Math.random() * baseValue * 0.5),
      power: Math.floor(Math.random() * 100) + 20,
      defense: Math.floor(Math.random() * 80) + 10,
      image: blockType.emoji,
      color: blockType.color,
      description: `A powerful ${selectedRarity} ${blockType.name} with unique crypto powers!`,
      isStealable: true,
      spawnTime: Date.now(),
      traits: [`${selectedRarity} rarity`, `${blockType.type.toUpperCase()} power`]
    })
  }
  
  globalBlocks = [...globalBlocks, ...newBlocks]
  console.log(`Global spawn: Generated ${newBlocks.length} new blocks, total: ${globalBlocks.length}`)
  return newBlocks.length
}

// GET - Fetch current global blocks and spawn info
export async function GET() {
  try {
    const now = Date.now()
    
    // Check if it's time to spawn new blocks
    if (now >= nextSpawnTime) {
      const spawned = generateNewBlocks()
      lastSpawnTime = now
      nextSpawnTime = now + 120000 // Next spawn in 2 minutes
    }
    
    const timeUntilSpawn = Math.max(0, Math.floor((nextSpawnTime - now) / 1000))
    
    return NextResponse.json({
      blocks: globalBlocks,
      timeUntilSpawn,
      totalBlocks: globalBlocks.length,
      maxBlocks: 12
    })
  } catch (error) {
    console.error('Error fetching global blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
}

// POST - Claim a block (remove from global pool)
export async function POST(request: NextRequest) {
  try {
    const { blockId, playerId } = await request.json()
    
    if (!blockId || !playerId) {
      return NextResponse.json({ error: 'Missing blockId or playerId' }, { status: 400 })
    }
    
    // Find the block
    const blockIndex = globalBlocks.findIndex(b => b.id === blockId)
    
    if (blockIndex === -1) {
      return NextResponse.json({ error: 'Block not found or already claimed' }, { status: 404 })
    }
    
    // Remove the block from global pool (first come, first serve!)
    const claimedBlock = globalBlocks[blockIndex]
    globalBlocks.splice(blockIndex, 1)
    
    console.log(`Block ${claimedBlock.name} (${blockId}) claimed by ${playerId}`)
    console.log(`Remaining global blocks: ${globalBlocks.length}`)
    
    return NextResponse.json({
      success: true,
      claimedBlock,
      remainingBlocks: globalBlocks.length
    })
  } catch (error) {
    console.error('Error claiming block:', error)
    return NextResponse.json({ error: 'Failed to claim block' }, { status: 500 })
  }
}

// DELETE - Admin function to clear all blocks
export async function DELETE() {
  try {
    globalBlocks = []
    lastSpawnTime = Date.now()
    nextSpawnTime = Date.now() + 10000 // Spawn new blocks in 10 seconds
    
    return NextResponse.json({ success: true, message: 'All blocks cleared' })
  } catch (error) {
    console.error('Error clearing blocks:', error)
    return NextResponse.json({ error: 'Failed to clear blocks' }, { status: 500 })
  }
}

// PUT - Admin function to spawn secret block
export async function PUT(request: NextRequest) {
  try {
    const { action, adminKey } = await request.json()
    
    // Simple admin verification (in production, use proper auth)
    if (adminKey !== 'block_wars_admin_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (action === 'spawn_secret') {
      const secretBlockType = BLOCK_TYPES.find(type => type.isSecret)
      if (!secretBlockType) {
        return NextResponse.json({ error: 'Secret block type not found' }, { status: 400 })
      }
      
      const secretBlock: Block = {
        id: `secret_block_global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: secretBlockType.name,
        type: secretBlockType.type,
        rarity: 'secret',
        value: 10000,
        power: 500,
        defense: 400,
        image: '/secret-block-astronaut.jpg',
        color: secretBlockType.color,
        description: 'The ultimate Secret Block! An astronaut from the crypto cosmos with unimaginable power. Earns $5,000 per minute!',
        isStealable: true,
        spawnTime: Date.now(),
        traits: ['Ultra Rare', 'Secret Rarity', 'Cosmic Power', 'Astronaut']
      }
      
      globalBlocks.push(secretBlock)
      console.log('Admin spawned a Secret Block globally')
      
      return NextResponse.json({
        success: true,
        secretBlock,
        totalBlocks: globalBlocks.length
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error handling admin action:', error)
    return NextResponse.json({ error: 'Failed to handle admin action' }, { status: 500 })
  }
}
