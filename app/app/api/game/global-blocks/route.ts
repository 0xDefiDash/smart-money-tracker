export const dynamic = 'force-dynamic'

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
  price?: number // Purchase price for premium blocks
  isPurchasable?: boolean // Whether this block can be purchased
}

const BLOCK_TYPES = [
  { name: 'Bitcoin Block', type: 'btc', color: '#F7931A', emoji: '₿' },
  { name: 'Ethereum Block', type: 'eth', color: '#627EEA', emoji: 'Ξ' },
  { name: 'Solana Block', type: 'sol', color: '#9945FF', emoji: '◎' },
  { name: 'Cardano Block', type: 'ada', color: '#0033AD', emoji: '₳' }
]

const EPIC_BLOCKS = [
  { 
    name: 'James Wynn The Legendary trader', 
    type: 'james-wynn', 
    color: '#DAA520', 
    image: '/images/james-wynn.jpg',
    description: 'James Wynn The Legendary trader - Master of crypto markets with legendary trading prowess!'
  }
]

const LEGENDARY_BLOCKS = [
  { 
    name: 'AIXBT AGENT', 
    type: 'aixbt', 
    color: '#8A2BE2', 
    image: '/images/aixbt-agent.jpg',
    description: 'The legendary AIXBT AGENT - AI-powered crypto intelligence and trading automation!'
  }
]

const SECRET_BLOCKS = [
  { 
    name: 'Jesse Pollak', 
    type: 'jesse', 
    color: '#FFD700', 
    image: '/images/jesse-pollak.jpg',
    description: 'The legendary Jesse Pollak - Base Protocol architect and crypto visionary!'
  }
]

// Global shared state for all users - in production, this would be in a database
let globalBlocks: Block[] = []
let lastSpawnTime = Date.now()
let nextSpawnTime = Date.now() + 120000 // 2 minutes from now
let isInitialized = false

// Block prices based on rarity
const BLOCK_PRICES = {
  common: 0,        // Common blocks are FREE
  rare: 5000,       // $5,000
  epic: 25000,      // $25,000
  legendary: 100000, // $100,000
  secret: 500000    // $500,000
}

function generateInitialBlocks() {
  const numBlocks = 6 // Start with more blocks (mix of free and paid)
  const newBlocks: Block[] = []
  
  for (let i = 0; i < numBlocks; i++) {
    // Check if we should spawn a secret block (very rare: 1% chance)
    const isSecretBlock = Math.random() < 0.01
    
    if (isSecretBlock && SECRET_BLOCKS.length > 0) {
      const secretBlock = SECRET_BLOCKS[Math.floor(Math.random() * SECRET_BLOCKS.length)]
      
      newBlocks.push({
        id: `secret_block_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        name: secretBlock.name,
        type: secretBlock.type,
        rarity: 'secret',
        value: 10000, // Secret blocks are extremely valuable
        power: 999, // Maximum power
        defense: 999, // Maximum defense
        image: secretBlock.image,
        color: secretBlock.color,
        description: secretBlock.description,
        isStealable: false, // Secret blocks can't be stolen (premium)
        spawnTime: Date.now(),
        traits: ['Secret Rarity', 'Legendary Power', 'Base Protocol', 'Crypto Visionary'],
        price: BLOCK_PRICES.secret,
        isPurchasable: true
      })
    } else {
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
      
      if (selectedRarity === 'legendary' && LEGENDARY_BLOCKS.length > 0) {
        // Use AIXBT AGENT for legendary blocks
        const legendaryBlock = LEGENDARY_BLOCKS[Math.floor(Math.random() * LEGENDARY_BLOCKS.length)]
        
        newBlocks.push({
          id: `legendary_block_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          name: legendaryBlock.name,
          type: legendaryBlock.type,
          rarity: 'legendary',
          value: baseValue + Math.floor(Math.random() * baseValue * 0.5),
          power: Math.floor(Math.random() * 50) + 150, // Legendary blocks have higher power
          defense: Math.floor(Math.random() * 50) + 120, // Legendary blocks have higher defense
          image: legendaryBlock.image,
          color: legendaryBlock.color,
          description: legendaryBlock.description,
          isStealable: false, // Legendary blocks can't be stolen (premium)
          spawnTime: Date.now(),
          traits: ['Legendary Rarity', 'AI Agent', 'Crypto Intelligence', 'Trading Bot'],
          price: BLOCK_PRICES.legendary,
          isPurchasable: true
        })
      } else if (selectedRarity === 'epic' && EPIC_BLOCKS.length > 0) {
        // Use Bullrun_Gravano for epic blocks
        const epicBlock = EPIC_BLOCKS[Math.floor(Math.random() * EPIC_BLOCKS.length)]
        
        newBlocks.push({
          id: `epic_block_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          name: epicBlock.name,
          type: epicBlock.type,
          rarity: 'epic',
          value: baseValue + Math.floor(Math.random() * baseValue * 0.5),
          power: Math.floor(Math.random() * 40) + 100, // Epic blocks have high power
          defense: Math.floor(Math.random() * 40) + 80, // Epic blocks have high defense
          image: epicBlock.image,
          color: epicBlock.color,
          description: epicBlock.description,
          isStealable: false, // Epic blocks can't be stolen (premium)
          spawnTime: Date.now(),
          traits: ['Epic Rarity', 'Legendary Trader', 'Market Master', 'Trading Expertise'],
          price: BLOCK_PRICES.epic,
          isPurchasable: true
        })
      } else {
        // Use regular block types for common and rare
        const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
        
        // Determine if block is purchasable (rare and above require payment, common is free)
        const isPurchasable = selectedRarity !== 'common'
        
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
          isStealable: !isPurchasable, // Common blocks can be stolen, premium blocks cannot
          spawnTime: Date.now(),
          traits: [`${selectedRarity} rarity`, `${blockType.type.toUpperCase()} power`],
          price: isPurchasable ? BLOCK_PRICES[selectedRarity] : undefined,
          isPurchasable
        })
      }
    }
  }
  
  globalBlocks = newBlocks
  console.log(`Global spawn: Generated ${numBlocks} initial blocks`)
}

export async function GET() {
  try {
    // Initialize blocks if not already done
    if (!isInitialized) {
      generateInitialBlocks()
      isInitialized = true
      console.log('Global blocks initialized with', globalBlocks.length, 'blocks')
    }
    
    const now = Date.now()
    const timeUntilSpawn = Math.max(0, Math.floor((nextSpawnTime - now) / 1000))
    
    console.log(`GET /api/game/global-blocks - returning ${globalBlocks.length} blocks`)
    
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

export async function DELETE() {
  try {
    globalBlocks = []
    lastSpawnTime = Date.now()
    nextSpawnTime = Date.now() + 10000 // Spawn new blocks in 10 seconds
    isInitialized = false
    
    return NextResponse.json({ success: true, message: 'All blocks cleared' })
  } catch (error) {
    console.error('Error clearing blocks:', error)
    return NextResponse.json({ error: 'Failed to clear blocks' }, { status: 500 })
  }
}