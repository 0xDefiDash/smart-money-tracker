

import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const videosPath = join(process.cwd(), 'public', 'videos')
    
    if (!existsSync(videosPath)) {
      return NextResponse.json({ videos: [], error: 'Videos directory not found' }, { status: 404 })
    }
    
    const files = readdirSync(videosPath)
    const videoFiles = files.filter(file => file.endsWith('.mp4'))
    
    const videoInfo = videoFiles.map(file => ({
      filename: file,
      path: `/videos/${file}`, // Direct public path
      apiPath: `/api/stream/direct/${encodeURIComponent(file)}` // API path
    }))
    
    return NextResponse.json({
      videos: videoInfo,
      count: videoFiles.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error listing videos:', error)
    return NextResponse.json({ error: 'Failed to list videos' }, { status: 500 })
  }
}

