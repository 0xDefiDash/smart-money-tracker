
import { NextResponse } from 'next/server'
import { CoinAPIClient, CoinGeckoAPI } from '@/lib/api-clients'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

const coinAPI = new CoinAPIClient()
const coinGecko = new CoinGeckoAPI() // Fallback

export async function GET(request: Request) {
  // Add aggressive cache control headers for frequent updates
  const headers = new Headers({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  
  try {
    console.log('Starting market data fetch with CoinGecko (primary) and CoinAPI fallback...')
    
    let cryptos = []
    let dataSource = 'Fallback'
    
    try {
      // Fetch top cryptocurrencies from CoinGecko (primary)
      cryptos = await coinGecko.getTopCryptocurrencies(20)
      console.log(`CoinGecko returned ${cryptos.length} cryptocurrencies`)
      dataSource = 'CoinGecko'
    } catch (geckoError) {
      console.warn('CoinGecko API error:', geckoError)
      try {
        // If CoinGecko fails, fallback to CoinAPI
        console.log('CoinGecko failed, falling back to CoinAPI...')
        cryptos = await coinAPI.getTopCryptocurrencies(20)
        console.log(`CoinAPI returned ${cryptos.length} cryptocurrencies`)
        dataSource = 'CoinAPI'
      } catch (coinApiError) {
        console.warn('CoinAPI also failed:', coinApiError)
        // Use fallback data - Updated for September 24, 2025
        cryptos = [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 66750, price_change_24h: 1820, price_change_percentage_24h: 2.8, market_cap: 1318000000000, total_volume: 28900000000, market_cap_rank: 1, image: '' },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2650, price_change_percentage_24h: 1.9, price_change_24h: 49.4, market_cap: 318500000000, total_volume: 15200000000, market_cap_rank: 2, image: '' },
          { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.000, price_change_percentage_24h: -0.01, price_change_24h: -0.0001, market_cap: 120800000000, total_volume: 45000000000, market_cap_rank: 3, image: '' },
          { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 152.30, price_change_percentage_24h: 4.7, price_change_24h: 6.85, market_cap: 71200000000, total_volume: 3200000000, market_cap_rank: 4, image: '' },
          { id: 'bnb', symbol: 'bnb', name: 'BNB', current_price: 610, price_change_percentage_24h: 1.8, price_change_24h: 10.8, market_cap: 88500000000, total_volume: 2100000000, market_cap_rank: 5, image: '' },
          { id: 'the-open-network', symbol: 'ton', name: 'Toncoin', current_price: 6.12, price_change_percentage_24h: 5.6, price_change_24h: 0.324, market_cap: 15600000000, total_volume: 320000000, market_cap_rank: 6, image: '' },
          { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', current_price: 0.999, price_change_percentage_24h: 0.01, price_change_24h: 0.0001, market_cap: 33800000000, total_volume: 6200000000, market_cap_rank: 7, image: '' },
          { id: 'sui', symbol: 'sui', name: 'Sui', current_price: 1.95, price_change_percentage_24h: 8.9, price_change_24h: 0.159, market_cap: 5420000000, total_volume: 520000000, market_cap_rank: 8, image: '' },
          { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.382, price_change_percentage_24h: 2.4, price_change_24h: 0.009, market_cap: 13400000000, total_volume: 340000000, market_cap_rank: 9, image: '' },
          { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 28.75, price_change_percentage_24h: 3.8, price_change_24h: 1.05, market_cap: 11850000000, total_volume: 398000000, market_cap_rank: 10, image: '' }
        ]
        console.info('Using fallback market data due to API limitations')
        dataSource = 'Fallback'
      }
    }

    // Update database with current prices
    for (const crypto of cryptos) {
      try {
        // Update or create cryptocurrency record
        await prisma.cryptocurrency.upsert({
          where: { symbol: crypto.symbol.toUpperCase() },
          update: {
            name: crypto.name,
            coinGeckoId: crypto.id,
            marketCap: BigInt(Math.floor(crypto.market_cap || 0)),
            price: crypto.current_price,
            volume24h: crypto.total_volume,
            priceChange24h: crypto.price_change_percentage_24h,
            rank: crypto.market_cap_rank,
            updatedAt: new Date(),
          },
          create: {
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
            coinGeckoId: crypto.id,
            marketCap: BigInt(Math.floor(crypto.market_cap || 0)),
            price: crypto.current_price,
            volume24h: crypto.total_volume,
            priceChange24h: crypto.price_change_percentage_24h,
            rank: crypto.market_cap_rank,
            isActive: true,
          }
        })

        // Store price history
        await prisma.priceHistory.create({
          data: {
            cryptoId: (await prisma.cryptocurrency.findFirst({
              where: { symbol: crypto.symbol.toUpperCase() }
            }))?.id || '',
            price: crypto.current_price,
            marketCap: BigInt(Math.floor(crypto.market_cap || 0)),
            volume: crypto.total_volume,
            timestamp: new Date(),
          }
        })
      } catch (dbError) {
        console.error(`Error updating ${crypto.symbol}:`, dbError)
        continue
      }
    }

    // Format response data
    const formattedData = cryptos.map(crypto => ({
      id: crypto.id,
      symbol: crypto.symbol.toUpperCase(),
      name: crypto.name,
      price: crypto.current_price,
      change24h: crypto.price_change_24h,
      changePercent24h: crypto.price_change_percentage_24h,
      marketCap: crypto.market_cap,
      volume24h: crypto.total_volume,
      rank: crypto.market_cap_rank,
      image: crypto.image,
    }))

    // Data source is already determined in the try-catch blocks above

    return NextResponse.json({
      status: 'success',
      data: formattedData,
      source: dataSource,
      timestamp: new Date().toISOString(),
      count: formattedData.length
    }, { headers })

  } catch (error) {
    console.error('Market API error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error'
    }, { status: 500, headers })
  }
}
