
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { blockId, playerId, playerMoney, ownedBlocks } = await request.json()
    
    if (!blockId || !playerId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Since we're using local state management, we need to simulate the purchase
    // In a real app, you'd retrieve the actual block from database and verify purchase
    
    // For now, we'll extract block information from the blockId if it contains the data
    // Or use reasonable defaults for purchased blocks
    
    let blockName = 'Premium Block'
    let blockType = 'premium'
    let blockRarity: 'rare' | 'epic' | 'legendary' | 'secret' = 'rare'
    let blockPrice = 5000
    let blockImage = '💎'
    let blockColor = '#3B82F6'
    
    // Extract info from blockId if possible
    if (blockId.includes('rare')) {
      blockRarity = 'rare'
      blockPrice = 5000
      blockImage = '🔷'
      blockColor = '#3B82F6'
    } else if (blockId.includes('epic')) {
      blockRarity = 'epic'  
      blockPrice = 25000
      blockImage = '🔮'
      blockColor = '#8B5CF6'
    } else if (blockId.includes('legendary')) {
      blockRarity = 'legendary'
      blockPrice = 100000
      blockImage = '👑'
      blockColor = '#F59E0B'
    } else if (blockId.includes('secret')) {
      blockRarity = 'secret'
      blockPrice = 500000
      blockImage = '🚀'
      blockColor = '#FFD700'
    }

    // Check if player has enough money
    if (playerMoney < blockPrice) {
      return NextResponse.json({ 
        error: `Not enough money! Need $${blockPrice.toLocaleString()}, you have $${playerMoney.toLocaleString()}` 
      }, { status: 400 })
    }

    // Check collection limit
    if (ownedBlocks && ownedBlocks.length >= 12) {
      return NextResponse.json({ 
        error: 'Collection full! You can only own 12 blocks.' 
      }, { status: 400 })
    }

    const purchasedBlock = {
      id: blockId,
      name: blockName,
      type: blockType,
      rarity: blockRarity,
      value: blockPrice * 0.2, // Base coins value is 20% of price
      power: blockRarity === 'legendary' ? 150 : blockRarity === 'epic' ? 120 : blockRarity === 'rare' ? 80 : 60,
      defense: blockRarity === 'legendary' ? 140 : blockRarity === 'epic' ? 110 : blockRarity === 'rare' ? 70 : 50,
      image: blockImage,
      color: blockColor,
      description: `A premium ${blockRarity} block with enhanced crypto powers!`,
      isStealable: false, // Premium blocks can't be stolen
      spawnTime: Date.now(),
      traits: [`${blockRarity} rarity`, 'Premium', 'Protected']
    }

    // Return the purchase result
    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${purchasedBlock.name} for $${blockPrice.toLocaleString()}!`,
      purchasedBlock,
      price: blockPrice
    })
  } catch (error) {
    console.error('Error purchasing block:', error)
    return NextResponse.json({ error: 'Failed to purchase block' }, { status: 500 })
  }
}
