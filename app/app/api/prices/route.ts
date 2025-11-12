

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoPrices } from '@/lib/price-service';

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const requestedSymbols = searchParams.get('symbols')?.split(',') || [];
    
    // Fetch prices using the enhanced price service
    const { data, source, cached } = await fetchCryptoPrices();
    
    // Filter by requested symbols if provided
    let filteredData = data;
    if (requestedSymbols.length > 0) {
      const symbolSet = new Set(requestedSymbols.map(s => s.toLowerCase()));
      filteredData = data.filter(coin => 
        symbolSet.has(coin.id.toLowerCase()) || 
        symbolSet.has(coin.symbol.toLowerCase())
      );
    }
    
    // Format the response with enhanced data
    const formattedData = filteredData.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: coin.current_price,
      change_24h: coin.price_change_percentage_24h,
      change_1h: coin.price_change_percentage_1h || 0,
      change_7d: coin.price_change_percentage_7d || 0,
      market_cap: coin.market_cap,
      volume_24h: coin.total_volume
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString(),
      source: source,
      cached: cached,
      count: formattedData.length
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    return NextResponse.json({
      success: false,
      data: [],
      timestamp: new Date().toISOString(),
      source: 'error',
      error: 'Failed to fetch price data'
    }, { status: 500 });
  }
}
