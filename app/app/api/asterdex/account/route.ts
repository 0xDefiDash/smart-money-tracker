import { NextRequest, NextResponse } from 'next/server';
import { asterDexClient } from '@/lib/ai-agents/asterdex-client';

export async function GET(req: NextRequest) {
  try {
    const [account, positions, balances] = await Promise.all([
      asterDexClient.getAccount(),
      asterDexClient.getPositions(),
      asterDexClient.getBalance()
    ]);

    return NextResponse.json({
      success: true,
      isConfigured: asterDexClient.isApiConfigured(),
      account,
      positions,
      balances,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AsterDex account error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account',
        isConfigured: asterDexClient.isApiConfigured()
      },
      { status: 500 }
    );
  }
}
