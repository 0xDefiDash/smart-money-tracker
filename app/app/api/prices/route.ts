
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols') || 'bitcoin,ethereum,cardano,solana,binancecoin,tether,usd-coin,the-open-network,sui,avalanche-2';
    
    // CoinGecko API to get current prices with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_1h_change=true`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Smart-Money-Tracker/1.0'
        },
        signal: controller.signal,
        // Cache for 30 seconds to reduce API calls
        next: { revalidate: 30 }
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('CoinGecko API rate limit exceeded, using fallback data');
      }
      throw new Error(`CoinGecko API error: ${response.status} - ${response.statusText}`);
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
    
    // Enhanced fallback data for September 24, 2025
    const fallbackData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        price: 66750, 
        change_24h: 2.8, 
        change_1h: 0.5,
        market_cap: 1318000000000, 
        volume_24h: 28900000000 
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        price: 2650, 
        change_24h: 1.9, 
        change_1h: 0.4,
        market_cap: 318500000000, 
        volume_24h: 15200000000 
      },
      { 
        id: 'tether', 
        symbol: 'USDT',
        price: 1.000, 
        change_24h: -0.01, 
        change_1h: 0.001,
        market_cap: 120800000000, 
        volume_24h: 45000000000 
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        price: 152.30, 
        change_24h: 4.7, 
        change_1h: 0.8,
        market_cap: 71200000000, 
        volume_24h: 3200000000 
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        price: 610, 
        change_24h: 1.8, 
        change_1h: 0.3,
        market_cap: 88500000000, 
        volume_24h: 2100000000 
      },
      { 
        id: 'usd-coin', 
        symbol: 'USDC',
        price: 0.999, 
        change_24h: 0.01, 
        change_1h: 0.001,
        market_cap: 33800000000, 
        volume_24h: 6200000000 
      },
      { 
        id: 'the-open-network', 
        symbol: 'TON',
        price: 6.12, 
        change_24h: 5.6, 
        change_1h: 1.2,
        market_cap: 15600000000, 
        volume_24h: 320000000 
      },
      { 
        id: 'sui', 
        symbol: 'SUI',
        price: 1.95, 
        change_24h: 8.9, 
        change_1h: 2.1,
        market_cap: 5420000000, 
        volume_24h: 520000000 
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        price: 0.382, 
        change_24h: 2.4, 
        change_1h: 0.6,
        market_cap: 13400000000, 
        volume_24h: 340000000 
      },
      { 
        id: 'avalanche-2', 
        symbol: 'AVAX',
        price: 28.75, 
        change_24h: 3.8, 
        change_1h: 0.9,
        market_cap: 11850000000, 
        volume_24h: 398000000 
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
