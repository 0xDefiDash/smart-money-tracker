

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get top 10 scanned contracts based on a combination of:
    // 1. Most scanned (popularity)
    // 2. Recent scans
    // 3. Low risk scores (safe contracts are featured)
    const topScans = await prisma.contractScan.findMany({
      orderBy: [
        { scanCount: 'desc' },
        { lastScannedAt: 'desc' }
      ],
      take: 10
    })

    return NextResponse.json(topScans)
  } catch (error) {
    console.error('Error fetching top scans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top scans' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

