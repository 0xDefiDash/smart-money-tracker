

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
        // Use fallback data - Updated with current October 13, 2025 prices
        cryptos = [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 115440, price_change_24h: 5120.27, price_change_percentage_24h: 4.64, market_cap: 2300575639970, total_volume: 93844409035, market_cap_rank: 1, image: '' },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 4164.35, price_change_percentage_24h: 11.72, price_change_24h: 436.84, market_cap: 502419395592, total_volume: 58014422026, market_cap_rank: 2, image: '' },
          { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 1300.4, price_change_percentage_24h: 16.57, price_change_24h: 184.87, market_cap: 181086523397, total_volume: 9338349967, market_cap_rank: 3, image: '' },
          { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.55, price_change_percentage_24h: 9.29, price_change_24h: 0.217, market_cap: 152642030857, total_volume: 9607779499, market_cap_rank: 4, image: '' },
          { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 196.7, price_change_percentage_24h: 12.05, price_change_24h: 21.16, market_cap: 107502010615, total_volume: 12437194712, market_cap_rank: 5, image: '' },
          { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.208276, price_change_percentage_24h: 13.76, price_change_24h: 0.0252, market_cap: 31480810721, total_volume: 4997667791, market_cap_rank: 6, image: '' },
          { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.707726, price_change_percentage_24h: 13.36, price_change_24h: 0.0834, market_cap: 25845951197, total_volume: 1981499230, market_cap_rank: 7, image: '' },
          { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 19.05, price_change_percentage_24h: 13.13, price_change_24h: 2.21, market_cap: 13272044887, total_volume: 1370006718, market_cap_rank: 8, image: '' },
          { id: 'tron', symbol: 'trx', name: 'TRON', current_price: 0.323922, price_change_percentage_24h: 3.66, price_change_24h: 0.0114, market_cap: 30659978545, total_volume: 991589171, market_cap_rank: 9, image: '' },
          { id: 'stellar', symbol: 'xlm', name: 'Stellar', current_price: 0.341056, price_change_percentage_24h: 7.74, price_change_24h: 0.0245, market_cap: 10917042707, total_volume: 336793361, market_cap_rank: 10, image: '' },
          { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', current_price: 541.49, price_change_percentage_24h: 8.03, price_change_24h: 40.23, market_cap: 10807411943, total_volume: 355940534, market_cap_rank: 11, image: '' },
          { id: 'wrapped-bitcoin', symbol: 'wbtc', name: 'Wrapped Bitcoin', current_price: 115330, price_change_percentage_24h: 4.76, price_change_24h: 5245.26, market_cap: 14650792574, total_volume: 519798193, market_cap_rank: 12, image: '' },
          { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 0.999905, price_change_percentage_24h: 0.01, price_change_24h: 0.000082, market_cap: 75713368843, total_volume: 16255725009, market_cap_rank: 13, image: '' },
          { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.001, price_change_percentage_24h: -0.01, price_change_24h: -0.0001, market_cap: 179988224764, total_volume: 178923369364, market_cap_rank: 14, image: '' },
          { id: 'staked-ether', symbol: 'steth', name: 'Lido Staked Ether', current_price: 4164.27, price_change_percentage_24h: 11.79, price_change_24h: 439.28, market_cap: 35404425190, total_volume: 86316348, market_cap_rank: 15, image: '' }
        ]
        console.info('Using updated fallback market data with current October 13, 2025 prices')
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
