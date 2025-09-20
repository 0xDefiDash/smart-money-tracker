
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Enhanced fallback data for September 20, 2025
  const fallbackData = [
    { 
      id: 'bitcoin', 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      current_price: 63500, 
      price_change_percentage_24h: 4.2, 
      total_volume: 24500000000, 
      market_cap: 1254000000000,
      image: '', 
      market_cap_rank: 1,
      circulating_supply: 19748000
    },
    { 
      id: 'ethereum', 
      symbol: 'ETH', 
      name: 'Ethereum', 
      current_price: 2485, 
      price_change_percentage_24h: -1.6, 
      total_volume: 12800000000, 
      market_cap: 298000000000,
      image: '', 
      market_cap_rank: 2,
      circulating_supply: 120280000
    },
    { 
      id: 'tether', 
      symbol: 'USDT', 
      name: 'Tether', 
      current_price: 1.001, 
      price_change_percentage_24h: 0.01, 
      total_volume: 42000000000, 
      market_cap: 119000000000,
      image: '', 
      market_cap_rank: 3,
      circulating_supply: 118950000000
    },
    { 
      id: 'solana', 
      symbol: 'SOL', 
      name: 'Solana', 
      current_price: 145.80, 
      price_change_percentage_24h: 6.8, 
      total_volume: 2890000000, 
      market_cap: 68000000000,
      image: '', 
      market_cap_rank: 4,
      circulating_supply: 466500000
    },
    { 
      id: 'binancecoin', 
      symbol: 'BNB', 
      name: 'BNB', 
      current_price: 588, 
      price_change_percentage_24h: 2.4, 
      total_volume: 1890000000, 
      market_cap: 85000000000,
      image: '', 
      market_cap_rank: 5,
      circulating_supply: 144600000
    },
    { 
      id: 'usd-coin', 
      symbol: 'USDC', 
      name: 'USD Coin', 
      current_price: 0.999, 
      price_change_percentage_24h: -0.02, 
      total_volume: 5600000000, 
      market_cap: 32500000000,
      image: '', 
      market_cap_rank: 6,
      circulating_supply: 32530000000
    },
    { 
      id: 'the-open-network', 
      symbol: 'TON', 
      name: 'Toncoin', 
      current_price: 5.84, 
      price_change_percentage_24h: 8.9, 
      total_volume: 289000000, 
      market_cap: 14800000000,
      image: '', 
      market_cap_rank: 7,
      circulating_supply: 2540000000
    },
    { 
      id: 'sui', 
      symbol: 'SUI', 
      name: 'Sui', 
      current_price: 1.78, 
      price_change_percentage_24h: 12.4, 
      total_volume: 456000000, 
      market_cap: 4950000000,
      image: '', 
      market_cap_rank: 8,
      circulating_supply: 2780000000
    },
    { 
      id: 'cardano', 
      symbol: 'ADA', 
      name: 'Cardano', 
      current_price: 0.365, 
      price_change_percentage_24h: 3.8, 
      total_volume: 298000000, 
      market_cap: 12800000000,
      image: '', 
      market_cap_rank: 9,
      circulating_supply: 35070000000
    },
    { 
      id: 'avalanche-2', 
      symbol: 'AVAX', 
      name: 'Avalanche', 
      current_price: 26.45, 
      price_change_percentage_24h: 5.2, 
      total_volume: 345000000, 
      market_cap: 10900000000,
      image: '', 
      market_cap_rank: 10,
      circulating_supply: 412500000
    },
    { 
      id: 'chainlink', 
      symbol: 'LINK', 
      name: 'Chainlink', 
      current_price: 11.89, 
      price_change_percentage_24h: 7.4, 
      total_volume: 589000000, 
      market_cap: 7200000000,
      image: '', 
      market_cap_rank: 11,
      circulating_supply: 604500000
    },
    { 
      id: 'polygon-ecosystem-token', 
      symbol: 'POL', 
      name: 'Polygon Ecosystem Token', 
      current_price: 0.42, 
      price_change_percentage_24h: -2.8, 
      total_volume: 145000000, 
      market_cap: 4150000000,
      image: '', 
      market_cap_rank: 12,
      circulating_supply: 9850000000
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
