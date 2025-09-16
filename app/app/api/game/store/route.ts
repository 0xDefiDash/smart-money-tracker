

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
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      items: STORE_ITEMS,
      categories: {
        power: 'Increase your offensive capabilities',
        defense: 'Protect your blocks from thieves', 
        special: 'Unique abilities and bonuses'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store items' },
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
      stealInsurance: false
    }

    switch (itemId) {
      case 'attack_boost_1':
        upgradeEffects.attackPowerBonus = 10
        break
      case 'attack_boost_2':
        upgradeEffects.attackPowerBonus = 25
        break
      case 'critical_strike':
        upgradeEffects.stealSuccessBonus = 15
        break
      case 'defense_boost_1':
        upgradeEffects.defenseStrengthBonus = 20
        break
      case 'defense_boost_2':
        upgradeEffects.defenseStrengthBonus = 50
        break
      case 'fortress_mode':
        upgradeEffects.blockProtectionBonus = 20
        break
      case 'money_multiplier':
        upgradeEffects.moneyMultiplierBonus = 25
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
