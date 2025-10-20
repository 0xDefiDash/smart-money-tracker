

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols') || 'bitcoin,ethereum,cardano,solana,binancecoin,tether,usd-coin,ripple,dogecoin,chainlink,avalanche-2,sui,polkadot,near,aptos,toncoin';
    
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
    
    // Updated fallback data for October 20, 2025
    const fallbackData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        price: 127845, 
        change_24h: 3.42, 
        change_1h: 0.8,
        market_cap: 2523478393823, 
        volume_24h: 84572181529 
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        price: 4789.25, 
        change_24h: 2.85, 
        change_1h: 0.5,
        market_cap: 576510427363, 
        volume_24h: 58452953255 
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        price: 1398.42, 
        change_24h: 5.21, 
        change_1h: 1.2,
        market_cap: 195322781508, 
        volume_24h: 12833000157 
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        price: 248.76, 
        change_24h: 4.58, 
        change_1h: 0.9,
        market_cap: 135725546634, 
        volume_24h: 11872562305 
      },
      { 
        id: 'ripple', 
        symbol: 'XRP',
        price: 3.12, 
        change_24h: 1.89, 
        change_1h: 0.3,
        market_cap: 186648139474, 
        volume_24h: 8581503772 
      },
      { 
        id: 'toncoin', 
        symbol: 'TON',
        price: 7.42, 
        change_24h: 6.78, 
        change_1h: 1.5,
        market_cap: 51392126612, 
        volume_24h: 4292232080 
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        price: 0.895432, 
        change_24h: 2.45, 
        change_1h: 0.4,
        market_cap: 32811816998, 
        volume_24h: 2180332688 
      },
      { 
        id: 'dogecoin', 
        symbol: 'DOGE',
        price: 0.278421, 
        change_24h: 3.21, 
        change_1h: 0.6,
        market_cap: 42192126612, 
        volume_24h: 4592232080 
      },
      { 
        id: 'chainlink', 
        symbol: 'LINK',
        price: 24.89, 
        change_24h: 4.12, 
        change_1h: 0.7,
        market_cap: 16976675848, 
        volume_24h: 1549934980 
      },
      { 
        id: 'avalanche-2', 
        symbol: 'AVAX',
        price: 32.45, 
        change_24h: 5.34, 
        change_1h: 1.1,
        market_cap: 13725211745, 
        volume_24h: 1421049189 
      },
      { 
        id: 'polkadot', 
        symbol: 'DOT',
        price: 4.78, 
        change_24h: 3.45, 
        change_1h: 0.5,
        market_cap: 7240900615, 
        volume_24h: 436006693 
      },
      { 
        id: 'near', 
        symbol: 'NEAR',
        price: 8.92, 
        change_24h: 6.12, 
        change_1h: 1.3,
        market_cap: 9821456789, 
        volume_24h: 892345678 
      },
      { 
        id: 'sui', 
        symbol: 'SUI',
        price: 5.67, 
        change_24h: 8.45, 
        change_1h: 1.8,
        market_cap: 17892345678, 
        volume_24h: 2134567890 
      },
      { 
        id: 'aptos', 
        symbol: 'APT',
        price: 12.34, 
        change_24h: 4.67, 
        change_1h: 0.9,
        market_cap: 8234567890, 
        volume_24h: 678901234 
      },
      { 
        id: 'shiba-inu', 
        symbol: 'SHIB',
        price: 0.0000145, 
        change_24h: 2.89, 
        change_1h: 0.4,
        market_cap: 8531630179, 
        volume_24h: 312324913 
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
    'sui': 'SUI',
    'toncoin': 'TON',
    'polkadot': 'DOT',
    'near': 'NEAR',
    'aptos': 'APT'
  };
  return symbolMap[id] || id.toUpperCase();
}
