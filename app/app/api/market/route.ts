
import { NextResponse } from 'next/server'
import { CoinAPIClient, CoinGeckoAPI } from '@/lib/api-clients'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

const coinAPI = new CoinAPIClient()
const coinGecko = new CoinGeckoAPI() // Fallback

export async function GET() {
  try {
    console.log('Starting market data fetch with CoinGecko (primary) and CoinAPI fallback...')
    
    // Fetch top cryptocurrencies from CoinGecko (primary) with CoinAPI fallback
    let cryptos = await coinGecko.getTopCryptocurrencies(20)
    console.log(`CoinGecko returned ${cryptos.length} cryptocurrencies`)
    
    // If CoinGecko fails or returns empty, fallback to CoinAPI
    if (cryptos.length === 0) {
      console.log('CoinGecko returned no data, falling back to CoinAPI...')
      cryptos = await coinAPI.getTopCryptocurrencies(20)
      console.log(`CoinAPI returned ${cryptos.length} cryptocurrencies`)
    }
    
    if (cryptos.length === 0) {
      return NextResponse.json({
        status: 'error',
        error: 'Failed to fetch market data from both CoinGecko and CoinAPI APIs'
      }, { status: 500 })
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

    // Determine data source - CoinGecko is primary, CoinAPI is fallback
    let dataSource = 'CoinGecko';
    if (cryptos.length === 0) {
      dataSource = 'Enhanced Fallback';
    }

    return NextResponse.json({
      status: 'success',
      data: formattedData,
      source: dataSource,
      timestamp: new Date().toISOString(),
      count: formattedData.length
    })

  } catch (error) {
    console.error('Market API error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error'
    }, { status: 500 })
  }
}
