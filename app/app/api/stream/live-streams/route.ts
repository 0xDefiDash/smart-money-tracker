

import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for live streams (in production, this would be Redis or a database)
let liveStreams: { [streamerId: string]: any } = {}

export async function GET() {
  try {
    return NextResponse.json({
      streams: Object.values(liveStreams),
      count: Object.keys(liveStreams).length
    })
  } catch (error) {
    console.error('Error fetching live streams:', error)
    return NextResponse.json({ error: 'Failed to fetch live streams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamerId, streamData } = body

    // Add or update live stream
    liveStreams[streamerId] = {
      ...streamData,
      streamerId,
      isLive: true,
      startTime: Date.now(),
      lastUpdate: Date.now()
    }

    console.log('Stream started:', streamerId, streamData)
    
    return NextResponse.json({ 
      success: true, 
      streamerId,
      message: 'Stream registered successfully' 
    })
  } catch (error) {
    console.error('Error registering stream:', error)
    return NextResponse.json({ error: 'Failed to register stream' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamerId } = body

    if (liveStreams[streamerId]) {
      delete liveStreams[streamerId]
      console.log('Stream ended:', streamerId)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stream ended successfully' 
    })
  } catch (error) {
    console.error('Error ending stream:', error)
    return NextResponse.json({ error: 'Failed to end stream' }, { status: 500 })
  }
}
