import { NextRequest, NextResponse } from 'next/server';
import { asterDexClient } from '@/lib/ai-agents/asterdex-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const action = searchParams.get('action') || 'tickers';

    let data;

    switch (action) {
      case 'ticker':
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
        }
        data = await asterDexClient.getTicker(symbol);
        break;

      case 'orderbook':
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
        }
        data = await asterDexClient.getOrderBook(symbol);
        break;

      case 'klines':
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
        }
        const interval = searchParams.get('interval') || '1h';
        const limit = parseInt(searchParams.get('limit') || '100');
        data = await asterDexClient.getKlines(symbol, interval, limit);
        break;

      case 'funding':
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
        }
        data = await asterDexClient.getFundingRate(symbol);
        break;

      case 'exchangeInfo':
        data = await asterDexClient.getExchangeInfo();
        break;

      case 'tickers':
      default:
        data = await asterDexClient.getAllTickers();
        break;
    }

    return NextResponse.json({
      success: true,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AsterDex market error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
