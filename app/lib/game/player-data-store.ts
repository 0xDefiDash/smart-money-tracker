
// Shared player data storage for Dash Wars game
// This module handles both leaderboard data and full player profiles

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

// In-memory player data stores (in production this would be a database)
export const playerDataStore = new Map<string, LeaderboardEntry>()
export const playerProfileStore = new Map<string, any>()

// Get full player profile
export function getPlayerProfile(playerId: string) {
  return playerProfileStore.get(playerId)
}

// Set player profile
export function setPlayerProfile(playerId: string, profileData: any) {
  playerProfileStore.set(playerId, profileData)
}

// Get leaderboard entry
export function getLeaderboardEntry(playerId: string) {
  return playerDataStore.get(playerId)
}

// Set leaderboard entry
export function setLeaderboardEntry(playerId: string, entry: LeaderboardEntry) {
  playerDataStore.set(playerId, entry)
}

// Get all players
export function getAllPlayers(): LeaderboardEntry[] {
  return Array.from(playerDataStore.values())
}

// Clear all data (for testing)
export function clearAllPlayerData() {
  playerDataStore.clear()
  playerProfileStore.clear()
}

// Get store size
export function getPlayerCount() {
  return playerDataStore.size
}
