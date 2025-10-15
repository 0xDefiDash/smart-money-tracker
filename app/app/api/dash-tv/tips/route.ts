
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

// GET - Fetch tips
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const streamerId = searchParams.get('streamerId')
    const streamId = searchParams.get('streamId')
    const videoId = searchParams.get('videoId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      status: 'completed'
    }

    if (streamerId) where.toStreamerId = streamerId
    if (streamId) where.streamId = streamId
    if (videoId) where.videoId = videoId

    const tips = await prisma.tip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        toStreamer: {
          select: {
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    // Calculate stats
    const stats = {
      totalTips: tips.length,
      totalAmount: tips.reduce((sum, tip) => sum + tip.amountUsd, 0),
      topTipper: null
    }

    return NextResponse.json({ tips, stats })
  } catch (error) {
    console.error('Error fetching tips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    )
  }
}

// POST - Create a new tip
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
      toStreamerId,
      streamId,
      videoId,
      amount,
      cryptocurrency,
      message,
      walletAddress
    } = body

    // Validate input
    if (!toStreamerId || !amount || !cryptocurrency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Mock conversion rate (in production, use real-time rates)
    const conversionRates: Record<string, number> = {
      BTC: 45000,
      ETH: 2500,
      SOL: 100,
      USDC: 1,
      USDT: 1,
    }

    const amountUsd = amount * (conversionRates[cryptocurrency] || 1)

    // Create tip record
    const tip = await prisma.tip.create({
      data: {
        fromUserId: session.user.email || 'anonymous',
        toStreamerId,
        streamId: streamId || undefined,
        videoId: videoId || undefined,
        amount,
        amountUsd,
        cryptocurrency,
        walletAddress: walletAddress || undefined,
        message: message || undefined,
        status: 'completed',
        completedAt: new Date(),
      }
    })

    // Update wallet connection stats
    await prisma.walletConnection.updateMany({
      where: { streamerId: toStreamerId },
      data: {
        totalTipsReceived: { increment: amount },
        totalTipsReceivedUsd: { increment: amountUsd },
      }
    })

    // Update streamer profile stats
    await prisma.streamerProfile.updateMany({
      where: { id: toStreamerId },
      data: {
        totalLikes: { increment: 1 }, // Using likes as a proxy for engagement
      }
    })

    return NextResponse.json({ 
      success: true, 
      tip,
      message: 'Tip sent successfully!'
    })
  } catch (error) {
    console.error('Error creating tip:', error)
    return NextResponse.json(
      { error: 'Failed to create tip' },
      { status: 500 }
    )
  }
}
