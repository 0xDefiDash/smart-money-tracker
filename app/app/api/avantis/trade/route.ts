
import { NextRequest, NextResponse } from 'next/server'

const AVANTIS_SERVICE_URL = process.env.AVANTIS_SERVICE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.pair || !body.side || !body.size) {
      return NextResponse.json(
        { error: 'Missing required fields: pair, side, and size are required' },
        { status: 400 }
      )
    }

    // Validate side
    if (body.side !== 'buy' && body.side !== 'sell') {
      return NextResponse.json(
        { error: 'Invalid side: must be "buy" or "sell"' },
        { status: 400 }
      )
    }

    // Validate size
    if (typeof body.size !== 'number' || body.size <= 0) {
      return NextResponse.json(
        { error: 'Invalid size: must be a positive number' },
        { status: 400 }
      )
    }

    const response = await fetch(`${AVANTIS_SERVICE_URL}/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating trade via Avantis service:', error)
    return NextResponse.json(
      { error: 'Failed to create trade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
