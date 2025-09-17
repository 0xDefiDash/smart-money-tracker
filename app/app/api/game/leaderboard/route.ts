export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'

interface LeaderboardEntry {
  playerId: string
  playerName: string
  level: number
  money: number
  blocksOwned: number
  totalValue: number
  winRate: number
  battlesWon: number
  battlesLost: number
  moneyPerMinute: number
  rareBlocksOwned: number
  epicBlocksOwned: number
  legendaryBlocksOwned: number
  secretBlocksOwned: number
  rank: number
  badge: string
  badgeColor: string
  isCurrentPlayer?: boolean
}

// In-memory player data store (in production this would be a database)
const playerDataStore = new Map<string, LeaderboardEntry>()

// Initialize with some demo players for showcase
const initializeDemoPlayers = () => {
  if (playerDataStore.size === 0) {
    const demoPlayers: LeaderboardEntry[] = [
  {
    playerId: 'player_1',
    playerName: 'CryptoKing_2025',
    level: 47,
    money: 2847392,
    blocksOwned: 12, // Max blocks
    totalValue: 3200000,
    winRate: 89.5,
    battlesWon: 234,
    battlesLost: 27,
    moneyPerMinute: 8450,
    rareBlocksOwned: 3,
    epicBlocksOwned: 4,
    legendaryBlocksOwned: 3,
    secretBlocksOwned: 2,
    rank: 1,
    badge: 'Diamond Whale',
    badgeColor: '#3B82F6'
  },
  {
    playerId: 'player_2', 
    playerName: 'BlockMaster_Pro',
    level: 42,
    money: 1923847,
    blocksOwned: 12,
    totalValue: 2100000,
    winRate: 76.3,
    battlesWon: 189,
    battlesLost: 59,
    moneyPerMinute: 6200,
    rareBlocksOwned: 4,
    epicBlocksOwned: 3,
    legendaryBlocksOwned: 2,
    secretBlocksOwned: 3,
    rank: 2,
    badge: 'Platinum Master',
    badgeColor: '#8B5CF6'
  },
  {
    playerId: 'player_3',
    playerName: 'WhaleHunter_77',
    level: 38,
    money: 1456291,
    blocksOwned: 11,
    totalValue: 1800000,
    winRate: 82.1,
    battlesWon: 156,
    battlesLost: 34,
    moneyPerMinute: 4850,
    rareBlocksOwned: 2,
    epicBlocksOwned: 3,
    legendaryBlocksOwned: 3,
    secretBlocksOwned: 3,
    rank: 3,
    badge: 'Gold Hunter',
    badgeColor: '#F59E0B'
  },
  {
    playerId: 'player_4',
    playerName: 'DefiMaster_2025',
    level: 35,
    money: 1234567,
    blocksOwned: 10,
    totalValue: 1500000,
    winRate: 71.4,
    battlesWon: 125,
    battlesLost: 50,
    moneyPerMinute: 3900,
    rareBlocksOwned: 3,
    epicBlocksOwned: 2,
    legendaryBlocksOwned: 2,
    secretBlocksOwned: 3,
    rank: 4,
    badge: 'DeFi Lord',
    badgeColor: '#10B981'
  },
  {
    playerId: 'player_5',
    playerName: 'NFTCollector_X',
    level: 33,
    money: 1098765,
    blocksOwned: 12,
    totalValue: 1200000,
    winRate: 68.9,
    battlesWon: 98,
    battlesLost: 44,
    moneyPerMinute: 3200,
    rareBlocksOwned: 5,
    epicBlocksOwned: 2,
    legendaryBlocksOwned: 1,
    secretBlocksOwned: 4,
    rank: 5,
    badge: 'Silver Collector',
    badgeColor: '#6B7280'
  },
  {
    playerId: 'player_6',
    playerName: 'SatoshiDisciple',
    level: 31,
    money: 987654,
    blocksOwned: 9,
    totalValue: 1100000,
    winRate: 74.2,
    battlesWon: 89,
    battlesLost: 31,
    moneyPerMinute: 2800,
    rareBlocksOwned: 2,
    epicBlocksOwned: 2,
    legendaryBlocksOwned: 2,
    secretBlocksOwned: 3,
    rank: 6,
    badge: 'Bitcoin Disciple',
    badgeColor: '#F7931A'
  },
  {
    playerId: 'player_7',
    playerName: 'AltcoinAlpha',
    level: 29,
    money: 876543,
    blocksOwned: 8,
    totalValue: 950000,
    winRate: 63.8,
    battlesWon: 76,
    battlesLost: 43,
    moneyPerMinute: 2400,
    rareBlocksOwned: 3,
    epicBlocksOwned: 1,
    legendaryBlocksOwned: 1,
    secretBlocksOwned: 3,
    rank: 7,
    badge: 'Alt Explorer',
    badgeColor: '#EF4444'
  },
  {
    playerId: 'player_8',
    playerName: 'YieldFarmer_Pro',
    level: 27,
    money: 765432,
    blocksOwned: 7,
    totalValue: 820000,
    winRate: 69.1,
    battlesWon: 65,
    battlesLost: 29,
    moneyPerMinute: 2100,
    rareBlocksOwned: 2,
    epicBlocksOwned: 1,
    legendaryBlocksOwned: 1,
    secretBlocksOwned: 3,
    rank: 8,
    badge: 'Yield Master',
    badgeColor: '#059669'
  },
  {
    playerId: 'player_9',
    playerName: 'StakingStorm',
    level: 25,
    money: 654321,
    blocksOwned: 6,
    totalValue: 700000,
    winRate: 58.7,
    battlesWon: 54,
    battlesLost: 38,
    moneyPerMinute: 1800,
    rareBlocksOwned: 2,
    epicBlocksOwned: 1,
    legendaryBlocksOwned: 0,
    secretBlocksOwned: 3,
    rank: 9,
    badge: 'Staking Pro',
    badgeColor: '#7C3AED'
  },
  {
    playerId: 'player_10',
    playerName: 'LiquidityLord',
    level: 23,
    money: 543210,
    blocksOwned: 5,
    totalValue: 580000,
    winRate: 61.3,
    battlesWon: 49,
    battlesLost: 31,
    moneyPerMinute: 1500,
    rareBlocksOwned: 1,
    epicBlocksOwned: 1,
    legendaryBlocksOwned: 0,
    secretBlocksOwned: 3,
    rank: 10,
    badge: 'Liquidity Seeker',
    badgeColor: '#0891B2'
  }
    ]
    
    // Store demo players
    demoPlayers.forEach(player => {
      playerDataStore.set(player.playerId, player)
    })
  }
}

// Helper function to calculate player badge based on stats
const calculatePlayerBadge = (player: Partial<LeaderboardEntry>) => {
  const { money = 0, winRate = 0, blocksOwned = 0, legendaryBlocksOwned = 0, secretBlocksOwned = 0 } = player
  
  if (money >= 2000000 && winRate >= 85) {
    return { badge: 'Diamond Whale', badgeColor: '#3B82F6' }
  } else if (money >= 1500000 && winRate >= 75) {
    return { badge: 'Platinum Master', badgeColor: '#8B5CF6' }
  } else if (money >= 1000000 && winRate >= 70) {
    return { badge: 'Gold Hunter', badgeColor: '#F59E0B' }
  } else if (money >= 700000 && (legendaryBlocksOwned >= 2 || secretBlocksOwned >= 3)) {
    return { badge: 'Epic Collector', badgeColor: '#10B981' }
  } else if (money >= 500000 && blocksOwned >= 8) {
    return { badge: 'Block Master', badgeColor: '#6B7280' }
  } else if (money >= 250000 && winRate >= 60) {
    return { badge: 'Rising Star', badgeColor: '#F59E0B' }
  } else if (blocksOwned >= 5) {
    return { badge: 'Collector', badgeColor: '#059669' }
  } else {
    return { badge: 'Rookie', badgeColor: '#9CA3AF' }
  }
}

// Function to update player data in real-time
const updatePlayerData = (playerId: string, gameState: any) => {
  const existingPlayer = playerDataStore.get(playerId) || {
    playerId,
    playerName: playerId === 'current_player' ? 'You' : `Player_${playerId.slice(-4)}`,
    level: 1,
    money: 0,
    blocksOwned: 0,
    totalValue: 0,
    winRate: 0,
    battlesWon: 0,
    battlesLost: 0,
    moneyPerMinute: 0,
    rareBlocksOwned: 0,
    epicBlocksOwned: 0,
    legendaryBlocksOwned: 0,
    secretBlocksOwned: 0,
    rank: 0,
    badge: 'Rookie',
    badgeColor: '#9CA3AF'
  }

  // Count blocks by rarity
  const blockCounts = {
    rare: 0,
    epic: 0,
    legendary: 0,
    secret: 0
  }
  
  gameState.ownedBlocks?.forEach((block: any) => {
    if (block.rarity) {
      blockCounts[block.rarity as keyof typeof blockCounts]++
    }
  })

  // Update player stats
  const updatedPlayer: LeaderboardEntry = {
    ...existingPlayer,
    level: gameState.level || existingPlayer.level,
    money: gameState.money || 0,
    blocksOwned: Math.min(gameState.ownedBlocks?.length || 0, 12), // Enforce 12-block limit
    totalValue: (gameState.money || 0) + (gameState.ownedBlocks?.reduce((total: number, block: any) => total + (block.value || 0), 0) || 0),
    moneyPerMinute: gameState.moneyPerMinute || existingPlayer.moneyPerMinute,
    rareBlocksOwned: blockCounts.rare,
    epicBlocksOwned: blockCounts.epic,
    legendaryBlocksOwned: blockCounts.legendary,
    secretBlocksOwned: blockCounts.secret,
    // Maintain battle stats (would be updated from battle results)
    battlesWon: gameState.battlesWon || existingPlayer.battlesWon,
    battlesLost: gameState.battlesLost || existingPlayer.battlesLost,
    winRate: gameState.battlesWon || gameState.battlesLost ? 
      ((gameState.battlesWon || 0) / ((gameState.battlesWon || 0) + (gameState.battlesLost || 0))) * 100 : 
      existingPlayer.winRate
  }

  // Calculate badge
  const badgeInfo = calculatePlayerBadge(updatedPlayer)
  updatedPlayer.badge = badgeInfo.badge
  updatedPlayer.badgeColor = badgeInfo.badgeColor

  playerDataStore.set(playerId, updatedPlayer)
  return updatedPlayer
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId') || 'current_player'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Initialize demo players if needed
    initializeDemoPlayers()
    
    // Get all players from store
    const allPlayers = Array.from(playerDataStore.values())
    
    // Check if current player exists in leaderboard
    let currentPlayer = playerDataStore.get(playerId)
    if (!currentPlayer) {
      // Create new player with default stats
      currentPlayer = {
        playerId,
        playerName: 'You',
        level: 1,
        money: 0,
        blocksOwned: 0,
        totalValue: 0,
        winRate: 0,
        battlesWon: 0,
        battlesLost: 0,
        moneyPerMinute: 0,
        rareBlocksOwned: 0,
        epicBlocksOwned: 0,
        legendaryBlocksOwned: 0,
        secretBlocksOwned: 0,
        rank: 0,
        badge: 'Rookie',
        badgeColor: '#9CA3AF',
        isCurrentPlayer: true
      }
      playerDataStore.set(playerId, currentPlayer)
      allPlayers.push(currentPlayer)
    }
    
    // Sort by money and assign ranks
    allPlayers.sort((a, b) => b.money - a.money)
    allPlayers.forEach((entry, index) => {
      entry.rank = index + 1
      entry.isCurrentPlayer = entry.playerId === playerId
    })
    
    // Return top entries plus current player if not in top
    const topEntries = allPlayers.slice(0, limit)
    const currentPlayerEntry = allPlayers.find(entry => entry.playerId === playerId)
    
    let result = topEntries
    if (currentPlayerEntry && !topEntries.includes(currentPlayerEntry)) {
      result.push(currentPlayerEntry)
    }
    
    return NextResponse.json({
      leaderboard: result,
      totalPlayers: allPlayers.length,
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

// POST endpoint to update player data in real-time
export async function POST(request: NextRequest) {
  try {
    const { playerId, gameState } = await request.json()
    
    if (!playerId || !gameState) {
      return NextResponse.json(
        { error: 'Player ID and game state are required' },
        { status: 400 }
      )
    }
    
    // Initialize demo players if needed
    initializeDemoPlayers()
    
    // Update player data
    const updatedPlayer = updatePlayerData(playerId, gameState)
    
    return NextResponse.json({
      success: true,
      player: updatedPlayer,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating player data:', error)
    return NextResponse.json(
      { error: 'Failed to update player data' },
      { status: 500 }
    )
  }
}
