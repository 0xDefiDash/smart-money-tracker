
import { NextRequest, NextResponse } from 'next/server'

const AVANTIS_SERVICE_URL = process.env.AVANTIS_SERVICE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.pair) {
      return NextResponse.json(
        { error: 'Missing required field: pair is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${AVANTIS_SERVICE_URL}/subscribe`, {
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
    console.error('Error subscribing to price feed via Avantis service:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to price feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
