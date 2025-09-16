
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get recent block transactions for the rolling bar
export async function GET() {
  try {
    const transactions = await prisma.blockTransaction.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 50, // Get last 50 transactions
      select: {
        id: true,
        playerId: true,
        playerName: true,
        blockName: true,
        blockType: true,
        blockRarity: true,
        transactionType: true,
        price: true,
        value: true,
        timestamp: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      transactions
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// Record a new block transaction
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      playerId,
      playerName,
      blockId,
      blockName,
      blockType,
      blockRarity,
      transactionType,
      price,
      value
    } = data

    if (!playerId || !blockId || !blockName || !blockType || !blockRarity || !transactionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required transaction data' },
        { status: 400 }
      )
    }

    const transaction = await prisma.blockTransaction.create({
      data: {
        playerId,
        playerName: playerName || `Player ${playerId.slice(-6)}`, // Fallback name
        blockId,
        blockName,
        blockType,
        blockRarity,
        transactionType,
        price: price || null,
        value: value || 0
      }
    })

    return NextResponse.json({ 
      success: true, 
      transaction
    })
  } catch (error) {
    console.error('Error recording transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record transaction' },
      { status: 500 }
    )
  }
}
