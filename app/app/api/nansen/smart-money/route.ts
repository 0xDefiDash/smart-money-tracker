
import { NextRequest, NextResponse } from 'next/server';
import {
  getSmartMoneyNetflows,
  getSmartMoneyHoldings,
  getSmartMoneyHistoricalHoldings,
  getSmartMoneyDexTrades,
  formatChainName,
} from '@/lib/nansen-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'netflows';
    const chain = searchParams.get('chain') || 'ethereum';
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = parseInt(searchParams.get('limit') || '50');

    const formattedChain = formatChainName(chain);

    let data;

    switch (action) {
      case 'netflows':
        data = await getSmartMoneyNetflows(formattedChain, timeframe, limit);
        break;

      case 'holdings':
        data = await getSmartMoneyHoldings(formattedChain, limit);
        break;

      case 'historical-holdings': {
        const tokenAddress = searchParams.get('tokenAddress');
        if (!tokenAddress) {
          return NextResponse.json(
            { success: false, error: 'tokenAddress parameter required for historical-holdings' },
            { status: 400 }
          );
        }
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        data = await getSmartMoneyHistoricalHoldings(
          tokenAddress,
          formattedChain,
          startDate,
          endDate,
          limit
        );
        break;
      }

      case 'dex-trades':
        data = await getSmartMoneyDexTrades(formattedChain, timeframe, limit);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: netflows, holdings, historical-holdings, or dex-trades' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      chain: formattedChain,
      timeframe: action !== 'holdings' ? timeframe : undefined,
      count: Array.isArray(data) ? data.length : 0,
      data,
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
