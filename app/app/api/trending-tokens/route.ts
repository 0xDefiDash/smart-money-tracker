

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Updated fallback data with current September 24, 2025 prices
  const fallbackData = [
    { 
      id: 'bitcoin', 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      current_price: 111438, 
      price_change_percentage_24h: -0.69, 
      total_volume: 43118128985, 
      market_cap: 2221083498980,
      image: '', 
      market_cap_rank: 1,
      circulating_supply: 19748000
    },
    { 
      id: 'ethereum', 
      symbol: 'ETH', 
      name: 'Ethereum', 
      current_price: 4101.94, 
      price_change_percentage_24h: -1.79, 
      total_volume: 28252237841, 
      market_cap: 495001372321,
      image: '', 
      market_cap_rank: 2,
      circulating_supply: 120700000
    },
    { 
      id: 'tether', 
      symbol: 'USDT', 
      name: 'Tether', 
      current_price: 1.000, 
      price_change_percentage_24h: -0.05, 
      total_volume: 97274819129, 
      market_cap: 172794458855,
      image: '', 
      market_cap_rank: 3,
      circulating_supply: 172794458855
    },
    { 
      id: 'ripple', 
      symbol: 'XRP', 
      name: 'XRP', 
      current_price: 2.81, 
      price_change_percentage_24h: -1.42, 
      total_volume: 5209407199, 
      market_cap: 167971672795,
      image: '', 
      market_cap_rank: 4,
      circulating_supply: 59800000000
    },
    { 
      id: 'binancecoin', 
      symbol: 'BNB', 
      name: 'BNB', 
      current_price: 1002.14, 
      price_change_percentage_24h: 2.13, 
      total_volume: 2956351116, 
      market_cap: 139491668263,
      image: '', 
      market_cap_rank: 5,
      circulating_supply: 139200000
    },
    { 
      id: 'solana', 
      symbol: 'SOL', 
      name: 'Solana', 
      current_price: 206.37, 
      price_change_percentage_24h: -4.49, 
      total_volume: 6491536237, 
      market_cap: 112153522612,
      image: '', 
      market_cap_rank: 6,
      circulating_supply: 543600000
    },
    { 
      id: 'usd-coin', 
      symbol: 'USDC', 
      name: 'USDC', 
      current_price: 0.9997, 
      price_change_percentage_24h: -0.001, 
      total_volume: 9504798023, 
      market_cap: 73954679236,
      image: '', 
      market_cap_rank: 7,
      circulating_supply: 73954679236
    },
    { 
      id: 'dogecoin', 
      symbol: 'DOGE', 
      name: 'Dogecoin', 
      current_price: 0.234053, 
      price_change_percentage_24h: -2.56, 
      total_volume: 2716430172, 
      market_cap: 35248733509,
      image: '', 
      market_cap_rank: 8,
      circulating_supply: 150650000000
    },
    { 
      id: 'cardano', 
      symbol: 'ADA', 
      name: 'Cardano', 
      current_price: 0.798089, 
      price_change_percentage_24h: -2.70, 
      total_volume: 1429660809, 
      market_cap: 29144771183,
      image: '', 
      market_cap_rank: 11,
      circulating_supply: 36520000000
    },
    { 
      id: 'chainlink', 
      symbol: 'LINK', 
      name: 'Chainlink', 
      current_price: 21.21, 
      price_change_percentage_24h: -1.34, 
      total_volume: 784885948, 
      market_cap: 14349079962,
      image: '', 
      market_cap_rank: 15,
      circulating_supply: 676600000
    },
    { 
      id: 'avalanche-2', 
      symbol: 'AVAX', 
      name: 'Avalanche', 
      current_price: 33.32, 
      price_change_percentage_24h: -3.92, 
      total_volume: 1745972080, 
      market_cap: 14052988678,
      image: '', 
      market_cap_rank: 17,
      circulating_supply: 421800000
    },
    { 
      id: 'sui', 
      symbol: 'SUI', 
      name: 'Sui', 
      current_price: 3.28, 
      price_change_percentage_24h: -2.42, 
      total_volume: 1050212609, 
      market_cap: 11647688958,
      image: '', 
      market_cap_rank: 20,
      circulating_supply: 3550000000
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
