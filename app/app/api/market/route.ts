
import { NextResponse } from 'next/server'
import { TokenMetricsAPI, CoinGeckoAPI } from '@/lib/api-clients'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

const tokenMetrics = new TokenMetricsAPI()
const coinGecko = new CoinGeckoAPI() // Fallback

export async function GET() {
  try {
    console.log('Starting market data fetch with TokenMetrics API...')
    
    // Fetch top cryptocurrencies from TokenMetrics (primary) with CoinGecko fallback
    let cryptos = await tokenMetrics.getTopCryptocurrencies(20)
    console.log(`TokenMetrics returned ${cryptos.length} cryptocurrencies`)
    
    // If TokenMetrics fails or returns empty, fallback to CoinGecko
    if (cryptos.length === 0) {
      console.log('TokenMetrics API returned no data, falling back to CoinGecko...')
      cryptos = await coinGecko.getTopCryptocurrencies(20)
    }
    
    if (cryptos.length === 0) {
      return NextResponse.json({
        status: 'error',
        error: 'Failed to fetch market data from both TokenMetrics and CoinGecko APIs'
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

    return NextResponse.json({
      status: 'success',
      data: formattedData,
      source: cryptos.length > 0 && cryptos[0].id ? 'TokenMetrics' : 'CoinGecko',
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
