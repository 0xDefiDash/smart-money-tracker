

import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoPrices } from '@/lib/price-service';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Fetch prices using the enhanced price service
    const { data, source, cached } = await fetchCryptoPrices();
    
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
      source: source,
      cached: cached,
      total_coins: data.length,
      filtered_coins: formattedData.length
    });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    
    return NextResponse.json({
      success: false,
      data: [],
      timestamp: new Date().toISOString(),
      source: 'error',
      error: 'Failed to fetch trending tokens'
    }, { status: 500 });
  }
}
