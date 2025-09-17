export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'

const BLOCK_TYPES = [
  { name: 'Bitcoin Block', type: 'btc', color: '#F7931A', emoji: '₿' },
  { name: 'Ethereum Block', type: 'eth', color: '#627EEA', emoji: 'Ξ' },


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

  { name: 'Cosmos Block', type: 'atom', color: '#2E3148', emoji: '🌌' },
  { name: 'Dogecoin Block', type: 'doge', color: '#C2A633', emoji: '🐕' }
]

type BlockRarity = 'common' | 'rare' | 'epic' | 'legendary'

interface Block {
  id: string
  name: string
  type: string
  rarity: BlockRarity
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

function generateRandomBlock(): Block {
  const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
  const rarities: BlockRarity[] = ['common', 'rare', 'epic', 'legendary']
  const rarityWeights = [50, 30, 15, 5] // Weighted probability
  
  let randomValue = Math.random() * 100
  let selectedRarity: BlockRarity = 'common'
  
  for (let i = 0; i < rarities.length; i++) {
    if (randomValue < rarityWeights[i]) {
      selectedRarity = rarities[i]
      break
    }
    randomValue -= rarityWeights[i]
  }
  
  const baseValue = {
    common: 50,
    rare: 100,
    epic: 200,
    legendary: 500
  }[selectedRarity]
  
  const basePower = {
    common: 20,
    rare: 40,
    epic: 70,
    legendary: 95
  }[selectedRarity]
  
  const baseDefense = {
    common: 10,
    rare: 25,
    epic: 45,
    legendary: 75
  }[selectedRarity]
  
  const value = baseValue + Math.floor(Math.random() * baseValue * 0.5)
  const power = basePower + Math.floor(Math.random() * 20)
  const defense = baseDefense + Math.floor(Math.random() * 15)
  
  const traits = [
    `${selectedRarity} rarity`,
    `${blockType.type.toUpperCase()} power`,
    power > 80 ? 'High Power' : power > 50 ? 'Medium Power' : 'Low Power',
    defense > 60 ? 'High Defense' : defense > 30 ? 'Medium Defense' : 'Low Defense'
  ]
  
  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: blockType.name,
    type: blockType.type,
    rarity: selectedRarity,
    value,
    power,
    defense,
    image: blockType.emoji,
    color: blockType.color,
    description: `A ${selectedRarity} ${blockType.name} with unique crypto powers and ${value} value!`,
    isStealable: true,
    spawnTime: Date.now(),
    traits: traits.slice(0, 3) // Take first 3 traits
  }
}

export async function POST(request: NextRequest) {
  try {
    // Generate 2-3 random blocks to keep spawning more controlled
    const numBlocks = Math.floor(Math.random() * 2) + 2 // Now generates 2-3 blocks
    const newBlocks: Block[] = []
    
    for (let i = 0; i < numBlocks; i++) {
      newBlocks.push(generateRandomBlock())
    }
    
    // Add some delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`Spawning ${numBlocks} new blocks`)
    return NextResponse.json(newBlocks)
  } catch (error) {
    console.error('Error spawning blocks:', error)
    return NextResponse.json(
      { error: 'Failed to spawn blocks' },
      { status: 500 }
    )
  }
}
