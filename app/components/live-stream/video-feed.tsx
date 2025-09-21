

'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Settings,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Maximize,
  Volume2,
  VolumeX,
  RefreshCw,
  Radio,
  Share,
  Zap,
  Upload,
  Download,
  Play,
  Pause
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoFeedProps {
  isStreamer?: boolean
  streamerId?: string
  className?: string
  showControls?: boolean
  autoStart?: boolean
}

interface MediaConstraints {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

export function VideoFeed({ 
  isStreamer = false, 
  streamerId, 
  className = '',
  showControls = true,
  autoStart = false
}: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamQuality, setStreamQuality] = useState<'480p' | '720p' | '1080p'>('720p')
  const [permissions, setPermissions] = useState({
    camera: 'prompt',
    microphone: 'prompt'
  })
  const [availableDevices, setAvailableDevices] = useState<{
    videoInputs: MediaDeviceInfo[]
    audioInputs: MediaDeviceInfo[]
  }>({
    videoInputs: [],
    audioInputs: []
  })
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [gameStats, setGameStats] = useState({
    blocks: 150,
    level: 45,
    wins: 30,
    rank: 1,
    xp: 100,
    health: 70,
    energy: 80,
    focus: 60
  })
  const [isPaused, setIsPaused] = useState(false)

  // Detect device type and capabilities
  useEffect(() => {
    const checkDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
      const hasGetDisplayMedia = navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices
      
      setDeviceType(isMobile ? 'mobile' : 'desktop')
      
      // Log available media capabilities
      console.log('Media Capabilities:', {
        getUserMedia: navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices,
        getDisplayMedia: hasGetDisplayMedia,
        deviceType: isMobile ? 'mobile' : 'desktop'
      })
    }
    checkDeviceType()
  }, [])

  // Initialize random game stats on client side to avoid hydration issues
  useEffect(() => {
    if (!isStreamer && streamerId) {
      setGameStats({
        blocks: Math.floor(Math.random() * 50) + 150,
        level: Math.floor(Math.random() * 10) + 45,
        wins: Math.floor(Math.random() * 20) + 30,
        rank: Math.floor(Math.random() * 5) + 1,
        xp: Math.floor(Math.random() * 500) + 100,
        health: 70,
        energy: 80,
        focus: 60
      })
      
      // Update stats periodically for live feel
      const statsInterval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          xp: Math.floor(Math.random() * 500) + 100,
          health: Math.max(30, Math.min(100, 70 + Math.sin(Date.now() / 3000) * 25)),
          energy: Math.max(40, Math.min(100, 80 + Math.cos(Date.now() / 4000) * 20)),
          focus: Math.max(20, Math.min(100, 60 + Math.sin(Date.now() / 5000) * 35))
        }))
      }, 2000)
      
      return () => clearInterval(statsInterval)
    }
  }, [isStreamer, streamerId])

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions) {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          
          setPermissions({
            camera: cameraPermission.state,
            microphone: micPermission.state
          })

          // Listen for permission changes
          cameraPermission.onchange = () => {
            setPermissions(prev => ({ ...prev, camera: cameraPermission.state }))
          }
          micPermission.onchange = () => {
            setPermissions(prev => ({ ...prev, microphone: micPermission.state }))
          }
        }
      } catch (err) {
        console.error('Permission check failed:', err)
      }
    }
    checkPermissions()
  }, [])

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices.filter(device => device.kind === 'videoinput')
        const audioInputs = devices.filter(device => device.kind === 'audioinput')
        
        setAvailableDevices({ videoInputs, audioInputs })
        
        if (videoInputs.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoInputs[0].deviceId)
        }
        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId)
        }
      } catch (err) {
        console.error('Failed to enumerate devices:', err)
      }
    }

    if (navigator.mediaDevices) {
      getDevices()
      navigator.mediaDevices.ondevicechange = getDevices
    }

    return () => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.ondevicechange = null
      }
    }
  }, [selectedVideoDevice, selectedAudioDevice])

  // Auto start if requested and if this is a streamer's feed
  useEffect(() => {
    if ((autoStart && isStreamer) && !stream) {
      startDesktopCapture()
    }
  }, [autoStart, isStreamer])

  const getQualityConstraints = (quality: string) => {
    switch (quality) {
      case '1080p':
        return { width: { ideal: 1920 }, height: { ideal: 1080 } }
      case '720p':
        return { width: { ideal: 1280 }, height: { ideal: 720 } }
      case '480p':
      default:
        return { width: { ideal: 854 }, height: { ideal: 480 } }
    }
  }

  const getMediaConstraints = (): MediaConstraints => {
    const qualityConstraints = getQualityConstraints(streamQuality)
    
    const baseVideoConstraints = {
      ...qualityConstraints,
      frameRate: { ideal: 30, max: 60 },
      facingMode: deviceType === 'mobile' ? 'user' : undefined,
      deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined
    }

    const baseAudioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined
    }

    return {
      video: isVideoEnabled ? baseVideoConstraints : false,
      audio: isAudioEnabled ? baseAudioConstraints : false
    }
  }

  const startDesktopCapture = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First try to get camera access
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
      const constraints = getMediaConstraints()
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.muted = isMuted
      }
      
      setStream(newStream)
      setIsStreaming(true)
      setError(null)
      
      // If this is a streamer, also start sending the stream to the server
      if (isStreamer) {
        await startStreamBroadcast(newStream)
      }
    } catch (err: any) {
      console.error('Failed to start desktop capture:', err)
      let errorMessage = 'Failed to access camera'
      
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.'
          break
        case 'NotFoundError':
          errorMessage = 'No camera found. Please connect a camera and try again.'
          break
        case 'NotReadableError':
          errorMessage = 'Camera is already in use by another application.'
          break
        case 'OverconstrainedError':
          errorMessage = 'Camera settings are not supported. Try a different camera.'
          break
        case 'AbortError':
          errorMessage = 'Camera access was aborted.'
          break
        case 'SecurityError':
          errorMessage = 'Camera access blocked due to security restrictions.'
          break
        default:
          errorMessage = `Camera error: ${err.message || 'Unknown error'}`
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const startScreenShare = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError('Screen sharing is not supported in this browser')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          ...getQualityConstraints(streamQuality),
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      })

      // Combine screen video with microphone audio if needed
      if (isAudioEnabled && selectedAudioDevice) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined
            }
          })
          
          // Add audio track from microphone to screen stream
          const audioTrack = audioStream.getAudioTracks()[0]
          if (audioTrack) {
            screenStream.addTrack(audioTrack)
          }
        } catch (audioErr) {
          console.warn('Failed to add microphone audio:', audioErr)
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream
        videoRef.current.muted = isMuted
      }
      
      setStream(screenStream)
      setIsStreaming(true)
      setIsVideoEnabled(true)
      setError(null)

      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        stopVideo()
        setError('Screen sharing ended')
      }
      
      if (isStreamer) {
        await startStreamBroadcast(screenStream)
      }
    } catch (err: any) {
      console.error('Failed to start screen share:', err)
      setError(`Screen sharing error: ${err.message || 'Failed to capture screen'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const startStreamBroadcast = async (mediaStream: MediaStream) => {
    try {
      // In a real implementation, this would send the stream to a WebRTC server
      // For now, we'll simulate the broadcast
      console.log('Starting stream broadcast for streamer mode...')
      
      // Simulate sending stream data to server
      const streamData = {
        streamerId: 'current-user-id',
        quality: streamQuality,
        hasVideo: mediaStream.getVideoTracks().length > 0,
        hasAudio: mediaStream.getAudioTracks().length > 0,
        timestamp: Date.now()
      }
      
      // In a real app, you would send this to your streaming server
      // await fetch('/api/stream/start', {
      //   method: 'POST',
      //   body: JSON.stringify(streamData)
      // })
      
      console.log('Stream broadcast started:', streamData)
    } catch (err) {
      console.error('Failed to start stream broadcast:', err)
    }
  }

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
      })
      setStream(null)
      setIsStreaming(false)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const toggleVideo = async () => {
    if (stream && isVideoEnabled) {
      // Turn off video
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.stop()
        stream.removeTrack(videoTrack)
      }
      setIsVideoEnabled(false)
    } else {
      // Turn on video
      setIsVideoEnabled(true)
      if (!stream) {
        await startDesktopCapture()
      } else {
        // Add video track to existing stream
        try {
          const videoConstraints = getMediaConstraints().video
          if (videoConstraints) {
            const videoStream = await navigator.mediaDevices.getUserMedia({ 
              video: videoConstraints,
              audio: false 
            })
            const videoTrack = videoStream.getVideoTracks()[0]
            if (videoTrack) {
              stream.addTrack(videoTrack)
              setIsVideoEnabled(true)
            }
          }
        } catch (err) {
          console.error('Failed to add video track:', err)
          setError('Failed to enable video')
        }
      }
    }
  }

  const toggleAudio = async () => {
    if (stream && isAudioEnabled) {
      // Turn off audio
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.stop()
        stream.removeTrack(audioTrack)
      }
      setIsAudioEnabled(false)
    } else {
      // Turn on audio
      setIsAudioEnabled(true)
      if (!stream) {
        await startDesktopCapture()
      } else {
        // Add audio track to existing stream
        try {
          const audioConstraints = getMediaConstraints().audio
          if (audioConstraints) {
            const audioStream = await navigator.mediaDevices.getUserMedia({ 
              video: false,
              audio: audioConstraints 
            })
            const audioTrack = audioStream.getAudioTracks()[0]
            if (audioTrack) {
              stream.addTrack(audioTrack)
              setIsAudioEnabled(true)
            }
          }
        } catch (err) {
          console.error('Failed to add audio track:', err)
          setError('Failed to enable audio')
        }
      }
    }
  }

  const switchCamera = async () => {
    if (availableDevices.videoInputs.length <= 1) return
    
    const currentIndex = availableDevices.videoInputs.findIndex(d => d.deviceId === selectedVideoDevice)
    const nextIndex = (currentIndex + 1) % availableDevices.videoInputs.length
    const nextDevice = availableDevices.videoInputs[nextIndex]
    
    setSelectedVideoDevice(nextDevice.deviceId)
    
    // Restart video with new device
    if (stream && isVideoEnabled) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.stop()
        stream.removeTrack(videoTrack)
        
        try {
          const constraints = getMediaConstraints()
          if (constraints.video) {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: constraints.video,
              audio: false
            })
            const newTrack = newStream.getVideoTracks()[0]
            if (newTrack) {
              stream.addTrack(newTrack)
            }
          }
        } catch (err) {
          console.error('Failed to switch camera:', err)
          setError('Failed to switch camera')
        }
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const refreshStream = async () => {
    stopVideo()
    setTimeout(() => {
      if (isVideoEnabled || isAudioEnabled) {
        startDesktopCapture()
      }
    }, 100)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVideo()
    }
  }, [])

  return (
    <Card className={cn("bg-slate-900/80 border-slate-700/50", className)}>
      {showControls && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>{isStreamer ? 'Your Camera' : 'Live Feed'}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {deviceType}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isStreaming && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  LIVE
                </Badge>
              )}
              {permissions.camera === 'granted' && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn("space-y-4", !showControls && "p-0")}>
        {/* Video Display */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700/50">
          {!isStreamer && streamerId ? (
            /* Viewer Mode: Show real-time stream from the streamer */
            <div className="relative w-full h-full">
              <video
                key={streamerId}
                ref={videoRef}
                autoPlay
                playsInline
                loop
                muted={false} // Set to false initially to allow audio
                controls={false}
                className="w-full h-full object-cover bg-slate-800"
                onLoadStart={() => {
                  console.log('Video loading started for streamerId:', streamerId)
                  setError(null)
                  setIsLoading(true)
                }}
                onLoadedMetadata={() => {
                  console.log('Video metadata loaded')
                  setIsLoading(false)
                  // Try to play the video
                  if (videoRef.current) {
                    videoRef.current.play().catch(e => {
                      console.log('Autoplay failed, user interaction required:', e)
                      // This is normal - browsers prevent autoplay without user interaction
                    })
                  }
                }}
                onLoadedData={() => {
                  console.log('Video data loaded')
                  setIsLoading(false)
                }}
                onCanPlay={() => {
                  console.log('Video can play')
                  setIsLoading(false)
                }}
                onPlay={() => {
                  console.log('Video started playing')
                  setIsLoading(false)
                }}
                onError={(e) => {
                  const videoElement = e.target as HTMLVideoElement
                  console.error('Video loading error:', {
                    error: videoElement.error,
                    networkState: videoElement.networkState,
                    readyState: videoElement.readyState,
                    src: videoElement.src
                  })
                  setError(`Failed to load video stream. Error: ${videoElement.error?.message || 'Unknown error'}`)
                  setIsLoading(false)
                }}
                onStalled={() => {
                  console.warn('Video stalled')
                }}
                onWaiting={() => {
                  console.log('Video waiting for data')
                  setIsLoading(true)
                }}
                onEmptied={() => {
                  console.log('Video emptied')
                }}
                onAbort={() => {
                  console.log('Video loading aborted')
                }}
              >
                {/* Multiple source fallbacks */}
                <source 
                  src={streamerId.startsWith('user_') ? "/api/stream/placeholder-demo-video" : `/api/stream/${streamerId}`} 
                  type="video/mp4" 
                />
                <source 
                  src="/api/stream/direct/51bc0967-834a-4440-ba3c-8c17d3ce43ab_0780159e12e96b0a676be5a09c7b20fa.mp4" 
                  type="video/mp4" 
                />
                <source 
                  src="/videos/51bc0967-834a-4440-ba3c-8c17d3ce43ab_0780159e12e96b0a676be5a09c7b20fa.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
              
              {/* Live stream overlay with enhanced gaming UI */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Real-time gaming stats overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-green-500/90 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                    +{gameStats.xp} XP
                  </div>
                  <div className="bg-yellow-500/90 text-black text-xs px-3 py-1 rounded-full font-bold">
                    Block Mined! 💎
                  </div>
                </div>
                
                <div className="absolute bottom-20 left-4 space-y-2">
                  <div className="bg-purple-500/90 text-white text-xs px-3 py-1 rounded-full font-bold animate-bounce">
                    Epic Battle! ⚔️
                  </div>
                  <div className="bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full font-bold">
                    Strategy Mode
                  </div>
                </div>

                {/* Player health/energy bars */}
                <div className="absolute top-6 left-6 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-3 bg-gray-800/90 rounded-full overflow-hidden backdrop-blur-sm border border-gray-600">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 animate-pulse"
                        style={{ width: `${Math.max(0, Math.min(100, gameStats.health))}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-bold drop-shadow-lg">Health</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-3 bg-gray-800/90 rounded-full overflow-hidden backdrop-blur-sm border border-gray-600">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, gameStats.energy))}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-bold drop-shadow-lg">Energy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-3 bg-gray-800/90 rounded-full overflow-hidden backdrop-blur-sm border border-gray-600">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-700"
                        style={{ width: `${Math.max(0, Math.min(100, gameStats.focus))}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-bold drop-shadow-lg">Focus</span>
                  </div>
                </div>

                {/* Combat indicators */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-red-500/30">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 font-bold text-lg">LIVE GAMEPLAY</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-yellow-400">Blocks: </span>
                        <span className="text-white font-bold">{gameStats.blocks}</span>
                      </div>
                      <div>
                        <span className="text-blue-400">Level: </span>
                        <span className="text-white font-bold">{gameStats.level}</span>
                      </div>
                      <div>
                        <span className="text-green-400">Wins: </span>
                        <span className="text-white font-bold">{gameStats.wins}</span>
                      </div>
                      <div>
                        <span className="text-purple-400">Rank: </span>
                        <span className="text-white font-bold">#{gameStats.rank}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream quality indicator for viewers */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-medium">
                      {streamerId.startsWith('user_') ? 'LIVE USER STREAM' : 'Live HD Stream'}
                    </span>
                  </div>
                </div>

                {/* Special indicator for real user streams */}
                {streamerId.startsWith('user_') && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-gradient-to-r from-green-500/90 to-blue-500/90 text-white text-xs px-3 py-2 rounded-full font-bold animate-pulse border border-white/30">
                      🔴 REAL PLAYER STREAMING
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls for Viewers - always show basic controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.paused) {
                          videoRef.current.play()
                          setIsPaused(false)
                        } else {
                          videoRef.current.pause()
                          setIsPaused(true)
                        }
                      }
                    }}
                    className="bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !videoRef.current.muted
                        setIsMuted(videoRef.current.muted)
                      }
                    }}
                    className="bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.load() // Reload the video
                      }
                    }}
                    className="bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : stream ? (
            /* Streamer Mode: Show actual camera feed */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
              />
              
              {/* Streaming indicator overlay */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500/90 text-white text-xs px-3 py-1 animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  STREAMING LIVE
                </Badge>
              </div>
              
              {/* Stream quality indicator */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/70 text-white text-xs px-2 py-1">
                  {streamQuality.toUpperCase()}
                </Badge>
              </div>
            </div>
          ) : (
            /* No stream: Show setup/error state */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                  {isLoading ? (
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  ) : error ? (
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  ) : (
                    <VideoOff className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-400">
                    {isLoading ? 'Starting Camera...' : error ? 'Camera Error' : isStreamer ? 'Camera Ready' : 'Waiting for Stream'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {error || (isLoading ? 'Please wait...' : isStreamer ? 'Click buttons below to start streaming' : 'Stream will appear here when live')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video Controls Overlay - Only for streamers */}
          {stream && showControls && isStreamer && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-black/60 text-white text-xs px-2 py-1">
                  {isVideoEnabled && isAudioEnabled ? 'Video + Audio' : 
                   isVideoEnabled ? 'Video Only' :
                   isAudioEnabled ? 'Audio Only' : 'No Feed'}
                </Badge>
                <Badge className="bg-black/60 text-white text-xs px-2 py-1">
                  {streamQuality}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleMute}
                  className="bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                {availableDevices.videoInputs.length > 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={switchCamera}
                    className="bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Display - Only for streamers */}
        {error && showControls && isStreamer && (
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

        {/* Control Buttons - Only for streamers */}
        {showControls && isStreamer && (
          <div className="space-y-4">
            {/* Primary Streaming Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Desktop Camera Button */}
              <Button
                onClick={startDesktopCapture}
                variant={stream && deviceType === 'desktop' ? "default" : "outline"}
                className="flex flex-col items-center space-y-2 h-20 text-center"
                disabled={isLoading}
              >
                <Monitor className="w-6 h-6" />
                <div>
                  <div className="font-semibold text-sm">Desktop Camera</div>
                  <div className="text-xs text-muted-foreground">
                    {stream && deviceType === 'desktop' ? 'Active' : 'Start Webcam'}
                  </div>
                </div>
              </Button>

              {/* Screen Share Button */}
              <Button
                onClick={startScreenShare}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-20 text-center"
                disabled={isLoading || !navigator.mediaDevices?.getDisplayMedia}
              >
                <Share className="w-6 h-6" />
                <div>
                  <div className="font-semibold text-sm">Screen Share</div>
                  <div className="text-xs text-muted-foreground">
                    Share your screen
                  </div>
                </div>
              </Button>
            </div>

            {/* Stream Quality Selection */}
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <Label className="text-sm font-medium">Stream Quality:</Label>
              <div className="flex space-x-2">
                {(['480p', '720p', '1080p'] as const).map((quality) => (
                  <Button
                    key={quality}
                    variant={streamQuality === quality ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStreamQuality(quality)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    {quality}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Controls - Only for streamers with active stream */}
        {showControls && stream && isStreamer && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center space-x-2"
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="text-xs">{isVideoEnabled ? 'Video On' : 'Video Off'}</span>
            </Button>

            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center space-x-2"
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="text-xs">{isAudioEnabled ? 'Mic On' : 'Mic Off'}</span>
            </Button>

            <Button
              onClick={refreshStream}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span className="text-xs">Refresh</span>
            </Button>

            <Button
              onClick={stopVideo}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-red-400 hover:text-red-300"
            >
              <CameraOff className="w-4 h-4" />
              <span className="text-xs">Stop</span>
            </Button>
          </div>
        )}

        {/* Device Status Info - Only for streamers */}
        {showControls && isStreamer && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Camera Permission:</span>
              <Badge variant="outline" className={cn("text-xs", 
                permissions.camera === 'granted' ? 'text-green-400' : 
                permissions.camera === 'denied' ? 'text-red-400' : 'text-yellow-400'
              )}>
                {permissions.camera}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Microphone Permission:</span>
              <Badge variant="outline" className={cn("text-xs",
                permissions.microphone === 'granted' ? 'text-green-400' : 
                permissions.microphone === 'denied' ? 'text-red-400' : 'text-yellow-400'
              )}>
                {permissions.microphone}
              </Badge>
            </div>
            {availableDevices.videoInputs.length > 0 && (
              <div className="flex justify-between">
                <span>Available Cameras:</span>
                <span>{availableDevices.videoInputs.length}</span>
              </div>
            )}
            {stream && (
              <div className="flex justify-between">
                <span>Stream Status:</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Broadcasting
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Viewer Info - Show streaming quality info for viewers */}
        {!isStreamer && streamerId && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">Watching Live Stream</span>
            </div>
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                HD Quality • Real-time Block Wars Action
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
