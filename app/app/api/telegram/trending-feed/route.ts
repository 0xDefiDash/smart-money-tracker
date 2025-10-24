
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get trending tokens based on recent activity and price changes
    const cryptos = await prisma.cryptocurrency.findMany({
      take: 30,
      where: {
        priceChange24h: {
          not: null,
        },
      },
      orderBy: [
        { priceChange24h: 'desc' },
        { volume24h: 'desc' },
      ],
      select: {
        symbol: true,
        name: true,
        priceChange24h: true,
        volume24h: true,
      },
    });

    const tokens = cryptos.map((crypto, idx) => ({
      symbol: crypto.symbol,
      name: crypto.name,
      priceChange: crypto.priceChange24h || 0,
      volume: crypto.volume24h || 0,
      trending: idx < 10, // Top 10 are marked as trending
    }));

    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error: any) {
    console.error('Error fetching trending tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        tokens: [],
      },
      { status: 500 }
    );
  }
}
