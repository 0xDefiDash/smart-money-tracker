import { NextRequest, NextResponse } from 'next/server';
import { coinglassClient } from '@/lib/coinglass-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'sentiment';
    const symbol = searchParams.get('symbol') || 'BTC';
    const symbols = searchParams.get('symbols')?.split(',') || ['BTC', 'ETH', 'SOL'];
    const exchange = searchParams.get('exchange') || 'Binance';

    let data: any;

    switch (action) {
      case 'long-short-ratio':
        data = await coinglassClient.getGlobalLongShortRatio(symbol);
        break;

      case 'top-trader-ratio':
        data = await coinglassClient.getTopTraderRatio(symbol, exchange);
        break;

      case 'funding-rates':
        data = await coinglassClient.getFundingRates(symbol);
        break;

      case 'aggregated-funding':
        data = await coinglassClient.getAggregatedFundingRate(symbol);
        break;

      case 'open-interest':
        data = await coinglassClient.getOpenInterest(symbol);
        break;

      case 'liquidation':
        data = await coinglassClient.getLiquidationData(symbol);
        break;

      case 'liquidation-orders':
        data = await coinglassClient.getLiquidationOrders(symbol);
        break;

      case 'taker-ratio':
        data = await coinglassClient.getTakerBuySellRatio(symbol);
        break;

      case 'sentiment':
        data = await coinglassClient.getMarketSentiment(symbol);
        break;

      case 'multi-sentiment':
        data = await coinglassClient.getMultiCoinSentiment(symbols);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: long-short-ratio, top-trader-ratio, funding-rates, aggregated-funding, open-interest, liquidation, liquidation-orders, taker-ratio, sentiment, multi-sentiment' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      symbol: action === 'multi-sentiment' ? symbols : symbol,
      timestamp: Date.now(),
      data,
    });
  } catch (error: any) {
    console.error('Coinglass API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Coinglass data',
      },
      { status: 500 }
    );
  }
}
