

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WebRTCStreamProps {
  isStreamer: boolean
  streamerId?: string
  onStreamStart?: () => void
  onStreamEnd?: () => void
  className?: string
}

export function WebRTCStream({
  isStreamer,
  streamerId,
  onStreamStart,
  onStreamEnd,
  className = ''
}: WebRTCStreamProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)

  // WebRTC Configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  }

  // Initialize WebRTC connection
  const initializePeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration)
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the signaling server
        sendSignalingMessage({
          type: 'candidate',
          candidate: event.candidate,
          streamerId
        })
      }
    }

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState
      setConnectionState(state)
      
      if (state === 'connected') {
        setIsConnected(true)
        setError(null)
      } else if (state === 'failed' || state === 'disconnected') {
        setIsConnected(false)
        setError('Connection lost')
      }
    }

    peerConnectionRef.current = peerConnection
    return peerConnection
  }, [streamerId])

  // Send signaling message (in a real app, this would go through WebSocket)
  const sendSignalingMessage = async (message: any) => {
    try {
      await fetch('/api/stream/live-webrtc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
    } catch (err) {
      console.error('Signaling error:', err)
    }
  }

  // Start streaming (for streamers)
  const startStreaming = async () => {
    try {
      setError(null)
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize peer connection
      const peerConnection = initializePeerConnection()
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      // Create offer for viewers
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      // Send offer to signaling server
      await sendSignalingMessage({
        type: 'offer',
        offer,
        streamerId
      })

      setIsStreaming(true)
      onStreamStart?.()
      
    } catch (err: any) {
      setError(`Failed to start streaming: ${err.message}`)
      console.error('Streaming error:', err)
    }
  }

  // Stop streaming
  const stopStreaming = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    setIsStreaming(false)
    setIsConnected(false)
    setConnectionState('new')
    onStreamEnd?.()
  }

  // Join stream (for viewers)
  const joinStream = async () => {
    try {
      setError(null)
      
      const peerConnection = initializePeerConnection()
      
      // Send join request
      await sendSignalingMessage({
        type: 'join',
        streamerId
      })

      // In a real implementation, you would handle the offer/answer exchange here
      
    } catch (err: any) {
      setError(`Failed to join stream: ${err.message}`)
      console.error('Join stream error:', err)
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [])

  return (
    <Card className={cn("bg-slate-900/80 border-slate-700/50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Radio className="w-5 h-5" />
            <span>{isStreamer ? 'Live Streaming' : 'Live Viewer'}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isConnected && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                LIVE
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              WebRTC
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Display */}
        <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
          {isStreamer ? (
            // Streamer view - show local video
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            // Viewer view - show remote video
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Connection Status Overlay */}
          <div className="absolute top-4 right-4">
            <Badge className={cn(
              "text-xs",
              connectionState === 'connected' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              connectionState === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            )}>
              {connectionState === 'connected' ? 'Connected' :
               connectionState === 'connecting' ? 'Connecting' :
               connectionState === 'new' ? 'Ready' : 'Disconnected'}
            </Badge>
          </div>
          
          {/* No Stream Placeholder */}
          {!isStreaming && !isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-400">
                    {isStreamer ? 'Ready to Stream' : 'Waiting for Stream'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isStreamer ? 'Click Start Streaming to go live' : 'Stream will appear here when live'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Stream Error</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          {/* Primary Action Button */}
          <Button
            onClick={isStreamer ? (isStreaming ? stopStreaming : startStreaming) : joinStream}
            className={cn(
              "w-full h-12 font-semibold",
              isStreaming || isConnected 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isStreamer ? (
              isStreaming ? (
                <>
                  <VideoOff className="w-5 h-5 mr-2" />
                  Stop Streaming
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Start Streaming
                </>
              )
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Join Stream
              </>
            )}
          </Button>

          {/* Stream Controls - Only for active streamers */}
          {isStreamer && isStreaming && (
            <div className="flex space-x-2">
              <Button
                onClick={toggleVideo}
                variant={isVideoEnabled ? "default" : "outline"}
                className="flex-1"
              >
                {isVideoEnabled ? <Video className="w-4 h-4 mr-2" /> : <VideoOff className="w-4 h-4 mr-2" />}
                Video
              </Button>
              
              <Button
                onClick={toggleAudio}
                variant={isAudioEnabled ? "default" : "outline"}
                className="flex-1"
              >
                {isAudioEnabled ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
                Audio
              </Button>
            </div>
          )}
        </div>

        {/* Connection Info */}
        <div className="text-xs text-muted-foreground space-y-1 border-t border-slate-700/50 pt-3">
          <div className="flex justify-between">
            <span>Connection:</span>
            <span className={cn(
              connectionState === 'connected' ? 'text-green-400' :
              connectionState === 'connecting' ? 'text-yellow-400' :
              'text-gray-400'
            )}>
              {connectionState}
            </span>
          </div>
          {isStreamer && isStreaming && (
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                Broadcasting
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
