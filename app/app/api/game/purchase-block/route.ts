
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { blockId, playerId, playerMoney, ownedBlocks } = await request.json()
    
    if (!blockId || !playerId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Fetch the actual block data from global blocks to preserve original information
    let originalBlock = null
    try {
      const globalBlocksResponse = await fetch('http://localhost:3000/api/game/global-blocks')
      const globalBlocksData = await globalBlocksResponse.json()
      
      if (globalBlocksData.blocks) {
        originalBlock = globalBlocksData.blocks.find((block: any) => block.id === blockId)
      }
    } catch (error) {
      console.error('Error fetching global blocks:', error)
    }

    // If we couldn't find the original block, return error
    if (!originalBlock) {
      return NextResponse.json({ error: 'Block not found or no longer available' }, { status: 404 })
    }

    // Use original block data
    const blockName = originalBlock.name
    const blockType = originalBlock.type
    const blockRarity = originalBlock.rarity
    const blockPrice = originalBlock.price || 5000
    const blockImage = originalBlock.image
    const blockColor = originalBlock.color
    const blockDescription = originalBlock.description
    const blockTraits = originalBlock.traits || []

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
      name: blockName, // Preserve original name (e.g., "100xDarren", "0xSweep", etc.)
      type: blockType, // Preserve original type
      rarity: blockRarity, // Preserve original rarity
      value: originalBlock.value || (blockPrice * 0.2), // Use original value or fallback
      power: originalBlock.power || (blockRarity === 'legendary' ? 150 : blockRarity === 'epic' ? 120 : blockRarity === 'rare' ? 80 : 60),
      defense: originalBlock.defense || (blockRarity === 'legendary' ? 140 : blockRarity === 'epic' ? 110 : blockRarity === 'rare' ? 70 : 50),
      image: blockImage, // Preserve original image
      color: blockColor, // Preserve original color
      description: blockDescription, // Preserve original description
      isStealable: false, // Premium blocks can't be stolen (this is the main change when purchased)
      spawnTime: originalBlock.spawnTime || Date.now(),
      traits: [...blockTraits, 'Owned', 'Protected'] // Preserve original traits and add ownership traits
    }

    // Return the purchase result
    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${blockName} for $${blockPrice.toLocaleString()}!`,
      purchasedBlock,
      price: blockPrice
    })
  } catch (error) {
    console.error('Error purchasing block:', error)
    return NextResponse.json({ error: 'Failed to purchase block' }, { status: 500 })
  }
}
