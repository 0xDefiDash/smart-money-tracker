
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { streamerId: string } }
) {
  try {
    const { streamerId } = params

    const wallet = await prisma.walletConnection.findUnique({
      where: { streamerId },
      select: {
        walletAddress: true,
        walletType: true,
        blockchain: true,
        qrCode: true,
        isVerified: true,
        totalTipsReceived: true,
        totalTipsReceivedUsd: true,
      }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}
