
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Enhanced fallback data for September 24, 2025
  const fallbackData = [
    { 
      id: 'bitcoin', 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      current_price: 66750, 
      price_change_percentage_24h: 2.8, 
      total_volume: 28900000000, 
      market_cap: 1318000000000,
      image: '', 
      market_cap_rank: 1,
      circulating_supply: 19748000
    },
    { 
      id: 'ethereum', 
      symbol: 'ETH', 
      name: 'Ethereum', 
      current_price: 2650, 
      price_change_percentage_24h: 1.9, 
      total_volume: 15200000000, 
      market_cap: 318500000000,
      image: '', 
      market_cap_rank: 2,
      circulating_supply: 120280000
    },
    { 
      id: 'tether', 
      symbol: 'USDT', 
      name: 'Tether', 
      current_price: 1.000, 
      price_change_percentage_24h: -0.01, 
      total_volume: 45000000000, 
      market_cap: 120800000000,
      image: '', 
      market_cap_rank: 3,
      circulating_supply: 120800000000
    },
    { 
      id: 'solana', 
      symbol: 'SOL', 
      name: 'Solana', 
      current_price: 152.30, 
      price_change_percentage_24h: 4.7, 
      total_volume: 3200000000, 
      market_cap: 71200000000,
      image: '', 
      market_cap_rank: 4,
      circulating_supply: 467500000
    },
    { 
      id: 'binancecoin', 
      symbol: 'BNB', 
      name: 'BNB', 
      current_price: 610, 
      price_change_percentage_24h: 1.8, 
      total_volume: 2100000000, 
      market_cap: 88500000000,
      image: '', 
      market_cap_rank: 5,
      circulating_supply: 145000000
    },
    { 
      id: 'usd-coin', 
      symbol: 'USDC', 
      name: 'USD Coin', 
      current_price: 0.999, 
      price_change_percentage_24h: 0.01, 
      total_volume: 6200000000, 
      market_cap: 33800000000,
      image: '', 
      market_cap_rank: 6,
      circulating_supply: 33800000000
    },
    { 
      id: 'the-open-network', 
      symbol: 'TON', 
      name: 'Toncoin', 
      current_price: 6.12, 
      price_change_percentage_24h: 5.6, 
      total_volume: 320000000, 
      market_cap: 15600000000,
      image: '', 
      market_cap_rank: 7,
      circulating_supply: 2550000000
    },
    { 
      id: 'sui', 
      symbol: 'SUI', 
      name: 'Sui', 
      current_price: 1.95, 
      price_change_percentage_24h: 8.9, 
      total_volume: 520000000, 
      market_cap: 5420000000,
      image: '', 
      market_cap_rank: 8,
      circulating_supply: 2780000000
    },
    { 
      id: 'cardano', 
      symbol: 'ADA', 
      name: 'Cardano', 
      current_price: 0.382, 
      price_change_percentage_24h: 2.4, 
      total_volume: 340000000, 
      market_cap: 13400000000,
      image: '', 
      market_cap_rank: 9,
      circulating_supply: 35070000000
    },
    { 
      id: 'avalanche-2', 
      symbol: 'AVAX', 
      name: 'Avalanche', 
      current_price: 28.75, 
      price_change_percentage_24h: 3.8, 
      total_volume: 398000000, 
      market_cap: 11850000000,
      image: '', 
      market_cap_rank: 10,
      circulating_supply: 412500000
    },
    { 
      id: 'chainlink', 
      symbol: 'LINK', 
      name: 'Chainlink', 
      current_price: 12.45, 
      price_change_percentage_24h: 6.2, 
      total_volume: 620000000, 
      market_cap: 7540000000,
      image: '', 
      market_cap_rank: 11,
      circulating_supply: 604500000
    },
    { 
      id: 'polygon-ecosystem-token', 
      symbol: 'POL', 
      name: 'Polygon Ecosystem Token', 
      current_price: 0.435, 
      price_change_percentage_24h: 1.5, 
      total_volume: 158000000, 
      market_cap: 4280000000,
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
