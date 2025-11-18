
import { NextRequest, NextResponse } from 'next/server';
import {
  getTokenTransfers,
  getWhoBoughtSold,
  getPnLLeaderboard,
  formatChainName,
  isNansenConfigured,
} from '@/lib/nansen-client';

/**
 * Whale Activity Tracking API
 * 
 * Tracks large wallet movements and whale activity:
 * - Large transfers
 * - Recent buyers and sellers (whales)
 * - Top PnL performers
 */
export async function GET(request: NextRequest) {
  try {
    if (!isNansenConfigured()) {
      return NextResponse.json(
        { error: 'Nansen API is not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const chain = formatChainName(searchParams.get('chain') || 'ethereum');
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!tokenAddress) {
      // Get general whale activity across top tokens
      const topPerformers = await getPnLLeaderboard(undefined, chain, timeframe, limit);

      return NextResponse.json({
        success: true,
        data: {
          chain,
          timeframe,
          topPerformers,
          message: 'Top whale performers across all tokens',
        },
        source: 'nansen',
        timestamp: new Date().toISOString(),
      });
    }

    // Get whale activity for specific token
    const [transfers, whoBoughtSold, pnlLeaderboard] = await Promise.allSettled([
      getTokenTransfers(tokenAddress, chain, timeframe, limit),
      getWhoBoughtSold(tokenAddress, chain, timeframe, limit),
      getPnLLeaderboard(tokenAddress, chain, timeframe, limit),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tokenAddress,
        chain,
        timeframe,
        transfers: transfers.status === 'fulfilled' ? transfers.value : [],
        whoBoughtSold: whoBoughtSold.status === 'fulfilled' ? whoBoughtSold.value : {},
        pnlLeaderboard: pnlLeaderboard.status === 'fulfilled' ? pnlLeaderboard.value : [],
      },
      source: 'nansen',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Whale Activity API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch whale activity data',
      },
      { status: 500 }
    );
  }
}
