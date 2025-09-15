

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
  owner?: string
  isStealable: boolean
  spawnTime: number
  traits: string[]
  price?: number // New: Purchase price for premium blocks
  isPurchasable?: boolean // New: Whether this block can be purchased
}

// Block prices in money (not coins)
const BLOCK_PRICES = {
  common: 0,        // Free
  rare: 5000,       // $5,000
  epic: 25000,      // $25,000
  legendary: 100000, // $100,000
  secret: 500000    // $500,000
}

// Epic blocks that can be purchased
const EPIC_BLOCKS = [
  {
    name: 'DeFi Protocol Master',
    type: 'defi_master', 
    color: '#9945FF',
    emoji: '🏛️',
    description: 'Master of decentralized finance protocols, yield farming champion!',
    traits: ['DeFi Expert', 'Yield Farmer', 'Protocol King'],
    image: '🏛️'
  },
  {
    name: 'NFT Collection Whale',
    type: 'nft_whale',
    color: '#FF6B6B', 
    emoji: '🖼️',
    description: 'Owns the rarest NFT collections and knows the art market inside out!',
    traits: ['NFT Collector', 'Art Connoisseur', 'Digital Asset King'],
    image: '🖼️'
  }
]

const LEGENDARY_BLOCKS = [
  {
    name: 'James Wynn The Legendary Trader',
    type: 'legendary_trader',
    color: '#FFD700',
    emoji: '👑',
    description: 'A legendary crypto trader with unprecedented market insight. His trades are the stuff of legends!',
    traits: ['Market Genius', 'Legendary Status', 'Epic Gains'],
    image: '/images/blocks/james-wynn-legendary-trader.jpg'
  },
  {
    name: 'Satoshi Nakamoto Block',
    type: 'satoshi',
    color: '#F7931A',
    emoji: '🎭',
    description: 'The mysterious creator of Bitcoin himself! Ultimate crypto power!',
    traits: ['Bitcoin Creator', 'Anonymous Legend', 'Crypto God'],
    image: '🎭'
  },
  {
    name: 'Vitalik Buterin Block', 
    type: 'vitalik',
    color: '#627EEA',
    emoji: '🧠',
    description: 'The genius behind Ethereum and smart contracts!',
    traits: ['Ethereum Founder', 'Smart Contract Pioneer', 'Blockchain Visionary'],
    image: '🧠'
  }
]

const SECRET_BLOCKS = [
  {
    name: 'The Ultimate Crypto Prophecy',
    type: 'prophecy',
    color: '#FFD700',
    emoji: '🚀',
    description: 'Predicts the future of all cryptocurrencies. The most powerful block in existence!',
    traits: ['Future Vision', 'Market Oracle', 'Ultimate Power'],
    image: '🚀'
  }
]

const BLOCK_TYPES = [
  { name: 'Bitcoin Block', type: 'btc', color: '#F7931A', emoji: '₿' },
  { name: 'Ethereum Block', type: 'eth', color: '#627EEA', emoji: 'Ξ' },
  { name: 'Solana Block', type: 'sol', color: '#9945FF', emoji: '◎' },
  { name: 'Cardano Block', type: 'ada', color: '#0033AD', emoji: '₳' },
  { name: 'Polygon Block', type: 'matic', color: '#8247E5', emoji: '⟐' },
  { name: 'Avalanche Block', type: 'avax', color: '#E84142', emoji: '🔺' },
  { name: 'Chainlink Block', type: 'link', color: '#375BD2', emoji: '🔗' },
  { name: 'Uniswap Block', type: 'uni', color: '#FF007A', emoji: '🦄' },
]

// Global storage for blocks (in production, use a database)
let globalBlocks: Block[] = []

export async function GET(request: NextRequest) {
  try {
    // Force regenerate blocks on each call to ensure fresh blocks with proper properties
    generateInitialBlocks()
    
    return NextResponse.json({ 
      blocks: globalBlocks,
      totalBlocks: globalBlocks.length,
      message: 'Global blocks fetched successfully'
    })
    
  } catch (error) {
    console.error('Error fetching global blocks:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch blocks', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, playerId, money, ownedBlocks } = body
    
    if (action === 'purchase_block') {
      return handleBlockPurchase(playerId, body.blockId, money, ownedBlocks)
    } else if (action === 'spawn_common') {
      return handleSpawnCommon()
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

function generateInitialBlocks() {
  const blocks: Block[] = []
  
  // Generate 2-3 common blocks (free) - reduced to make room for premium blocks
  const commonBlockCount = Math.floor(Math.random() * 2) + 2
  for (let i = 0; i < commonBlockCount; i++) {
    const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
    blocks.push(createBlock('common', blockType, false))
  }
  
  // Always add 1-2 purchasable rare blocks
  const rareBlockCount = Math.floor(Math.random() * 2) + 1
  for (let i = 0; i < rareBlockCount; i++) {
    const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
    blocks.push(createBlock('rare', blockType, true))
  }
  
  // Always add 1 purchasable epic block
  const epicBlock = EPIC_BLOCKS[Math.floor(Math.random() * EPIC_BLOCKS.length)]
  blocks.push(createPremiumBlock('epic', epicBlock, true))
  
  // Always add 1 purchasable legendary block
  const legendaryBlock = LEGENDARY_BLOCKS[Math.floor(Math.random() * LEGENDARY_BLOCKS.length)]
  blocks.push(createPremiumBlock('legendary', legendaryBlock, true))
  
  // Always add 1 purchasable secret block for testing
  const secretBlock = SECRET_BLOCKS[0]
  blocks.push(createPremiumBlock('secret', secretBlock, true))
  
  globalBlocks = blocks
  console.log(`Generated ${blocks.length} blocks:`, blocks.map(b => `${b.name} (${b.rarity}) - purchasable: ${b.isPurchasable}, price: ${b.price}`))
}

function createBlock(rarity: Block['rarity'], blockType: any, isPurchasable: boolean): Block {
  const baseValue = rarity === 'legendary' ? 500 : rarity === 'epic' ? 200 : rarity === 'rare' ? 100 : 50
  const price = isPurchasable ? BLOCK_PRICES[rarity] : 0
  
  const block = {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: blockType.name,
    type: blockType.type,
    rarity,
    value: baseValue + Math.floor(Math.random() * baseValue * 0.5),
    power: Math.floor(Math.random() * 100) + 20,
    defense: Math.floor(Math.random() * 80) + 10,
    image: blockType.emoji,
    color: blockType.color,
    description: `A ${rarity} ${blockType.name} with unique crypto powers!`,
    isStealable: !isPurchasable,
    spawnTime: Date.now(),
    traits: [`${rarity} rarity`, `${blockType.type.toUpperCase()} power`],
    price: price,
    isPurchasable: isPurchasable
  }
  
  return block
}

function createPremiumBlock(rarity: Block['rarity'], premiumBlock: any, isPurchasable: boolean): Block {
  const baseValue = rarity === 'secret' ? 2000 : rarity === 'legendary' ? 1000 : rarity === 'epic' ? 500 : 200
  const price = isPurchasable ? BLOCK_PRICES[rarity] : 0
  
  const block = {
    id: `premium_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: premiumBlock.name,
    type: premiumBlock.type,
    rarity,
    value: baseValue + Math.floor(Math.random() * baseValue * 0.3),
    power: Math.floor(Math.random() * 150) + (rarity === 'secret' ? 200 : rarity === 'legendary' ? 150 : 100),
    defense: Math.floor(Math.random() * 120) + (rarity === 'secret' ? 100 : rarity === 'legendary' ? 80 : 60),
    image: premiumBlock.image,
    color: premiumBlock.color,
    description: premiumBlock.description,
    isStealable: false, // Premium blocks cannot be stolen
    spawnTime: Date.now(),
    traits: premiumBlock.traits,
    price: price,
    isPurchasable: isPurchasable
  }
  
  return block
}

function handleBlockPurchase(playerId: string, blockId: string, playerMoney: number, ownedBlocks: Block[]) {
  const block = globalBlocks.find(b => b.id === blockId)
  
  if (!block) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 })
  }
  
  if (!block.isPurchasable) {
    return NextResponse.json({ error: 'This block cannot be purchased' }, { status: 400 })
  }
  
  if (!block.price) {
    return NextResponse.json({ error: 'Block price not set' }, { status: 400 })
  }
  
  // Check if player has enough money
  if (playerMoney < block.price) {
    return NextResponse.json({ 
      error: `Not enough money! Need $${block.price.toLocaleString()}, you have $${playerMoney.toLocaleString()}` 
    }, { status: 400 })
  }
  
  // No additional requirements - just need enough money to purchase
  
  // Remove the block from global pool
  globalBlocks = globalBlocks.filter(b => b.id !== blockId)
  
  // Add a new block to maintain supply
  setTimeout(() => {
    if (block.rarity === 'common') {
      const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
      globalBlocks.push(createBlock('common', blockType, false))
    }
  }, 30000) // Add new block after 30 seconds
  
  return NextResponse.json({
    success: true,
    purchasedBlock: { ...block, owner: playerId },
    price: block.price,
    message: `Successfully purchased ${block.name} for $${block.price.toLocaleString()}!`
  })
}

function handleSpawnCommon() {
  // Add 2-3 new common blocks
  const newBlockCount = Math.floor(Math.random() * 2) + 2
  
  for (let i = 0; i < newBlockCount; i++) {
    const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
    globalBlocks.push(createBlock('common', blockType, false))
  }
  
  return NextResponse.json({
    success: true,
    newBlocks: newBlockCount,
    message: `${newBlockCount} new common blocks spawned!`
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, adminKey } = body
    
    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== 'block_wars_admin_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (action === 'spawn_secret') {
      // Admin can manually spawn a secret block
      const secretBlock = SECRET_BLOCKS[0]
      const newSecretBlock = createPremiumBlock('secret', secretBlock, true)
      globalBlocks.push(newSecretBlock)
      
      return NextResponse.json({
        success: true,
        spawnedBlock: newSecretBlock,
        message: 'Secret block manually spawned!'
      })
    }
    
    return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in PUT handler:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
