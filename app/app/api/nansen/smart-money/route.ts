
import { NextRequest, NextResponse } from 'next/server';
import {
  getSmartMoneyNetflows,
  getSmartMoneyHoldings,
  getSmartMoneyDexTrades,
  formatChainName,
  isNansenConfigured,
} from '@/lib/nansen-client';

/**
 * Smart Money Tracking API
 * 
 * Tracks top-performing wallets (Smart Money) and their activity:
 * - Netflows: What tokens they're buying/selling
 * - Holdings: What tokens they currently hold
 * - DEX Trades: Their recent trading activity
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
    const chain = formatChainName(searchParams.get('chain') || 'ethereum');
    const timeframe = searchParams.get('timeframe') || '24h';
    const type = searchParams.get('type') || 'all'; // 'netflows', 'holdings', 'trades', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    const results: any = {
      chain,
      timeframe,
      timestamp: new Date().toISOString(),
    };

    // Fetch requested data types
    if (type === 'netflows' || type === 'all') {
      try {
        results.netflows = await getSmartMoneyNetflows(chain, timeframe, limit);
      } catch (error: any) {
        results.netflows = { error: error.message };
      }
    }

    if (type === 'holdings' || type === 'all') {
      try {
        results.holdings = await getSmartMoneyHoldings(chain, limit);
      } catch (error: any) {
        results.holdings = { error: error.message };
      }
    }

    if (type === 'trades' || type === 'all') {
      try {
        results.dexTrades = await getSmartMoneyDexTrades(chain, timeframe, limit);
      } catch (error: any) {
        results.dexTrades = { error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      source: 'nansen',
    });
  } catch (error: any) {
    console.error('[Smart Money API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Smart Money data',
      },
      { status: 500 }
    );
  }
}
