
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

// POST - Create wallet connection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      streamerId,
      walletAddress,
      walletType,
      blockchain,
    } = body

    // Validate input
    if (!streamerId || !walletAddress || !walletType || !blockchain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic wallet address validation
    if (walletAddress.length < 20) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Check if streamer profile exists
    const streamerProfile = await prisma.streamerProfile.findUnique({
      where: { id: streamerId }
    })

    if (!streamerProfile) {
      return NextResponse.json(
        { error: 'Streamer profile not found' },
        { status: 404 }
      )
    }

    // Create or update wallet connection
    const wallet = await prisma.walletConnection.upsert({
      where: { streamerId },
      create: {
        userId: streamerProfile.userId,
        streamerId,
        walletAddress,
        walletType,
        blockchain,
        isVerified: false,
        isActive: true,
      },
      update: {
        walletAddress,
        walletType,
        blockchain,
      }
    })

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create wallet connection' },
      { status: 500 }
    )
  }
}

// PUT - Update wallet connection
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      streamerId,
      walletAddress,
      walletType,
      blockchain,
    } = body

    const wallet = await prisma.walletConnection.update({
      where: { streamerId },
      data: {
        walletAddress,
        walletType,
        blockchain,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    )
  }
}
