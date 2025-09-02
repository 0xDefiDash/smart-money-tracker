
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Protocol {
  id: string
  name: string
  symbol?: string
  category: string
  chains: string[]
  tvl: number
  chainTvls?: Record<string, number>
  change_1d?: number
  change_7d?: number
  change_1m?: number
}

export async function GET(request: NextRequest) {
  try {
    // Fetch protocols from DefiLlama
    const response = await fetch('https://api.llama.fi/protocols', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status}`)
    }

    const protocols: Protocol[] = await response.json()

    if (!Array.isArray(protocols)) {
      throw new Error('Invalid response format from DefiLlama')
    }

    // Filter and process protocols
    const validProtocols = protocols
      .filter(protocol => protocol.tvl > 1000000) // At least $1M TVL
      .sort((a, b) => b.tvl - a.tvl) // Sort by TVL descending

    // Group by categories
    const protocolsByCategory = {
      lending: validProtocols.filter(p => p.category === 'Lending').slice(0, 10),
      dexes: validProtocols.filter(p => p.category === 'Dexes').slice(0, 10),
      derivatives: validProtocols.filter(p => p.category === 'Derivatives').slice(0, 10),
      'liquid-staking': validProtocols.filter(p => p.category === 'Liquid Staking').slice(0, 10),
      bridge: validProtocols.filter(p => p.category === 'Bridge').slice(0, 10),
      other: validProtocols.filter(p => 
        !['Lending', 'Dexes', 'Derivatives', 'Liquid Staking', 'Bridge'].includes(p.category)
      ).slice(0, 10)
    }

    // Calculate summary statistics
    const summary = {
      totalProtocols: validProtocols.length,
      totalTVL: validProtocols.reduce((sum: number, protocol: Protocol) => sum + protocol.tvl, 0),
      categories: Object.entries(protocolsByCategory).map(([category, protocols]: [string, Protocol[]]) => ({
        name: category,
        count: protocols.length,
        totalTVL: protocols.reduce((sum: number, p: Protocol) => sum + p.tvl, 0)
      })).sort((a, b) => b.totalTVL - a.totalTVL),
      topChains: (() => {
        const chainTVL: Record<string, number> = {}
        validProtocols.forEach(protocol => {
          protocol.chains?.forEach(chain => {
            const tvl = protocol.chainTvls?.[chain] || protocol.tvl / protocol.chains.length
            chainTVL[chain] = (chainTVL[chain] || 0) + tvl
          })
        })
        return Object.entries(chainTVL)
          .map(([name, tvl]) => ({ name, tvl }))
          .sort((a, b) => b.tvl - a.tvl)
          .slice(0, 10)
      })(),
      marketMovers: {
        gainers: validProtocols
          .filter(p => p.change_1d && p.change_1d > 0)
          .sort((a, b) => (b.change_1d || 0) - (a.change_1d || 0))
          .slice(0, 5),
        losers: validProtocols
          .filter(p => p.change_1d && p.change_1d < 0)
          .sort((a, b) => (a.change_1d || 0) - (b.change_1d || 0))
          .slice(0, 5)
      }
    }

    return NextResponse.json({
      status: 'success',
      data: {
        protocols: protocolsByCategory,
        summary,
        topProtocols: validProtocols.slice(0, 25),
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching DefiLlama protocols:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to fetch protocols'
      },
      { status: 500 }
    )
  }
}
