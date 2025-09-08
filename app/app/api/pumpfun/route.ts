
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    const cursor = searchParams.get('cursor')

    const apiKey = process.env.MORALIS_API_KEY
    
    if (!apiKey) {
      console.error('Moralis API key is not configured')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let url = `https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/bonding?limit=${limit}`
    if (cursor) {
      url += `&cursor=${cursor}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
      next: {
        revalidate: 30, // Cache for 30 seconds
      },
    })

    if (!response.ok) {
      console.error('Moralis API error:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the data to add computed fields
    const transformedData = {
      ...data,
      result: data.result?.map((token: any) => ({
        ...token,
        progressColor: getProgressColor(token.bondingCurveProgress || 0),
        isNearGraduation: (token.bondingCurveProgress || 0) > 90,
        formattedLiquidity: formatNumber(parseFloat(token.liquidity || '0')),
        formattedFDV: formatNumber(parseFloat(token.fullyDilutedValuation || '0')),
        priceUsdFormatted: parseFloat(token.priceUsd || '0').toFixed(8),
        bondingProgressFormatted: (token.bondingCurveProgress || 0).toFixed(2),
      })) || [],
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching pump.fun bonding tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bonding tokens' },
      { status: 500 }
    )
  }
}

function getProgressColor(progress: number): string {
  if (progress > 90) return '#10b981' // Green for nearly complete
  if (progress > 60) return '#f59e0b' // Yellow for moderate progress
  if (progress > 30) return '#f97316' // Orange for early-moderate progress
  return '#ef4444' // Red for early phase
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}
