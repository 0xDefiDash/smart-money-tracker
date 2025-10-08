

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
        // Use fallback data - Updated with current October 8, 2025 prices
        cryptos = [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 121470, price_change_24h: -2751.2, price_change_percentage_24h: -2.27, market_cap: 2421063383823, total_volume: 77457181529, market_cap_rank: 1, image: '' },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 4442.52, price_change_percentage_24h: -5.21, price_change_24h: -231.5, market_cap: 536510427363, total_volume: 51552953255, market_cap_rank: 2, image: '' },
          { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 1274.99, price_change_percentage_24h: 3.85, price_change_24h: 49.1, market_cap: 177322781508, total_volume: 10433000157, market_cap_rank: 3, image: '' },
          { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.85, price_change_percentage_24h: -4.56, price_change_24h: -0.13, market_cap: 170648139474, total_volume: 7181503772, market_cap_rank: 4, image: '' },
          { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 219.25, price_change_percentage_24h: -6.02, price_change_24h: -13.2, market_cap: 119725546634, total_volume: 9672562305, market_cap_rank: 5, image: '' },
          { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.244979, price_change_percentage_24h: -7.99, price_change_24h: -0.0196, market_cap: 37092126612, total_volume: 3892232080, market_cap_rank: 6, image: '' },
          { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.815063, price_change_percentage_24h: -6.19, price_change_24h: -0.0505, market_cap: 29811816998, total_volume: 1880332688, market_cap_rank: 7, image: '' },
          { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 21.78, price_change_percentage_24h: -6.77, price_change_24h: -1.47, market_cap: 14776675848, total_volume: 1249934980, market_cap_rank: 8, image: '' },
          { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 28.01, price_change_percentage_24h: -7.66, price_change_24h: -2.15, market_cap: 11825211745, total_volume: 1121049189, market_cap_rank: 9, image: '' },
          { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 117.02, price_change_percentage_24h: -0.97, price_change_24h: -1.13, market_cap: 8939614918, total_volume: 712579851, market_cap_rank: 10, image: '' },
          { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.0000121, price_change_percentage_24h: -5.45, price_change_24h: -0.0000007, market_cap: 7131630179, total_volume: 232324913, market_cap_rank: 11, image: '' },
          { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 4.10, price_change_percentage_24h: -6.09, price_change_24h: -0.25, market_cap: 6240900615, total_volume: 336006693, market_cap_rank: 12, image: '' },
          { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 7.74, price_change_percentage_24h: -7.05, price_change_24h: -0.55, market_cap: 4648438976, total_volume: 414251170, market_cap_rank: 13, image: '' },
          { id: 'cosmos', symbol: 'atom', name: 'Cosmos Hub', current_price: 4.03, price_change_percentage_24h: -4.86, price_change_24h: -0.20, market_cap: 1903561811, total_volume: 142141870, market_cap_rank: 14, image: '' },
          { id: 'polygon', symbol: 'matic', name: 'Polygon', current_price: 0.235553, price_change_percentage_24h: -5.00, price_change_24h: -0.0118, market_cap: 0, total_volume: 728711, market_cap_rank: 15, image: '' }
        ]
        console.info('Using updated fallback market data with current October 8, 2025 prices')
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
