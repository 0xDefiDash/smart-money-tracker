
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
    
    // Fallback data if API fails
    const fallbackData = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 42500, price_change_percentage_24h: 2.5, total_volume: 15000000000, image: '', market_cap_rank: 1 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 2800, price_change_percentage_24h: -1.2, total_volume: 8000000000, image: '', market_cap_rank: 2 },
      { id: 'tether', symbol: 'USDT', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01, total_volume: 25000000000, image: '', market_cap_rank: 3 },
      { id: 'bnb', symbol: 'BNB', name: 'BNB', current_price: 320, price_change_percentage_24h: 1.8, total_volume: 2000000000, image: '', market_cap_rank: 4 },
      { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 95, price_change_percentage_24h: 5.2, total_volume: 1800000000, image: '', market_cap_rank: 5 },
      { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', current_price: 1.00, price_change_percentage_24h: -0.01, total_volume: 3500000000, image: '', market_cap_rank: 6 },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: 3.1, total_volume: 450000000, image: '', market_cap_rank: 7 },
      { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', current_price: 28, price_change_percentage_24h: -0.8, total_volume: 380000000, image: '', market_cap_rank: 8 },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.08, price_change_percentage_24h: 4.5, total_volume: 650000000, image: '', market_cap_rank: 9 },
      { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', current_price: 15.50, price_change_percentage_24h: -2.1, total_volume: 420000000, image: '', market_cap_rank: 10 }
    ];

    return NextResponse.json({
      success: false,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      error: 'Using fallback data due to API error'
    });
  }
}
