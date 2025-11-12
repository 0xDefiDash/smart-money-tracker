

import { NextResponse } from 'next/server'
import { fetchCryptoPrices } from '@/lib/price-service'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

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
    console.log('Starting market data fetch using enhanced price service...')
    
    // Fetch prices using the enhanced price service with automatic fallbacks
    const { data: cryptos, source: dataSource, cached } = await fetchCryptoPrices()
    
    console.log(`Fetched ${cryptos.length} cryptocurrencies from ${dataSource} (cached: ${cached})`)

    // Update database with current prices (only if not cached to reduce DB writes)
    if (!cached) {
      for (const crypto of cryptos.slice(0, 20)) { // Top 20 only
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
      image: crypto.image || '',
    }))

    return NextResponse.json({
      status: 'success',
      data: formattedData,
      source: dataSource,
      cached: cached,
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
