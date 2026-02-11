import { NextRequest, NextResponse } from 'next/server';
import { asterDexClient } from '@/lib/ai-agents/asterdex-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, symbol, side, type, quantity, price, leverage, stopPrice, orderId } = body;

    if (!asterDexClient.isApiConfigured()) {
      return NextResponse.json(
        { error: 'AsterDex API not configured. Please add API credentials.' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'placeOrder':
        if (!symbol || !side || !type || !quantity) {
          return NextResponse.json(
            { error: 'Missing required fields: symbol, side, type, quantity' },
            { status: 400 }
          );
        }
        result = await asterDexClient.placeOrder({
          symbol,
          side,
          type,
          quantity: parseFloat(quantity),
          price: price ? parseFloat(price) : undefined,
          leverage: leverage ? parseInt(leverage) : undefined,
          stopPrice: stopPrice ? parseFloat(stopPrice) : undefined
        });
        break;

      case 'cancelOrder':
        if (!symbol || !orderId) {
          return NextResponse.json(
            { error: 'Missing required fields: symbol, orderId' },
            { status: 400 }
          );
        }
        result = await asterDexClient.cancelOrder(symbol, parseInt(orderId));
        break;

      case 'cancelAllOrders':
        if (!symbol) {
          return NextResponse.json(
            { error: 'Missing required field: symbol' },
            { status: 400 }
          );
        }
        result = await asterDexClient.cancelAllOrders(symbol);
        break;

      case 'closePosition':
        if (!symbol) {
          return NextResponse.json(
            { error: 'Missing required field: symbol' },
            { status: 400 }
          );
        }
        result = await asterDexClient.closePosition(symbol);
        break;

      case 'setLeverage':
        if (!symbol || !leverage) {
          return NextResponse.json(
            { error: 'Missing required fields: symbol, leverage' },
            { status: 400 }
          );
        }
        result = await asterDexClient.setLeverage(symbol, parseInt(leverage));
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AsterDex trade error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Trade failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'openOrders';
    const symbol = searchParams.get('symbol') || undefined;

    let data;

    switch (action) {
      case 'openOrders':
        data = await asterDexClient.getOpenOrders(symbol);
        break;

      case 'tradeHistory':
        const limit = parseInt(searchParams.get('limit') || '50');
        data = await asterDexClient.getTradeHistory(symbol, limit);
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AsterDex trade GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
