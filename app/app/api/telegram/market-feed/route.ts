
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cryptos = await prisma.cryptocurrency.findMany({
      take: 50,
      orderBy: { marketCap: 'desc' },
      select: {
        symbol: true,
        name: true,
        price: true,
        priceChange24h: true,
        volume24h: true,
        marketCap: true,
      },
    });

    const formattedData = cryptos.map((crypto: any) => ({
      symbol: crypto.symbol,
      name: crypto.name,
      price: crypto.price || 0,
      priceChange24h: crypto.priceChange24h || 0,
      volume24h: crypto.volume24h || 0,
      marketCap: crypto.marketCap || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: [],
      },
      { status: 500 }
    );
  }
}
