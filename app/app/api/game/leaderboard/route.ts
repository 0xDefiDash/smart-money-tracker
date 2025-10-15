export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  playerDataStore,
  playerProfileStore,
  setLeaderboardEntry,
  setPlayerProfile,
  getAllPlayers,
  getPlayerCount
} from '@/lib/game/player-data-store'

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
  attackPower: number
  defenseStrength: number
  upgradesPurchased: number
  totalUpgradesCost: number
  lastActive: string
  rank: number
  badge: string
  badgeColor: string
  isCurrentPlayer?: boolean
}

// Helper function to add missing properties to player data
const addMissingPlayerProperties = (player: any): LeaderboardEntry => {
  const baseAttackPower = Math.floor(player.level * 2 + player.winRate * 0.5)
  const baseDefensePower = Math.floor(player.level * 1.8 + player.blocksOwned * 10)
  
  return {
    ...player,
    attackPower: player.attackPower || baseAttackPower,
    defenseStrength: player.defenseStrength || baseDefensePower,
    upgradesPurchased: player.upgradesPurchased || Math.floor(player.level / 3),
    totalUpgradesCost: player.totalUpgradesCost || Math.floor(player.money * 0.3),
    lastActive: player.lastActive || new Date().toISOString()
  }
}

// Generate sample blocks for demo players
const generateDemoBlocks = (rareCount: number, epicCount: number, legendaryCount: number, secretCount: number) => {
  const blocks = []
  const blockTypes = [
    { name: 'Bitcoin Block', type: 'btc', color: '#F7931A', emoji: '₿' },
    { name: 'Ethereum Block', type: 'eth', color: '#627EEA', emoji: 'Ξ' },
    { name: 'Solana Block', type: 'sol', color: '#9945FF', emoji: '◎' },
    { name: 'Cardano Block', type: 'ada', color: '#0033AD', emoji: '₳' },
    { name: 'Polygon Block', type: 'matic', color: '#8247E5', emoji: '⟐' },
  ]
  
  let id = 0
  
  // Add secret blocks
  for (let i = 0; i < secretCount; i++) {
    const bt = blockTypes[id % blockTypes.length]
    blocks.push({
      id: `demo_secret_${id++}`,
      name: bt.name,
      type: bt.type,
      rarity: 'secret',
      value: 1000,
      power: 150,
      defense: 120,
      image: bt.emoji,
      color: bt.color
    })
  }
  
  // Add legendary blocks
  for (let i = 0; i < legendaryCount; i++) {
    const bt = blockTypes[id % blockTypes.length]
    blocks.push({
      id: `demo_legendary_${id++}`,
      name: bt.name,
      type: bt.type,
      rarity: 'legendary',
      value: 500,
      power: 120,
      defense: 100,
      image: bt.emoji,
      color: bt.color
    })
  }
  
  // Add epic blocks
  for (let i = 0; i < epicCount; i++) {
    const bt = blockTypes[id % blockTypes.length]
    blocks.push({
      id: `demo_epic_${id++}`,
      name: bt.name,
      type: bt.type,
      rarity: 'epic',
      value: 200,
      power: 90,
      defense: 70,
      image: bt.emoji,
      color: bt.color
    })
  }
  
  // Add rare blocks
  for (let i = 0; i < rareCount; i++) {
    const bt = blockTypes[id % blockTypes.length]
    blocks.push({
      id: `demo_rare_${id++}`,
      name: bt.name,
      type: bt.type,
      rarity: 'rare',
      value: 100,
      power: 60,
      defense: 50,
      image: bt.emoji,
      color: bt.color
    })
  }
  
  return blocks
}

// Initialize with some demo players for showcase
const initializeDemoPlayers = () => {
  if (getPlayerCount() === 0) {
    const baseDemoPlayers = [
      {
        playerId: 'player_1',
        playerName: 'CryptoKing_2025',
        level: 47,
        money: 2847392,
        coins: 45000,
        experience: 4650,
        blocksOwned: 12,
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
        badgeColor: '#3B82F6',
        attackPower: 320,
        defenseStrength: 450,
        ownedBlocks: generateDemoBlocks(3, 4, 3, 2),
        twitterHandle: '@CryptoKing',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        upgradeEffects: {
          attackPowerBonus: 50,
          defenseStrengthBonus: 75,
          stealSuccessBonus: 15,
          blockProtectionBonus: 20,
          moneyMultiplierBonus: 10
        }
      },
      {
        playerId: 'player_2',
        playerName: 'BlockMaster_Pro',
        level: 42,
        money: 1923847,
        coins: 38000,
        experience: 4150,
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
        badgeColor: '#8B5CF6',
        attackPower: 285,
        defenseStrength: 390,
        ownedBlocks: generateDemoBlocks(4, 3, 2, 3),
        twitterHandle: '@BlockMaster',
        walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        upgradeEffects: {
          attackPowerBonus: 40,
          defenseStrengthBonus: 60,
          stealSuccessBonus: 12,
          blockProtectionBonus: 15,
          moneyMultiplierBonus: 8
        }
      },
      {
        playerId: 'player_3',
        playerName: 'WhaleHunter_77',
        level: 38,
        money: 1456291,
        coins: 29000,
        experience: 3750,
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
        badgeColor: '#F59E0B',
        attackPower: 260,
        defenseStrength: 350,
        ownedBlocks: generateDemoBlocks(2, 3, 3, 3),
        twitterHandle: '@WhaleHunter77',
        walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
        upgradeEffects: {
          attackPowerBonus: 35,
          defenseStrengthBonus: 50,
          stealSuccessBonus: 10,
          blockProtectionBonus: 12,
          moneyMultiplierBonus: 6
        }
      },
      {
        playerId: 'player_4',
        playerName: 'DefiMaster_2025',
        level: 35,
        money: 1234567,
        coins: 24000,
        experience: 3450,
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
        badgeColor: '#10B981',
        attackPower: 235,
        defenseStrength: 310,
        ownedBlocks: generateDemoBlocks(3, 2, 2, 3),
        twitterHandle: '@DeFiMaster',
        upgradeEffects: {
          attackPowerBonus: 30,
          defenseStrengthBonus: 45,
          stealSuccessBonus: 8,
          blockProtectionBonus: 10,
          moneyMultiplierBonus: 5
        }
      },
      {
        playerId: 'player_5',
        playerName: 'NFTCollector_X',
        level: 33,
        money: 1098765,
        coins: 22000,
        experience: 3250,
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
        badgeColor: '#6B7280',
        attackPower: 220,
        defenseStrength: 295,
        ownedBlocks: generateDemoBlocks(5, 2, 1, 4),
        twitterHandle: '@NFTCollector',
        upgradeEffects: {
          attackPowerBonus: 25,
          defenseStrengthBonus: 40,
          stealSuccessBonus: 6,
          blockProtectionBonus: 8,
          moneyMultiplierBonus: 4
        }
      },
      {
        playerId: 'player_6',
        playerName: 'SatoshiDisciple',
        level: 31,
        money: 987654,
        coins: 19000,
        experience: 3050,
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
        badgeColor: '#F7931A',
        attackPower: 205,
        defenseStrength: 275,
        ownedBlocks: generateDemoBlocks(2, 2, 2, 3),
        twitterHandle: '@SatoshiDisciple',
        upgradeEffects: {
          attackPowerBonus: 20,
          defenseStrengthBonus: 35,
          stealSuccessBonus: 5,
          blockProtectionBonus: 6,
          moneyMultiplierBonus: 3
        }
      }
    ]
    
    // Add missing properties and store demo players
    baseDemoPlayers.forEach(basePlayer => {
      const fullPlayer = addMissingPlayerProperties(basePlayer)
      setLeaderboardEntry(fullPlayer.playerId, fullPlayer)
      // Also store full profile data
      setPlayerProfile(fullPlayer.playerId, fullPlayer)
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
  const defaultPlayer = {
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
  
  const existingPlayer = playerDataStore.get(playerId) || addMissingPlayerProperties(defaultPlayer) as LeaderboardEntry

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

  // Calculate money per minute from blocks
  const MONEY_PRODUCTION_RATES = {
    common: 50,
    rare: 150,
    epic: 400,
    legendary: 1000,
    secret: 5000
  }
  
  const calculatedMoneyPerMinute = gameState.ownedBlocks?.reduce((total: number, block: any) => {
    return total + (MONEY_PRODUCTION_RATES[block.rarity as keyof typeof MONEY_PRODUCTION_RATES] || 0)
  }, 0) || 0

  // Update player stats
  const updatedPlayer: LeaderboardEntry = {
    ...existingPlayer,
    level: gameState.level || existingPlayer.level,
    money: gameState.money || 0,
    blocksOwned: Math.min(gameState.ownedBlocks?.length || 0, 12), // Enforce 12-block limit
    totalValue: (gameState.money || 0) + (gameState.ownedBlocks?.reduce((total: number, block: any) => total + (block.value || 0), 0) || 0),
    moneyPerMinute: calculatedMoneyPerMinute,
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

  setLeaderboardEntry(playerId, updatedPlayer)
  
  // Store full profile data (including blocks and additional info) for profile viewing
  const fullProfile = {
    ...updatedPlayer,
    experience: gameState.experience || 0,
    coins: gameState.coins || 0,
    ownedBlocks: gameState.ownedBlocks || [],
    attackPower: gameState.attackPower || 50,
    defenseStrength: gameState.defenseStrength || 100,
    walletAddress: gameState.walletAddress,
    twitterHandle: gameState.twitterHandle,
    upgradeEffects: gameState.upgradeEffects || {},
    createdAt: gameState.createdAt || new Date().toISOString()
  }
  setPlayerProfile(playerId, fullProfile)
  
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
    const allPlayers = getAllPlayers()
    
    // Check if current player exists in leaderboard
    let currentPlayer = playerDataStore.get(playerId)
    if (!currentPlayer) {
      // Create new player with default stats
      const defaultPlayer = {
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
      currentPlayer = addMissingPlayerProperties(defaultPlayer)
      setLeaderboardEntry(playerId, currentPlayer)
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
