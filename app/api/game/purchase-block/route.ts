
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
  price?: number
  isPurchasable?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blockId, playerId, playerMoney, ownedBlocks } = body
    
    if (!blockId || !playerId || playerMoney === undefined || !Array.isArray(ownedBlocks)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Forward the purchase request to the global blocks API
    const purchaseResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/game/global-blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'purchase_block',
        blockId,
        playerId,
        money: playerMoney,
        ownedBlocks
      })
    })
    
    const result = await purchaseResponse.json()
    
    if (purchaseResponse.ok) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: purchaseResponse.status })
    }
    
  } catch (error) {
    console.error('Error processing block purchase:', error)
    return NextResponse.json({ 
      error: 'Failed to process purchase', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
