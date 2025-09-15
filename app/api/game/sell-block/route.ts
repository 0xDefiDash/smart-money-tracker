
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
}

// Selling price multipliers based on rarity
const SELL_PRICE_MULTIPLIERS = {
  common: 0.6,      // 60% of original value
  rare: 0.65,       // 65% of original value  
  epic: 0.7,        // 70% of original value
  legendary: 0.75,  // 75% of original value
  secret: 0.8       // 80% of original value
}

export async function POST(request: NextRequest) {
  try {
    const { blockId, playerId, ownedBlocks } = await request.json()
    
    if (!blockId || !playerId || !Array.isArray(ownedBlocks)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Find the block to sell
    const blockToSell = ownedBlocks.find((block: Block) => block.id === blockId)
    
    if (!blockToSell) {
      return NextResponse.json({ error: 'Block not found in your collection' }, { status: 404 })
    }
    
    // Calculate sell price
    const sellMultiplier = SELL_PRICE_MULTIPLIERS[blockToSell.rarity as keyof typeof SELL_PRICE_MULTIPLIERS]
    const sellPrice = Math.floor(blockToSell.value * sellMultiplier)
    
    // In a real application, this would update the database
    // For now, we'll return the data for the client to handle
    return NextResponse.json({
      success: true,
      soldBlock: blockToSell,
      sellPrice,
      message: `Successfully sold ${blockToSell.name} for ${sellPrice} coins!`
    })
    
  } catch (error) {
    console.error('Error selling block:', error)
    return NextResponse.json({ error: 'Failed to sell block' }, { status: 500 })
  }
}
