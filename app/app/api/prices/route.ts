

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
    
    // Updated fallback data with current October 8, 2025 prices
    const fallbackData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        price: 121470, 
        change_24h: -2.27, 
        change_1h: 0.3,
        market_cap: 2421063383823, 
        volume_24h: 77457181529 
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        price: 4442.52, 
        change_24h: -5.21, 
        change_1h: -0.2,
        market_cap: 536510427363, 
        volume_24h: 51552953255 
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        price: 1274.99, 
        change_24h: 3.85, 
        change_1h: 0.8,
        market_cap: 177322781508, 
        volume_24h: 10433000157 
      },
      { 
        id: 'ripple', 
        symbol: 'XRP',
        price: 2.85, 
        change_24h: -4.56, 
        change_1h: -0.1,
        market_cap: 170648139474, 
        volume_24h: 7181503772 
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        price: 219.25, 
        change_24h: -6.02, 
        change_1h: -0.4,
        market_cap: 119725546634, 
        volume_24h: 9672562305 
      },
      { 
        id: 'dogecoin', 
        symbol: 'DOGE',
        price: 0.244979, 
        change_24h: -7.99, 
        change_1h: -0.5,
        market_cap: 37092126612, 
        volume_24h: 3892232080 
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        price: 0.815063, 
        change_24h: -6.19, 
        change_1h: -0.2,
        market_cap: 29811816998, 
        volume_24h: 1880332688 
      },
      { 
        id: 'chainlink', 
        symbol: 'LINK',
        price: 21.78, 
        change_24h: -6.77, 
        change_1h: -0.3,
        market_cap: 14776675848, 
        volume_24h: 1249934980 
      },
      { 
        id: 'avalanche-2', 
        symbol: 'AVAX',
        price: 28.01, 
        change_24h: -7.66, 
        change_1h: -0.4,
        market_cap: 11825211745, 
        volume_24h: 1121049189 
      },
      { 
        id: 'litecoin', 
        symbol: 'LTC',
        price: 117.02, 
        change_24h: -0.97, 
        change_1h: 0.1,
        market_cap: 8939614918, 
        volume_24h: 712579851 
      },
      { 
        id: 'shiba-inu', 
        symbol: 'SHIB',
        price: 0.0000121, 
        change_24h: -5.45, 
        change_1h: -0.2,
        market_cap: 7131630179, 
        volume_24h: 232324913 
      },
      { 
        id: 'polkadot', 
        symbol: 'DOT',
        price: 4.10, 
        change_24h: -6.09, 
        change_1h: -0.3,
        market_cap: 6240900615, 
        volume_24h: 336006693 
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
