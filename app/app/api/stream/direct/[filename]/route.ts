

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Invalid filename', { status: 400 })
    }
    
    // Only allow .mp4 files
    if (!filename.endsWith('.mp4')) {
      return new NextResponse('File type not allowed', { status: 400 })
    }
    
    const videoPath = join(process.cwd(), 'public', 'videos', filename)
    
    if (!existsSync(videoPath)) {
      console.log('Video not found at:', videoPath)
      return new NextResponse('Video not found', { status: 404 })
    }
    
    const stats = statSync(videoPath)
    const videoSize = stats.size
    
    // Get range header for video streaming
    const range = request.headers.get('range')
    
    if (range) {
      // Handle range requests for video streaming
      console.log('Range request:', range)
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10) || 0
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1
      const chunkSize = (end - start) + 1
      
      // Read the chunk
      const buffer = Buffer.alloc(chunkSize)
      const fd = require('fs').openSync(videoPath, 'r')
      require('fs').readSync(fd, buffer, 0, chunkSize, start)
      require('fs').closeSync(fd)
      
      return new NextResponse(buffer, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${videoSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range'
        }
      })
    } else {
      // Send entire video
      const videoBuffer = readFileSync(videoPath)
      
      return new NextResponse(videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range'
        }
      })
    }
  } catch (error) {
    console.error('Error serving direct video:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range'
    }
  })
}

