

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols') || 'bitcoin,ethereum,cardano,solana,binancecoin,tether,usd-coin,ripple,dogecoin,chainlink,avalanche-2,sui';
    
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
    
    // Updated fallback data with current September 24, 2025 prices
    const fallbackData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        price: 111438, 
        change_24h: -0.69, 
        change_1h: 0.2,
        market_cap: 2221083498980, 
        volume_24h: 43118128985 
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        price: 4101.94, 
        change_24h: -1.79, 
        change_1h: 0.1,
        market_cap: 495001372321, 
        volume_24h: 28252237841 
      },
      { 
        id: 'tether', 
        symbol: 'USDT',
        price: 1.000, 
        change_24h: -0.05, 
        change_1h: 0.001,
        market_cap: 172794458855, 
        volume_24h: 97274819129 
      },
      { 
        id: 'ripple', 
        symbol: 'XRP',
        price: 2.81, 
        change_24h: -1.42, 
        change_1h: 0.3,
        market_cap: 167971672795, 
        volume_24h: 5209407199 
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        price: 1002.14, 
        change_24h: 2.13, 
        change_1h: 0.5,
        market_cap: 139491668263, 
        volume_24h: 2956351116 
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        price: 206.37, 
        change_24h: -4.49, 
        change_1h: -0.2,
        market_cap: 112153522612, 
        volume_24h: 6491536237 
      },
      { 
        id: 'usd-coin', 
        symbol: 'USDC',
        price: 0.9997, 
        change_24h: -0.001, 
        change_1h: 0.001,
        market_cap: 73954679236, 
        volume_24h: 9504798023 
      },
      { 
        id: 'dogecoin', 
        symbol: 'DOGE',
        price: 0.234053, 
        change_24h: -2.56, 
        change_1h: -0.1,
        market_cap: 35248733509, 
        volume_24h: 2716430172 
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        price: 0.798089, 
        change_24h: -2.70, 
        change_1h: -0.3,
        market_cap: 29144771183, 
        volume_24h: 1429660809 
      },
      { 
        id: 'chainlink', 
        symbol: 'LINK',
        price: 21.21, 
        change_24h: -1.34, 
        change_1h: 0.2,
        market_cap: 14349079962, 
        volume_24h: 784885948 
      },
      { 
        id: 'avalanche-2', 
        symbol: 'AVAX',
        price: 33.32, 
        change_24h: -3.92, 
        change_1h: -0.1,
        market_cap: 14052988678, 
        volume_24h: 1745972080 
      },
      { 
        id: 'sui', 
        symbol: 'SUI',
        price: 3.28, 
        change_24h: -2.42, 
        change_1h: 0.1,
        market_cap: 11647688958, 
        volume_24h: 1050212609 
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
    'ripple': 'XRP',
    'binancecoin': 'BNB',
    'solana': 'SOL',
    'usd-coin': 'USDC',
    'dogecoin': 'DOGE',
    'cardano': 'ADA',
    'chainlink': 'LINK',
    'avalanche-2': 'AVAX',
    'sui': 'SUI'
  };
  return symbolMap[id] || id.toUpperCase();
}
