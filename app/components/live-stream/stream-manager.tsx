

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Monitor,
  Smartphone,
  Radio,
  Video,
  Share,
  Camera,
  Mic,
  Settings,
  Zap,
  CheckCircle,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VideoFeed } from './video-feed'
import { WebRTCStream } from './webrtc-stream'

interface StreamManagerProps {
  streamerId?: string
  isStreamer?: boolean
  className?: string
}

export function StreamManager({ 
  streamerId, 
  isStreamer = false, 
  className = '' 
}: StreamManagerProps) {
  const [streamType, setStreamType] = useState<'basic' | 'webrtc'>('basic')
  const [isLive, setIsLive] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  
  const handleStreamStart = useCallback(() => {
    setIsLive(true)
    // Simulate viewer count updates
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  const handleStreamEnd = useCallback(() => {
    setIsLive(false)
    setViewerCount(0)
  }, [])

  if (isStreamer) {
    // Streamer interface - show streaming options
    return (
      <div className={cn("space-y-6", className)}>
        {/* Stream Status Header */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Your Live Stream
                  </h2>
                  <p className="text-muted-foreground">
                    {isLive ? 'Currently broadcasting to viewers' : 'Ready to go live'}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                {isLive && (
                  <>
                    <div className="text-2xl font-bold text-green-400">{viewerCount}</div>
                    <div className="text-sm text-muted-foreground">Viewers</div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                      LIVE
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stream Type Selection */}
        <Tabs value={streamType} onValueChange={(value) => setStreamType(value as 'basic' | 'webrtc')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Basic Camera</span>
            </TabsTrigger>
            <TabsTrigger value="webrtc" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Pro WebRTC</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>Desktop Camera Streaming</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Easy</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoFeed 
                  isStreamer={true}
                  showControls={true}
                  autoStart={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webrtc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Professional WebRTC Streaming</span>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Pro</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WebRTCStream 
                  isStreamer={true}
                  streamerId="current-user"
                  onStreamStart={handleStreamStart}
                  onStreamEnd={handleStreamEnd}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } else {
    // Viewer interface - show stream viewer
    return (
      <div className={cn("space-y-4", className)}>
        <VideoFeed 
          isStreamer={false}
          streamerId={streamerId}
          showControls={false}
          autoStart={true}
        />
      </div>
    )
  }
}
