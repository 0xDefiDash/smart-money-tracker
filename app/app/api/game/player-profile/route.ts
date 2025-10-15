export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPlayerProfile } from '@/lib/game/player-data-store'

// Get player profile data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    
    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }
    
    // Get profile from leaderboard cache
    const profileData = getPlayerProfile(playerId)
    
    if (!profileData) {
      return NextResponse.json(
        { error: 'Player not found. Player may need to play the game first.' },
        { status: 404 }
      )
    }
    
    // Return the full player profile
    return NextResponse.json({
      success: true,
      profile: profileData
    })
    
  } catch (error) {
    console.error('Error fetching player profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    )
  }
}
