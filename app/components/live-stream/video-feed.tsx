
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  RefreshCw
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
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  // Detect device type
  useEffect(() => {
    const checkDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
      setDeviceType(isMobile ? 'mobile' : 'desktop')
    }
    checkDeviceType()
  }, [])

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

  // Auto start if requested
  useEffect(() => {
    if (autoStart && !stream) {
      startVideo()
    }
  }, [autoStart])

  const getMediaConstraints = (): MediaConstraints => {
    const baseVideoConstraints = {
      width: { ideal: deviceType === 'mobile' ? 720 : 1280 },
      height: { ideal: deviceType === 'mobile' ? 1280 : 720 },
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

  const startVideo = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const constraints = getMediaConstraints()
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.muted = isMuted
      }
      
      setStream(newStream)
      setError(null)
    } catch (err: any) {
      console.error('Failed to start video:', err)
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

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
      })
      setStream(null)
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
        await startVideo()
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
        await startVideo()
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
    if (deviceType === 'mobile' && stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings()
        const newFacingMode = settings.facingMode === 'user' ? 'environment' : 'user'
        
        try {
          videoTrack.stop()
          const videoConstraints = getMediaConstraints().video
          const newConstraints = typeof videoConstraints === 'object' ? {
            ...videoConstraints,
            facingMode: newFacingMode
          } : {
            facingMode: newFacingMode
          }
          
          const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: newConstraints,
            audio: false 
          })
          
          const newVideoTrack = newStream.getVideoTracks()[0]
          stream.removeTrack(videoTrack)
          stream.addTrack(newVideoTrack)
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream
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
        startVideo()
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
              {stream && (
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
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
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
                    {isLoading ? 'Starting Camera...' : error ? 'Camera Error' : 'Camera Off'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {error || (isLoading ? 'Please wait...' : 'Click to enable camera')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          {stream && showControls && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-black/60 text-white text-xs px-2 py-1">
                  {isVideoEnabled && isAudioEnabled ? 'Video + Audio' : 
                   isVideoEnabled ? 'Video Only' :
                   isAudioEnabled ? 'Audio Only' : 'No Feed'}
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
                
                {deviceType === 'mobile' && (
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

        {/* Error Display */}
        {error && showControls && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Camera Error</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {showControls && isStreamer && (
          <div className="grid grid-cols-2 gap-3">
            {/* Desktop Camera Button */}
            <Button
              onClick={() => {
                setDeviceType('desktop')
                setIsVideoEnabled(true)
                setIsAudioEnabled(true)
                startVideo()
              }}
              variant={deviceType === 'desktop' && stream ? "default" : "outline"}
              className="flex flex-col items-center space-y-2 h-20 text-center"
              disabled={isLoading}
            >
              <Monitor className="w-6 h-6" />
              <div>
                <div className="font-semibold text-sm">Desktop Camera</div>
                <div className="text-xs text-muted-foreground">
                  {deviceType === 'desktop' && isVideoEnabled ? 'Active' : 'Enable'}
                </div>
              </div>
            </Button>

            {/* Mobile Camera Button */}
            <Button
              onClick={() => {
                setDeviceType('mobile')
                setIsVideoEnabled(true)
                setIsAudioEnabled(true)
                startVideo()
              }}
              variant={deviceType === 'mobile' && stream ? "default" : "outline"}
              className="flex flex-col items-center space-y-2 h-20 text-center"
              disabled={isLoading}
            >
              <Smartphone className="w-6 h-6" />
              <div>
                <div className="font-semibold text-sm">Mobile Camera</div>
                <div className="text-xs text-muted-foreground">
                  {deviceType === 'mobile' && isVideoEnabled ? 'Active' : 'Enable'}
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Detailed Controls */}
        {showControls && stream && (
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

        {/* Device Status Info */}
        {showControls && (
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
