export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'

interface BattleRequest {
  attackerId: string
  targetBlockId: string
  targetPlayerId: string
  attackerPower: number
  targetDefense: number
}

interface BattleResult {
  success: boolean
  attackerId: string
  targetBlockId: string
  stealSuccessful: boolean
  coinsSpent: number
  coinsGained: number
  experienceGained: number
  message: string
  newAttackerStats?: {
    coins: number
    experience: number
    ownedBlocks: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const battleData: BattleRequest = await request.json()
    
    const { attackerId, targetBlockId, targetPlayerId, attackerPower, targetDefense } = battleData
    
    if (!attackerId || !targetBlockId || !targetPlayerId) {
      return NextResponse.json(
        { error: 'Missing required battle parameters' },
        { status: 400 }
      )
    }
    
    // Calculate battle outcome
    const baseSteamChance = 50
    const powerDifference = attackerPower - targetDefense
    const adjustedChance = Math.max(10, Math.min(90, baseSteamChance + powerDifference))
    
    const stealSuccessful = Math.random() * 100 < adjustedChance
    
    // Calculate costs and rewards
    const stealCost = Math.floor(Math.random() * 100) + 50 // 50-150 coins
    const stealReward = stealSuccessful ? Math.floor(Math.random() * 300) + 100 : 0 // 100-400 coins if successful
    const experienceGained = stealSuccessful ? 15 : 5
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const battleResult: BattleResult = {
      success: true,
      attackerId,
      targetBlockId,
      stealSuccessful,
      coinsSpent: stealCost,
      coinsGained: stealReward,
      experienceGained,
      message: stealSuccessful 
        ? `🎯 Successful steal! You gained the block and ${stealReward} coins!`
        : `💥 Steal attempt failed! You lost ${stealCost} coins to enemy defenses.`
    }
    
    return NextResponse.json(battleResult)
  } catch (error) {
    console.error('Error processing battle:', error)
    return NextResponse.json(
      { error: 'Failed to process battle' },
      { status: 500 }
    )
  }
}
