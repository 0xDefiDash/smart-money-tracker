

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
        // Use fallback data - Updated with current September 24, 2025 prices
        cryptos = [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 111438, price_change_24h: -764.2, price_change_percentage_24h: -0.69, market_cap: 2221083498980, total_volume: 43118128985, market_cap_rank: 1, image: '' },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 4101.94, price_change_percentage_24h: -1.79, price_change_24h: -74.7, market_cap: 495001372321, total_volume: 28252237841, market_cap_rank: 2, image: '' },
          { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.000, price_change_percentage_24h: -0.05, price_change_24h: -0.0005, market_cap: 172794458855, total_volume: 97274819129, market_cap_rank: 3, image: '' },
          { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.81, price_change_percentage_24h: -1.42, price_change_24h: -0.04, market_cap: 167971672795, total_volume: 5209407199, market_cap_rank: 4, image: '' },
          { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 1002.14, price_change_percentage_24h: 2.13, price_change_24h: 20.9, market_cap: 139491668263, total_volume: 2956351116, market_cap_rank: 5, image: '' },
          { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 206.37, price_change_percentage_24h: -4.49, price_change_24h: -9.7, market_cap: 112153522612, total_volume: 6491536237, market_cap_rank: 6, image: '' },
          { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 0.9997, price_change_percentage_24h: -0.001, price_change_24h: -0.00001, market_cap: 73954679236, total_volume: 9504798023, market_cap_rank: 7, image: '' },
          { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.234053, price_change_percentage_24h: -2.56, price_change_24h: -0.0061, market_cap: 35248733509, total_volume: 2716430172, market_cap_rank: 8, image: '' },
          { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.798089, price_change_percentage_24h: -2.70, price_change_24h: -0.0222, market_cap: 29144771183, total_volume: 1429660809, market_cap_rank: 11, image: '' },
          { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 21.21, price_change_percentage_24h: -1.34, price_change_24h: -0.29, market_cap: 14349079962, total_volume: 784885948, market_cap_rank: 15, image: '' },
          { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 33.32, price_change_percentage_24h: -3.92, price_change_24h: -1.36, market_cap: 14052988678, total_volume: 1745972080, market_cap_rank: 17, image: '' },
          { id: 'sui', symbol: 'sui', name: 'Sui', current_price: 3.28, price_change_percentage_24h: -2.42, price_change_24h: -0.081, market_cap: 11647688958, total_volume: 1050212609, market_cap_rank: 20, image: '' }
        ]
        console.info('Using updated fallback market data with current September 2025 prices')
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
