
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // CoinGecko API to get top coins by volume
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=10&page=1&sparkline=false',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Cache for 60 seconds to avoid rate limits but keep data fresh
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens');
    }

    const data = await response.json();
    
    // Format the data for our rolling banner
    const formattedData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase() || 'N/A',
      name: coin.name || 'Unknown',
      current_price: coin.current_price || 0,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      total_volume: coin.total_volume || 0,
      image: coin.image || '',
      market_cap_rank: coin.market_cap_rank || 0
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    
    // Updated fallback data for September 11, 2025
    const fallbackData = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 142350, price_change_percentage_24h: 3.8, total_volume: 28500000000, image: '', market_cap_rank: 1 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 2689, price_change_percentage_24h: 2.1, total_volume: 16800000000, image: '', market_cap_rank: 2 },
      { id: 'tether', symbol: 'USDT', name: 'Tether', current_price: 1.001, price_change_percentage_24h: 0.02, total_volume: 45600000000, image: '', market_cap_rank: 3 },
      { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 189.45, price_change_percentage_24h: 7.3, total_volume: 5200000000, image: '', market_cap_rank: 4 },
      { id: 'bnb', symbol: 'BNB', name: 'BNB', current_price: 678, price_change_percentage_24h: 1.9, total_volume: 2890000000, image: '', market_cap_rank: 5 },
      { id: 'the-open-network', symbol: 'TON', name: 'Toncoin', current_price: 8.94, price_change_percentage_24h: 12.6, total_volume: 1950000000, image: '', market_cap_rank: 6 },
      { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', current_price: 0.999, price_change_percentage_24h: -0.01, total_volume: 6780000000, image: '', market_cap_rank: 7 },
      { id: 'sui', symbol: 'SUI', name: 'Sui', current_price: 3.84, price_change_percentage_24h: 15.2, total_volume: 1890000000, image: '', market_cap_rank: 8 },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.67, price_change_percentage_24h: 4.8, total_volume: 890000000, image: '', market_cap_rank: 9 },
      { id: 'base', symbol: 'BASE', name: 'Base', current_price: 28.94, price_change_percentage_24h: 8.9, total_volume: 1450000000, image: '', market_cap_rank: 10 }
    ];

    return NextResponse.json({
      success: false,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      error: 'Using fallback data due to API error'
    });
  }
}
