import { NextResponse } from 'next/server';
import { asterDexClient } from '@/lib/ai-agents/asterdex-client';

export async function GET() {
  try {
    const marketData = await asterDexClient.getMarketData();
    const account = await asterDexClient.getAccount();
    const positions = await asterDexClient.getPositions();

    return NextResponse.json({
      marketData,
      account,
      positions
    });
  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
