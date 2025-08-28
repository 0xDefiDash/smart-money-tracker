
import { NextRequest, NextResponse } from 'next/server'

const AVANTIS_SERVICE_URL = process.env.AVANTIS_SERVICE_URL || 'http://localhost:8001'

export async function GET(
  request: NextRequest,
  { params }: { params: { pair: string } }
) {
  try {
    const { pair } = params
    
    if (!pair) {
      return NextResponse.json(
        { error: 'Trading pair is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${AVANTIS_SERVICE_URL}/price/${encodeURIComponent(pair)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Price data not found for this pair' },
          { status: 404 }
        )
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching price from Avantis service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
