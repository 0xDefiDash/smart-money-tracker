
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface YieldPool {
  pool: string
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase?: number
  apyReward?: number
  rewardTokens?: string[]
  underlyingTokens?: string[]
  poolMeta?: string
  url?: string
}

export async function GET(request: NextRequest) {
  try {
    // Fetch yield pools from DefiLlama
    const response = await fetch('https://yields.llama.fi/pools', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from DefiLlama')
    }

    // Filter and sort pools for best opportunities
    const filteredPools = data.data
      .filter((pool: YieldPool) => {
        // Filter criteria for quality pools
        return (
          pool.tvlUsd > 1000000 && // At least $1M TVL
          pool.apy > 0 && 
          pool.apy < 1000 && // Remove outliers
          pool.chain && 
          pool.project &&
          pool.symbol
        )
      })
      .sort((a: YieldPool, b: YieldPool) => b.apy - a.apy) // Sort by APY descending
      .slice(0, 50) // Top 50 pools

    // Group by categories for better display
    const poolsByCategory = {
      lending: filteredPools.filter((pool: YieldPool) => 
        pool.poolMeta?.toLowerCase().includes('lending') || 
        ['Aave', 'Compound', 'Euler'].includes(pool.project)
      ).slice(0, 10),
      
      dex: filteredPools.filter((pool: YieldPool) => 
        pool.poolMeta?.toLowerCase().includes('dex') ||
        pool.poolMeta?.toLowerCase().includes('lp') ||
        ['Uniswap', 'Curve', 'Balancer', 'SushiSwap', 'PancakeSwap'].includes(pool.project)
      ).slice(0, 10),
      
      staking: filteredPools.filter((pool: YieldPool) => 
        pool.poolMeta?.toLowerCase().includes('staking') ||
        pool.apyReward && pool.apyReward > 0
      ).slice(0, 10),
      
      other: filteredPools.filter((pool: YieldPool) => {
        const isLending = pool.poolMeta?.toLowerCase().includes('lending') || 
          ['Aave', 'Compound', 'Euler'].includes(pool.project)
        const isDex = pool.poolMeta?.toLowerCase().includes('dex') ||
          pool.poolMeta?.toLowerCase().includes('lp') ||
          ['Uniswap', 'Curve', 'Balancer', 'SushiSwap', 'PancakeSwap'].includes(pool.project)
        const isStaking = pool.poolMeta?.toLowerCase().includes('staking') ||
          (pool.apyReward && pool.apyReward > 0)
        
        return !isLending && !isDex && !isStaking
      }).slice(0, 10)
    }

    // Calculate summary statistics
    const summary = {
      totalPools: filteredPools.length,
      totalTVL: filteredPools.reduce((sum: number, pool: YieldPool) => sum + pool.tvlUsd, 0),
      averageAPY: filteredPools.reduce((sum: number, pool: YieldPool) => sum + pool.apy, 0) / filteredPools.length,
      maxAPY: Math.max(...filteredPools.map((pool: YieldPool) => pool.apy)),
      topChains: (Array.from(new Set(filteredPools.map((pool: YieldPool) => pool.chain))) as string[])
        .map((chain: string) => ({
          name: chain,
          count: filteredPools.filter((pool: YieldPool) => pool.chain === chain).length,
          totalTVL: filteredPools
            .filter((pool: YieldPool) => pool.chain === chain)
            .reduce((sum: number, pool: YieldPool) => sum + pool.tvlUsd, 0)
        }))
        .sort((a, b) => b.totalTVL - a.totalTVL)
        .slice(0, 5)
    }

    return NextResponse.json({
      status: 'success',
      data: {
        pools: poolsByCategory,
        summary,
        topPools: filteredPools.slice(0, 20),
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching DefiLlama pools:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to fetch yield pools'
      },
      { status: 500 }
    )
  }
}
