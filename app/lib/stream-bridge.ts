
'use client'

// Stream Bridge - Connects streamer feeds to viewers in real-time
class StreamBridge {
  private static instance: StreamBridge
  private streams: Map<string, MediaStream> = new Map()
  private viewers: Map<string, Set<HTMLVideoElement>> = new Map()
  private streamData: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): StreamBridge {
    if (!StreamBridge.instance) {
      StreamBridge.instance = new StreamBridge()
    }
    return StreamBridge.instance
  }

  // Register a new stream from a streamer
  public registerStream(streamerId: string, stream: MediaStream, metadata: any = {}) {
    console.log('Registering stream for streamer:', streamerId)
    this.streams.set(streamerId, stream)
    this.streamData.set(streamerId, {
      ...metadata,
      startTime: Date.now(),
      isLive: true
    })

    // Notify existing viewers
    const viewers = this.viewers.get(streamerId)
    if (viewers) {
      viewers.forEach(videoElement => {
        this.connectStreamToVideo(streamerId, videoElement)
      })
    }

    return true
  }

  // Unregister a stream when streamer stops
  public unregisterStream(streamerId: string) {
    console.log('Unregistering stream for streamer:', streamerId)
    
    // Stop all tracks
    const stream = this.streams.get(streamerId)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    // Clear viewers
    const viewers = this.viewers.get(streamerId)
    if (viewers) {
      viewers.forEach(videoElement => {
        videoElement.srcObject = null
      })
      viewers.clear()
    }

    this.streams.delete(streamerId)
    this.streamData.delete(streamerId)
    this.viewers.delete(streamerId)
  }

  // Connect a viewer's video element to a stream
  public connectViewer(streamerId: string, videoElement: HTMLVideoElement): boolean {
    console.log('Connecting viewer to stream:', streamerId)
    
    if (!this.viewers.has(streamerId)) {
      this.viewers.set(streamerId, new Set())
    }
    
    const viewers = this.viewers.get(streamerId)!
    viewers.add(videoElement)

    // If stream is available, connect immediately
    return this.connectStreamToVideo(streamerId, videoElement)
  }

  // Disconnect a viewer
  public disconnectViewer(streamerId: string, videoElement: HTMLVideoElement) {
    const viewers = this.viewers.get(streamerId)
    if (viewers) {
      viewers.delete(videoElement)
      videoElement.srcObject = null
    }
  }

  // Get stream status
  public getStreamStatus(streamerId: string) {
    const stream = this.streams.get(streamerId)
    const metadata = this.streamData.get(streamerId)
    
    return {
      isAvailable: !!stream,
      isLive: !!stream && stream.active,
      metadata,
      viewerCount: this.viewers.get(streamerId)?.size || 0
    }
  }

  // List all live streams
  public getLiveStreams(): Array<{streamerId: string, metadata: any, viewerCount: number}> {
    const liveStreams: Array<{streamerId: string, metadata: any, viewerCount: number}> = []
    
    this.streams.forEach((stream, streamerId) => {
      if (stream.active) {
        const metadata = this.streamData.get(streamerId)
        const viewerCount = this.viewers.get(streamerId)?.size || 0
        
        liveStreams.push({
          streamerId,
          metadata,
          viewerCount
        })
      }
    })
    
    return liveStreams
  }

  private connectStreamToVideo(streamerId: string, videoElement: HTMLVideoElement): boolean {
    const stream = this.streams.get(streamerId)
    if (!stream || !stream.active) {
      console.log('Stream not available for:', streamerId)
      return false
    }

    try {
      // Clone the stream to avoid conflicts
      const clonedStream = stream.clone()
      videoElement.srcObject = clonedStream
      
      // Handle stream end
      stream.addEventListener('inactive', () => {
        videoElement.srcObject = null
      })

      console.log('Successfully connected stream to video element')
      return true
    } catch (error) {
      console.error('Failed to connect stream to video:', error)
      return false
    }
  }
}

// Export singleton instance
export const streamBridge = StreamBridge.getInstance()

// Utility functions for easier use
export const registerLiveStream = (streamerId: string, stream: MediaStream, metadata?: any) => {
  return streamBridge.registerStream(streamerId, stream, metadata)
}

export const stopLiveStream = (streamerId: string) => {
  streamBridge.unregisterStream(streamerId)
}

export const connectToLiveStream = (streamerId: string, videoElement: HTMLVideoElement) => {
  return streamBridge.connectViewer(streamerId, videoElement)
}

export const disconnectFromLiveStream = (streamerId: string, videoElement: HTMLVideoElement) => {
  streamBridge.disconnectViewer(streamerId, videoElement)
}

export const getLiveStreamStatus = (streamerId: string) => {
  return streamBridge.getStreamStatus(streamerId)
}

export const getAllLiveStreams = () => {
  return streamBridge.getLiveStreams()
}
