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
    const body = await request.json()
    const { blockId, playerId, ownedBlocks } = body
    
    console.log('Sell request received:', { blockId, playerId, blocksCount: ownedBlocks?.length })
    
    if (!blockId) {
      return NextResponse.json({ error: 'Block ID is required' }, { status: 400 })
    }
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }
    
    if (!Array.isArray(ownedBlocks)) {
      return NextResponse.json({ error: 'Owned blocks must be an array' }, { status: 400 })
    }
    
    // Find the block to sell
    const blockToSell = ownedBlocks.find((block: Block) => block.id === blockId)
    
    if (!blockToSell) {
      return NextResponse.json({ error: 'Block not found in your collection' }, { status: 404 })
    }
    
    // Calculate sell price
    const sellMultiplier = SELL_PRICE_MULTIPLIERS[blockToSell.rarity as keyof typeof SELL_PRICE_MULTIPLIERS] || 0.6
    const sellPrice = Math.floor(blockToSell.value * sellMultiplier)
    
    console.log(`Selling ${blockToSell.name} for $${sellPrice}`)
    
    // In a real application, this would update the database
    // For now, we'll return the data for the client to handle
    return NextResponse.json({
      success: true,
      soldBlock: blockToSell,
      sellPrice,
      message: `Successfully sold ${blockToSell.name} for $${sellPrice}!`
    })
    
  } catch (error) {
    console.error('Error selling block:', error)
    return NextResponse.json({ 
      error: 'Failed to sell block', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
