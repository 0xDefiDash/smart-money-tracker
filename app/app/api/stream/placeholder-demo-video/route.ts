
import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // List of available video files from your uploads
    const videoFiles = [
      '51bc0967-834a-4440-ba3c-8c17d3ce43ab_0780159e12e96b0a676be5a09c7b20fa.mp4',
      'c581c8b6-21de-4b7e-a1e9-2a5bf0bda69b_4a2e3d1774800e58c0f0375b5784b2f4.mp4'
    ]
    
    // Select a random video file to simulate different streams
    const selectedVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)]
    const videoPath = join(process.cwd(), 'public', 'videos', selectedVideo)
    
    if (!existsSync(videoPath)) {
      return new NextResponse('Video not found', { status: 404 })
    }
    
    const videoBuffer = readFileSync(videoPath)
    
    // Get range header for video streaming
    const range = request.headers.get('range')
    const videoSize = videoBuffer.length
    
    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1
      const chunkSize = (end - start) + 1
      const videoChunk = videoBuffer.slice(start, end + 1)
      
      return new NextResponse(videoChunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${videoSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    } else {
      // Send entire video
      return new NextResponse(videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
  } catch (error) {
    console.error('Error serving video:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
