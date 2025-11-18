
import { NextRequest, NextResponse } from 'next/server';
import {
  tokenScreener,
  getFlowIntelligence,
  getTokenHolders,
  getWhoBoughtSold,
  formatChainName,
  isNansenConfigured,
} from '@/lib/nansen-client';

/**
 * Token Intelligence API
 * 
 * Comprehensive token analytics powered by Nansen:
 * - Token screening and discovery
 * - Flow intelligence (Smart Money, exchange, whale flows)
 * - Top holders analysis
 * - Recent buyer/seller activity
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
    const action = searchParams.get('action') || 'screener'; // 'screener' or 'analyze'

    if (action === 'screener') {
      // Token discovery and screening
      const minMarketCap = searchParams.get('minMarketCap')
        ? parseFloat(searchParams.get('minMarketCap')!)
        : undefined;
      const minVolume24h = searchParams.get('minVolume24h')
        ? parseFloat(searchParams.get('minVolume24h')!)
        : undefined;
      const minPriceChange24h = searchParams.get('minPriceChange24h')
        ? parseFloat(searchParams.get('minPriceChange24h')!)
        : undefined;
      const minSmartMoneyHolders = searchParams.get('minSmartMoneyHolders')
        ? parseInt(searchParams.get('minSmartMoneyHolders')!)
        : undefined;
      const limit = parseInt(searchParams.get('limit') || '50');

      const tokens = await tokenScreener({
        chain,
        minMarketCap,
        minVolume24h,
        minPriceChange24h,
        minSmartMoneyHolders,
        limit,
      });

      return NextResponse.json({
        success: true,
        data: {
          chain,
          filters: {
            minMarketCap,
            minVolume24h,
            minPriceChange24h,
            minSmartMoneyHolders,
          },
          tokens,
          count: tokens.length,
        },
        source: 'nansen',
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'analyze' && tokenAddress) {
      // Comprehensive token analysis
      const timeframe = searchParams.get('timeframe') || '24h';
      const limit = parseInt(searchParams.get('limit') || '100');

      const [flowData, holders, whoBoughtSold] = await Promise.allSettled([
        getFlowIntelligence(tokenAddress, chain, timeframe),
        getTokenHolders(tokenAddress, chain, limit),
        getWhoBoughtSold(tokenAddress, chain, timeframe, 50),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          tokenAddress,
          chain,
          timeframe,
          flowIntelligence: flowData.status === 'fulfilled' ? flowData.value : null,
          holders: holders.status === 'fulfilled' ? holders.value : [],
          whoBoughtSold: whoBoughtSold.status === 'fulfilled' ? whoBoughtSold.value : {},
          analysis: {
            smartMoneyActivity: flowData.status === 'fulfilled' 
              ? flowData.value.flows.smartMoney.netflow 
              : 0,
            exchangeFlow: flowData.status === 'fulfilled'
              ? flowData.value.flows.exchanges.netflow
              : 0,
            whaleActivity: flowData.status === 'fulfilled'
              ? flowData.value.flows.whales.netflow
              : 0,
          },
        },
        source: 'nansen',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing tokenAddress for analyze action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Token Intelligence API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch token intelligence data',
      },
      { status: 500 }
    );
  }
}
