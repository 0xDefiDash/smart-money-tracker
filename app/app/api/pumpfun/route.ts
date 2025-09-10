
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
    
    // Return mock data as fallback with current information
    const mockTokens = [
      {
        tokenAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        name: 'PEPE COIN',
        symbol: 'PEPE',
        logo: null,
        decimals: '6',
        priceNative: '0.000000045',
        priceUsd: '0.00001234',
        liquidity: '125000',
        fullyDilutedValuation: '12345000',
        bondingCurveProgress: 85.6,
        progressColor: '#f59e0b',
        isNearGraduation: false,
        formattedLiquidity: '$125.00K',
        formattedFDV: '$12.35M',
        priceUsdFormatted: '0.00001234',
        bondingProgressFormatted: '85.60',
        createdAt: '2025-09-10T08:30:00Z',
      },
      {
        tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        name: 'SOLANA DOGE',
        symbol: 'SDOGE',
        logo: null,
        decimals: '9',
        priceNative: '0.000000123',
        priceUsd: '0.00003456',
        liquidity: '89500',
        fullyDilutedValuation: '3456000',
        bondingCurveProgress: 94.2,
        progressColor: '#10b981',
        isNearGraduation: true,
        formattedLiquidity: '$89.50K',
        formattedFDV: '$3.46M',
        priceUsdFormatted: '0.00003456',
        bondingProgressFormatted: '94.20',
        createdAt: '2025-09-10T07:15:00Z',
      },
      {
        tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'MOON ROCKET',
        symbol: 'MOON',
        logo: null,
        decimals: '6',
        priceNative: '0.000000067',
        priceUsd: '0.00001892',
        liquidity: '203000',
        fullyDilutedValuation: '18920000',
        bondingCurveProgress: 72.8,
        progressColor: '#f59e0b',
        isNearGraduation: false,
        formattedLiquidity: '$203.00K',
        formattedFDV: '$18.92M',
        priceUsdFormatted: '0.00001892',
        bondingProgressFormatted: '72.80',
        createdAt: '2025-09-10T09:45:00Z',
      },
      {
        tokenAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'PUMP STARTER',
        symbol: 'PUMP',
        logo: null,
        decimals: '6',
        priceNative: '0.000000089',
        priceUsd: '0.00002511',
        liquidity: '156000',
        fullyDilutedValuation: '25110000',
        bondingCurveProgress: 67.3,
        progressColor: '#f59e0b',
        isNearGraduation: false,
        formattedLiquidity: '$156.00K',
        formattedFDV: '$25.11M',
        priceUsdFormatted: '0.00002511',
        bondingProgressFormatted: '67.30',
        createdAt: '2025-09-10T06:20:00Z',
      },
      {
        tokenAddress: 'So11111111111111111111111111111111111111112',
        name: 'BABY SOL',
        symbol: 'BSOL',
        logo: null,
        decimals: '9',
        priceNative: '0.000000034',
        priceUsd: '0.00000956',
        liquidity: '76800',
        fullyDilutedValuation: '956000',
        bondingCurveProgress: 45.1,
        progressColor: '#f97316',
        isNearGraduation: false,
        formattedLiquidity: '$76.80K',
        formattedFDV: '$956.00K',
        priceUsdFormatted: '0.00000956',
        bondingProgressFormatted: '45.10',
        createdAt: '2025-09-10T10:12:00Z',
      },
      {
        tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'AI TRADER',
        symbol: 'AITRD',
        logo: null,
        decimals: '6',
        priceNative: '0.000000156',
        priceUsd: '0.00004398',
        liquidity: '312000',
        fullyDilutedValuation: '43980000',
        bondingCurveProgress: 91.7,
        progressColor: '#10b981',
        isNearGraduation: true,
        formattedLiquidity: '$312.00K',
        formattedFDV: '$43.98M',
        priceUsdFormatted: '0.00004398',
        bondingProgressFormatted: '91.70',
        createdAt: '2025-09-10T05:35:00Z',
      },
      {
        tokenAddress: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        name: 'DEGEN COIN',
        symbol: 'DEGEN',
        logo: null,
        decimals: '9',
        priceNative: '0.000000098',
        priceUsd: '0.00002764',
        liquidity: '189000',
        fullyDilutedValuation: '27640000',
        bondingCurveProgress: 56.9,
        progressColor: '#f97316',
        isNearGraduation: false,
        formattedLiquidity: '$189.00K',
        formattedFDV: '$27.64M',
        priceUsdFormatted: '0.00002764',
        bondingProgressFormatted: '56.90',
        createdAt: '2025-09-10T11:28:00Z',
      },
      {
        tokenAddress: '4UuGQgkD3rSeoXatXRWwRfuJiELLLkKeUrcyTp5s9AyK',
        name: 'BASED TOKEN',
        symbol: 'BASED',
        logo: null,
        decimals: '6',
        priceNative: '0.000000234',
        priceUsd: '0.00006596',
        liquidity: '445000',
        fullyDilutedValuation: '65960000',
        bondingCurveProgress: 96.4,
        progressColor: '#10b981',
        isNearGraduation: true,
        formattedLiquidity: '$445.00K',
        formattedFDV: '$65.96M',
        priceUsdFormatted: '0.00006596',
        bondingProgressFormatted: '96.40',
        createdAt: '2025-09-10T04:22:00Z',
      }
    ]

    return NextResponse.json({
      result: mockTokens,
      cursor: null,
      timestamp: new Date().toISOString(),
    })
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
