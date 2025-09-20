
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols') || 'bitcoin,ethereum,cardano,solana,binancecoin,tether,usd-coin,the-open-network,sui,avalanche-2';
    
    // CoinGecko API to get current prices
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_1h_change=true`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Smart-Money-Tracker/1.0'
        },
        // Cache for 30 seconds to reduce API calls
        next: { revalidate: 30 }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the response with enhanced data
    const formattedData = Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key,
      price: value.usd || 0,
      change_24h: value.usd_24h_change || 0,
      change_1h: value.usd_1h_change || 0,
      market_cap: value.usd_market_cap || 0,
      volume_24h: value.usd_24h_vol || 0,
      symbol: getSymbolFromId(key)
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString(),
      source: 'coingecko-live'
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Enhanced fallback data for September 20, 2025
    const fallbackData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        price: 63500, 
        change_24h: 4.2, 
        change_1h: 0.8,
        market_cap: 1254000000000, 
        volume_24h: 24500000000 
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        price: 2485, 
        change_24h: -1.6, 
        change_1h: 0.3,
        market_cap: 298000000000, 
        volume_24h: 12800000000 
      },
      { 
        id: 'tether', 
        symbol: 'USDT',
        price: 1.001, 
        change_24h: 0.01, 
        change_1h: 0.001,
        market_cap: 119000000000, 
        volume_24h: 42000000000 
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        price: 145.80, 
        change_24h: 6.8, 
        change_1h: 1.2,
        market_cap: 68000000000, 
        volume_24h: 2890000000 
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        price: 588, 
        change_24h: 2.4, 
        change_1h: 0.6,
        market_cap: 85000000000, 
        volume_24h: 1890000000 
      },
      { 
        id: 'usd-coin', 
        symbol: 'USDC',
        price: 0.999, 
        change_24h: -0.02, 
        change_1h: 0.001,
        market_cap: 32500000000, 
        volume_24h: 5600000000 
      },
      { 
        id: 'the-open-network', 
        symbol: 'TON',
        price: 5.84, 
        change_24h: 8.9, 
        change_1h: 2.1,
        market_cap: 14800000000, 
        volume_24h: 289000000 
      },
      { 
        id: 'sui', 
        symbol: 'SUI',
        price: 1.78, 
        change_24h: 12.4, 
        change_1h: 3.2,
        market_cap: 4950000000, 
        volume_24h: 456000000 
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        price: 0.365, 
        change_24h: 3.8, 
        change_1h: 0.9,
        market_cap: 12800000000, 
        volume_24h: 298000000 
      },
      { 
        id: 'avalanche-2', 
        symbol: 'AVAX',
        price: 26.45, 
        change_24h: 5.2, 
        change_1h: 1.4,
        market_cap: 10900000000, 
        volume_24h: 345000000 
      }
    ];

    return NextResponse.json({
      success: false,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: 'Using fallback data due to API error'
    });
  }
}

function getSymbolFromId(id: string): string {
  const symbolMap: Record<string, string> = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'tether': 'USDT',
    'solana': 'SOL',
    'binancecoin': 'BNB',
    'usd-coin': 'USDC',
    'the-open-network': 'TON',
    'sui': 'SUI',
    'cardano': 'ADA',
    'avalanche-2': 'AVAX'
  };
  return symbolMap[id] || id.toUpperCase();
}
