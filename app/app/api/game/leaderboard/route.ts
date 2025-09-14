
import { NextRequest, NextResponse } from 'next/server'

interface LeaderboardEntry {
  playerId: string
  playerName: string
  level: number
  points: number
  blocksOwned: number
  rank: number
  isCurrentPlayer?: boolean
}

// Mock leaderboard data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    playerId: 'player_1',
    playerName: 'CryptoKing_2025',
    level: 47,
    points: 2847392,
    blocksOwned: 834,
    rank: 1
  },
  {
    playerId: 'player_2', 
    playerName: 'BlockMaster_Pro',
    level: 42,
    points: 1923847,
    blocksOwned: 567,
    rank: 2
  },
  {
    playerId: 'player_3',
    playerName: 'WhaleHunter_77',
    level: 38,
    points: 1456291,
    blocksOwned: 412,
    rank: 3
  },
  {
    playerId: 'player_4',
    playerName: 'DefiMaster_2025',
    level: 35,
    points: 1234567,
    blocksOwned: 356,
    rank: 4
  },
  {
    playerId: 'player_5',
    playerName: 'NFTCollector_X',
    level: 33,
    points: 1098765,
    blocksOwned: 289,
    rank: 5
  },
  {
    playerId: 'player_6',
    playerName: 'SatoshiDisciple',
    level: 31,
    points: 987654,
    blocksOwned: 234,
    rank: 6
  },
  {
    playerId: 'player_7',
    playerName: 'AltcoinAlpha',
    level: 29,
    points: 876543,
    blocksOwned: 198,
    rank: 7
  },
  {
    playerId: 'player_8',
    playerName: 'YieldFarmer_Pro',
    level: 27,
    points: 765432,
    blocksOwned: 167,
    rank: 8
  },
  {
    playerId: 'player_9',
    playerName: 'StakingStorm',
    level: 25,
    points: 654321,
    blocksOwned: 145,
    rank: 9
  },
  {
    playerId: 'player_10',
    playerName: 'LiquidityLord',
    level: 23,
    points: 543210,
    blocksOwned: 123,
    rank: 10
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId') || 'current_player'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Add current player to leaderboard if not present
    const leaderboardWithPlayer = [...MOCK_LEADERBOARD]
    
    // Check if current player exists in leaderboard
    const playerExists = leaderboardWithPlayer.find(entry => entry.playerId === playerId)
    
    if (!playerExists) {
      // Add current player with modest stats
      leaderboardWithPlayer.push({
        playerId,
        playerName: 'You',
        level: 1,
        points: 0,
        blocksOwned: 0,
        rank: leaderboardWithPlayer.length + 1,
        isCurrentPlayer: true
      })
    }
    
    // Sort by points and assign ranks
    leaderboardWithPlayer.sort((a, b) => b.points - a.points)
    leaderboardWithPlayer.forEach((entry, index) => {
      entry.rank = index + 1
      if (entry.playerId === playerId) {
        entry.isCurrentPlayer = true
      }
    })
    
    // Return top entries plus current player if not in top
    const topEntries = leaderboardWithPlayer.slice(0, limit)
    const currentPlayerEntry = leaderboardWithPlayer.find(entry => entry.playerId === playerId)
    
    let result = topEntries
    if (currentPlayerEntry && !topEntries.includes(currentPlayerEntry)) {
      result.push(currentPlayerEntry)
    }
    
    return NextResponse.json({
      leaderboard: result,
      totalPlayers: leaderboardWithPlayer.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
