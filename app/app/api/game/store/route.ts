

import { NextRequest, NextResponse } from 'next/server'

interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  category: 'power' | 'defense' | 'special'
  effect: string
  icon: string
  color: string
  maxLevel: number
}

// Store items available for purchase
const STORE_ITEMS: StoreItem[] = [
  // Power Upgrades
  {
    id: 'attack_boost_1',
    name: 'Attack Power I',
    description: 'Increase your attack power by 10 points',
    price: 10000,
    category: 'power',
    effect: '+10 Attack Power',
    icon: '⚔️',
    color: '#FF4444',
    maxLevel: 10
  },
  {
    id: 'attack_boost_2',
    name: 'Attack Power II',
    description: 'Increase your attack power by 25 points',
    price: 25000,
    category: 'power',
    effect: '+25 Attack Power',
    icon: '🗡️',
    color: '#FF6666',
    maxLevel: 5
  },
  {
    id: 'attack_boost_3',
    name: 'Attack Power III',
    description: 'Increase your attack power by 50 points',
    price: 75000,
    category: 'power',
    effect: '+50 Attack Power',
    icon: '⚡',
    color: '#FF8888',
    maxLevel: 5
  },
  {
    id: 'attack_boost_4',
    name: 'Attack Power IV',
    description: 'Increase your attack power by 100 points',
    price: 150000,
    category: 'power',
    effect: '+100 Attack Power',
    icon: '🔥',
    color: '#FFAA44',
    maxLevel: 3
  },
  {
    id: 'attack_boost_5',
    name: 'Attack Power V',
    description: 'Increase your attack power by 200 points',
    price: 500000,
    category: 'power',
    effect: '+200 Attack Power',
    icon: '💀',
    color: '#FF0000',
    maxLevel: 2
  },
  {
    id: 'critical_strike',
    name: 'Critical Strike',
    description: 'Increases steal success rate by 15%',
    price: 50000,
    category: 'power',
    effect: '+15% Steal Success',
    icon: '💥',
    color: '#FF8800',
    maxLevel: 3
  },
  {
    id: 'berserker_rage',
    name: 'Berserker Rage',
    description: 'Deal double damage for 30 seconds after getting attacked',
    price: 200000,
    category: 'power',
    effect: 'Revenge Mode',
    icon: '😡',
    color: '#CC0000',
    maxLevel: 1
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Each successful steal increases next steal chance by 10%',
    price: 120000,
    category: 'power',
    effect: 'Combo Bonus',
    icon: '🎯',
    color: '#FF4400',
    maxLevel: 2
  },
  
  // Defense Upgrades
  {
    id: 'defense_boost_1',
    name: 'Shield Wall I',
    description: 'Increase your defense strength by 20 points',
    price: 8000,
    category: 'defense',
    effect: '+20 Defense Strength',
    icon: '🛡️',
    color: '#4444FF',
    maxLevel: 10
  },
  {
    id: 'defense_boost_2',
    name: 'Shield Wall II',
    description: 'Increase your defense strength by 50 points',
    price: 20000,
    category: 'defense',
    effect: '+50 Defense Strength',
    icon: '🛡️',
    color: '#6666FF',
    maxLevel: 5
  },
  {
    id: 'defense_boost_3',
    name: 'Shield Wall III',
    description: 'Increase your defense strength by 100 points',
    price: 60000,
    category: 'defense',
    effect: '+100 Defense Strength',
    icon: '🔰',
    color: '#8888FF',
    maxLevel: 5
  },
  {
    id: 'defense_boost_4',
    name: 'Titanium Armor',
    description: 'Increase your defense strength by 200 points',
    price: 180000,
    category: 'defense',
    effect: '+200 Defense Strength',
    icon: '⚙️',
    color: '#AAAAFF',
    maxLevel: 3
  },
  {
    id: 'fortress_mode',
    name: 'Fortress Mode',
    description: 'Reduces chance of blocks being stolen by 20%',
    price: 75000,
    category: 'defense',
    effect: '+20% Block Protection',
    icon: '🏰',
    color: '#0088FF',
    maxLevel: 3
  },
  {
    id: 'guardian_spirit',
    name: 'Guardian Spirit',
    description: 'Automatically counterattack when someone tries to steal',
    price: 250000,
    category: 'defense',
    effect: 'Auto Counter',
    icon: '👻',
    color: '#00AAFF',
    maxLevel: 1
  },
  {
    id: 'block_sanctuary',
    name: 'Block Sanctuary',
    description: 'One random block becomes immune to theft for 24h',
    price: 100000,
    category: 'defense',
    effect: 'Daily Immunity',
    icon: '⛪',
    color: '#FFAA00',
    maxLevel: 3
  },
  {
    id: 'regenerative_shield',
    name: 'Regenerative Shield',
    description: 'Defense strength slowly regenerates after taking damage',
    price: 150000,
    category: 'defense',
    effect: 'Auto Repair',
    icon: '💚',
    color: '#00FF88',
    maxLevel: 2
  },

  // Special Upgrades
  {
    id: 'money_multiplier',
    name: 'Profit Booster',
    description: 'Increases money generation from blocks by 25%',
    price: 100000,
    category: 'special',
    effect: '+25% Money Generation',
    icon: '💰',
    color: '#00FF00',
    maxLevel: 4
  },
  {
    id: 'money_multiplier_2',
    name: 'Mega Profit Booster',
    description: 'Increases money generation from blocks by 50%',
    price: 300000,
    category: 'special',
    effect: '+50% Money Generation',
    icon: '💎',
    color: '#00CC00',
    maxLevel: 3
  },
  {
    id: 'block_radar',
    name: 'Block Radar',
    description: 'Shows premium blocks 30 seconds earlier',
    price: 40000,
    category: 'special',
    effect: 'Early Block Detection',
    icon: '📡',
    color: '#FF00FF',
    maxLevel: 1
  },
  {
    id: 'collection_expander',
    name: 'Collection Expander',
    description: 'Increases block collection limit by 2',
    price: 150000,
    category: 'special',
    effect: '+2 Block Slots',
    icon: '📦',
    color: '#FFFF00',
    maxLevel: 6
  },
  {
    id: 'steal_insurance',
    name: 'Steal Insurance',
    description: 'Get 50% refund when steal attempts fail',
    price: 60000,
    category: 'special',
    effect: '50% Fail Refund',
    icon: '🔒',
    color: '#00FFFF',
    maxLevel: 1
  },
  {
    id: 'xp_booster',
    name: 'XP Accelerator',
    description: 'Gain 50% more experience from all actions',
    price: 80000,
    category: 'special',
    effect: '+50% XP Gain',
    icon: '⭐',
    color: '#FFDD00',
    maxLevel: 3
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    description: '25% chance to not consume money when buying blocks',
    price: 120000,
    category: 'special',
    effect: '25% Free Purchase',
    icon: '🍀',
    color: '#00FF44',
    maxLevel: 2
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    description: 'Reduces spawn cooldown by 30 seconds',
    price: 200000,
    category: 'special',
    effect: '-30s Spawn Time',
    icon: '⏰',
    color: '#00CCFF',
    maxLevel: 2
  },
  {
    id: 'block_magnet',
    name: 'Block Magnet',
    description: '10% chance to attract a random free block every hour',
    price: 180000,
    category: 'special',
    effect: 'Hourly Free Block',
    icon: '🧲',
    color: '#FF6600',
    maxLevel: 2
  },
  {
    id: 'double_trouble',
    name: 'Double Trouble',
    description: '20% chance to get 2 blocks when purchasing',
    price: 400000,
    category: 'special',
    effect: '20% Double Drop',
    icon: '🎲',
    color: '#CC00CC',
    maxLevel: 1
  },
  {
    id: 'passive_income',
    name: 'Passive Income Generator',
    description: 'Earn $1000 every 10 minutes even when offline',
    price: 500000,
    category: 'special',
    effect: '$1000/10min Passive',
    icon: '🏦',
    color: '#00AA00',
    maxLevel: 5
  },
  {
    id: 'phoenix_rebirth',
    name: 'Phoenix Rebirth',
    description: 'Respawn with 50% of your stats when defeated',
    price: 750000,
    category: 'special',
    effect: '50% Stat Recovery',
    icon: '🔥',
    color: '#FF0080',
    maxLevel: 1
  },
  {
    id: 'whale_hunter',
    name: 'Whale Hunter',
    description: 'Deal 300% damage to players with over $1M',
    price: 600000,
    category: 'special',
    effect: '300% vs Whales',
    icon: '🐋',
    color: '#0066CC',
    maxLevel: 1
  }
]

export async function GET(request: NextRequest) {
  try {
    const categories = {
      power: 'Increase your offensive capabilities with attack upgrades, critical strikes, and combat bonuses',
      defense: 'Protect your blocks from thieves with shields, fortifications, and defensive abilities', 
      special: 'Unique abilities and economic bonuses including profit boosters, passive income, and utility upgrades'
    }

    return NextResponse.json({
      success: true,
      items: STORE_ITEMS,
      categories: categories,
      totalItems: STORE_ITEMS.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Store API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store items', categories: {} },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, playerId, playerMoney, currentUpgrades = {} } = body

    // Find the item
    const item = STORE_ITEMS.find(i => i.id === itemId)
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check current level of this upgrade
    const currentLevel = currentUpgrades[itemId] || 0
    if (currentLevel >= item.maxLevel) {
      return NextResponse.json(
        { success: false, error: 'Maximum level reached for this upgrade' },
        { status: 400 }
      )
    }

    // Calculate price based on level (increases by 50% each level)
    const actualPrice = Math.floor(item.price * Math.pow(1.5, currentLevel))

    // Check if player has enough money
    if (playerMoney < actualPrice) {
      return NextResponse.json(
        { success: false, error: `Not enough money! Need $${actualPrice.toLocaleString()}, you have $${playerMoney.toLocaleString()}` },
        { status: 400 }
      )
    }

    // Apply the upgrade effects based on item type
    let upgradeEffects = {
      attackPowerBonus: 0,
      defenseStrengthBonus: 0,
      stealSuccessBonus: 0,
      blockProtectionBonus: 0,
      moneyMultiplierBonus: 0,
      collectionSizeBonus: 0,
      earlyDetection: false,
      stealInsurance: false,
      berserkerMode: false,
      comboBonus: false,
      autoCounter: false,
      dailyImmunity: false,
      autoRepair: false,
      xpBonus: 0,
      luckyPurchase: false,
      spawnReduction: 0,
      hourlyFreeBlock: false,
      doubleDropChance: false,
      passiveIncome: 0,
      phoenixRebirth: false,
      whaleHunter: false
    }

    switch (itemId) {
      // Power Upgrades
      case 'attack_boost_1':
        upgradeEffects.attackPowerBonus = 10
        break
      case 'attack_boost_2':
        upgradeEffects.attackPowerBonus = 25
        break
      case 'attack_boost_3':
        upgradeEffects.attackPowerBonus = 50
        break
      case 'attack_boost_4':
        upgradeEffects.attackPowerBonus = 100
        break
      case 'attack_boost_5':
        upgradeEffects.attackPowerBonus = 200
        break
      case 'critical_strike':
        upgradeEffects.stealSuccessBonus = 15
        break
      case 'berserker_rage':
        upgradeEffects.berserkerMode = true
        break
      case 'combo_master':
        upgradeEffects.comboBonus = true
        break
      
      // Defense Upgrades
      case 'defense_boost_1':
        upgradeEffects.defenseStrengthBonus = 20
        break
      case 'defense_boost_2':
        upgradeEffects.defenseStrengthBonus = 50
        break
      case 'defense_boost_3':
        upgradeEffects.defenseStrengthBonus = 100
        break
      case 'defense_boost_4':
        upgradeEffects.defenseStrengthBonus = 200
        break
      case 'fortress_mode':
        upgradeEffects.blockProtectionBonus = 20
        break
      case 'guardian_spirit':
        upgradeEffects.autoCounter = true
        break
      case 'block_sanctuary':
        upgradeEffects.dailyImmunity = true
        break
      case 'regenerative_shield':
        upgradeEffects.autoRepair = true
        break
      
      // Special Upgrades
      case 'money_multiplier':
        upgradeEffects.moneyMultiplierBonus = 25
        break
      case 'money_multiplier_2':
        upgradeEffects.moneyMultiplierBonus = 50
        break
      case 'block_radar':
        upgradeEffects.earlyDetection = true
        break
      case 'collection_expander':
        upgradeEffects.collectionSizeBonus = 2
        break
      case 'steal_insurance':
        upgradeEffects.stealInsurance = true
        break
      case 'xp_booster':
        upgradeEffects.xpBonus = 50
        break
      case 'lucky_charm':
        upgradeEffects.luckyPurchase = true
        break
      case 'time_warp':
        upgradeEffects.spawnReduction = 30
        break
      case 'block_magnet':
        upgradeEffects.hourlyFreeBlock = true
        break
      case 'double_trouble':
        upgradeEffects.doubleDropChance = true
        break
      case 'passive_income':
        upgradeEffects.passiveIncome = 1000
        break
      case 'phoenix_rebirth':
        upgradeEffects.phoenixRebirth = true
        break
      case 'whale_hunter':
        upgradeEffects.whaleHunter = true
        break
    }

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${item.name} Level ${currentLevel + 1}!`,
      item: item,
      price: actualPrice,
      newLevel: currentLevel + 1,
      upgradeEffects,
      remainingMoney: playerMoney - actualPrice
    })

  } catch (error) {
    console.error('Store purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
