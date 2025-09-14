
import { NextRequest, NextResponse } from 'next/server'

// Mock game state - in production this would be stored in a database
const mockGameState = {
  playerId: 'player_default',
  coins: 1000,
  points: 0,
  level: 1,
  experience: 0,
  ownedBlocks: [],
  defenseStrength: 100,
  attackPower: 50,
  lastSpawn: Date.now(),
  nextSpawn: Date.now() + 120000 // 2 minutes
}

export async function GET(request: NextRequest) {
  try {
    // In a real app, this would fetch from database based on user session
    return NextResponse.json(mockGameState)
  } catch (error) {
    console.error('Error fetching game state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const gameState = await request.json()
    
    // In a real app, this would save to database
    // For now, just return the updated state
    
    return NextResponse.json({ success: true, gameState })
  } catch (error) {
    console.error('Error saving game state:', error)
    return NextResponse.json(
      { error: 'Failed to save game state' },
      { status: 500 }
    )
  }
}
