

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Updated fallback data with current October 8, 2025 prices
  const fallbackData = [
    { 
      id: 'bitcoin', 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      current_price: 121470, 
      price_change_percentage_24h: -2.27, 
      total_volume: 77457181529, 
      market_cap: 2421063383823,
      image: '', 
      market_cap_rank: 1,
      circulating_supply: 19748000
    },
    { 
      id: 'ethereum', 
      symbol: 'ETH', 
      name: 'Ethereum', 
      current_price: 4442.52, 
      price_change_percentage_24h: -5.21, 
      total_volume: 51552953255, 
      market_cap: 536510427363,
      image: '', 
      market_cap_rank: 2,
      circulating_supply: 120700000
    },
    { 
      id: 'binancecoin', 
      symbol: 'BNB', 
      name: 'BNB', 
      current_price: 1274.99, 
      price_change_percentage_24h: 3.85, 
      total_volume: 10433000157, 
      market_cap: 177322781508,
      image: '', 
      market_cap_rank: 3,
      circulating_supply: 139200000
    },
    { 
      id: 'ripple', 
      symbol: 'XRP', 
      name: 'XRP', 
      current_price: 2.85, 
      price_change_percentage_24h: -4.56, 
      total_volume: 7181503772, 
      market_cap: 170648139474,
      image: '', 
      market_cap_rank: 4,
      circulating_supply: 59800000000
    },
    { 
      id: 'solana', 
      symbol: 'SOL', 
      name: 'Solana', 
      current_price: 219.25, 
      price_change_percentage_24h: -6.02, 
      total_volume: 9672562305, 
      market_cap: 119725546634,
      image: '', 
      market_cap_rank: 5,
      circulating_supply: 546200000
    },
    { 
      id: 'dogecoin', 
      symbol: 'DOGE', 
      name: 'Dogecoin', 
      current_price: 0.244979, 
      price_change_percentage_24h: -7.99, 
      total_volume: 3892232080, 
      market_cap: 37092126612,
      image: '', 
      market_cap_rank: 6,
      circulating_supply: 151400000000
    },
    { 
      id: 'cardano', 
      symbol: 'ADA', 
      name: 'Cardano', 
      current_price: 0.815063, 
      price_change_percentage_24h: -6.19, 
      total_volume: 1880332688, 
      market_cap: 29811816998,
      image: '', 
      market_cap_rank: 7,
      circulating_supply: 36570000000
    },
    { 
      id: 'chainlink', 
      symbol: 'LINK', 
      name: 'Chainlink', 
      current_price: 21.78, 
      price_change_percentage_24h: -6.77, 
      total_volume: 1249934980, 
      market_cap: 14776675848,
      image: '', 
      market_cap_rank: 8,
      circulating_supply: 678500000
    },
    { 
      id: 'avalanche-2', 
      symbol: 'AVAX', 
      name: 'Avalanche', 
      current_price: 28.01, 
      price_change_percentage_24h: -7.66, 
      total_volume: 1121049189, 
      market_cap: 11825211745,
      image: '', 
      market_cap_rank: 9,
      circulating_supply: 422200000
    },
    { 
      id: 'litecoin', 
      symbol: 'LTC', 
      name: 'Litecoin', 
      current_price: 117.02, 
      price_change_percentage_24h: -0.97, 
      total_volume: 712579851, 
      market_cap: 8939614918,
      image: '', 
      market_cap_rank: 10,
      circulating_supply: 76350000
    },
    { 
      id: 'shiba-inu', 
      symbol: 'SHIB', 
      name: 'Shiba Inu', 
      current_price: 0.0000121, 
      price_change_percentage_24h: -5.45, 
      total_volume: 232324913, 
      market_cap: 7131630179,
      image: '', 
      market_cap_rank: 11,
      circulating_supply: 589300000000000
    },
    { 
      id: 'polkadot', 
      symbol: 'DOT', 
      name: 'Polkadot', 
      current_price: 4.10, 
      price_change_percentage_24h: -6.09, 
      total_volume: 336006693, 
      market_cap: 6240900615,
      image: '', 
      market_cap_rank: 12,
      circulating_supply: 1522000000
    }
  ];

  try {
    // Try CoinGecko API to get top coins by volume and recent gainers
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Smart-Money-Tracker/1.0'
        },
        // Cache for 45 seconds to reduce API calls but keep data reasonably fresh
        next: { revalidate: 45 }
      }
    );

    if (!response.ok) {
      console.warn(`CoinGecko API responded with ${response.status}: ${response.statusText}`);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for interesting tokens (high volume or significant price changes)
    const interestingTokens = data.filter((coin: any) => {
      const hasHighVolume = coin.total_volume > 50000000; // >$50M volume
      const hasPriceMovement = Math.abs(coin.price_change_percentage_24h) > 3; // >3% change
      const isTopMarketCap = coin.market_cap_rank <= 100; // Top 100 by market cap
      
      return hasHighVolume || hasPriceMovement || isTopMarketCap;
    });
    
    // Sort by a combination of volume and price change
    const sortedTokens = interestingTokens
      .sort((a: any, b: any) => {
        const aScore = (a.total_volume / 1000000) + Math.abs(a.price_change_percentage_24h) * 10;
        const bScore = (b.total_volume / 1000000) + Math.abs(b.price_change_percentage_24h) * 10;
        return bScore - aScore;
      })
      .slice(0, 15);
    
    // Format the data for our rolling banner
    const formattedData = sortedTokens.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase() || 'N/A',
      name: coin.name || 'Unknown',
      current_price: coin.current_price || 0,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      price_change_percentage_1h: coin.price_change_percentage_1h || 0,
      price_change_percentage_7d: coin.price_change_percentage_7d || 0,
      total_volume: coin.total_volume || 0,
      market_cap: coin.market_cap || 0,
      image: coin.image || '',
      market_cap_rank: coin.market_cap_rank || 0,
      circulating_supply: coin.circulating_supply || 0,
      ath: coin.ath || 0,
      atl: coin.atl || 0
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString(),
      source: 'coingecko-live',
      total_coins: data.length,
      filtered_coins: formattedData.length
    });
  } catch (error) {
    console.info('Using fallback trending tokens data due to API limitations:', error);
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      fallback: true,
      message: 'Using fallback trending tokens data due to API rate limits'
    });
  }
}
