export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols') || 'bitcoin,ethereum,cardano,solana,binancecoin';
    
    // CoinGecko API to get current prices
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        // Cache for 30 seconds
        next: { revalidate: 30 }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();
    
    // Format the response
    const formattedData = Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key,
      price: value.usd || 0,
      change_24h: value.usd_24h_change || 0,
      market_cap: value.usd_market_cap || 0,
      volume_24h: value.usd_24h_vol || 0
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Fallback data
    const fallbackData = [
      { id: 'bitcoin', price: 42500, change_24h: 2.5, market_cap: 832000000000, volume_24h: 15000000000 },
      { id: 'ethereum', price: 2800, change_24h: -1.2, market_cap: 336000000000, volume_24h: 8000000000 },
      { id: 'cardano', price: 0.45, change_24h: 3.1, market_cap: 16000000000, volume_24h: 450000000 },
      { id: 'solana', price: 95, change_24h: 5.2, market_cap: 41000000000, volume_24h: 1800000000 },
      { id: 'binancecoin', price: 320, change_24h: 1.8, market_cap: 49000000000, volume_24h: 2000000000 }
    ];

    return NextResponse.json({
      success: false,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      error: 'Using fallback data due to API error'
    });
  }
}
