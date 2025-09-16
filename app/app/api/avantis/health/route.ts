export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'

const AVANTIS_SERVICE_URL = process.env.AVANTIS_SERVICE_URL || 'http://localhost:8001'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${AVANTIS_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error checking Avantis service health:', error)
    return NextResponse.json(
      { error: 'Failed to check Avantis service health', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
