

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Radio,
  Video,
  Users,
  Heart,
  Gift,
  Trophy,
  Crown,
  Zap,
  Camera,
  Monitor,
  Smartphone,
  Play,
  Settings,
  Eye,
  Star,
  CheckCircle,
  Rocket,
  Gamepad2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoLiveSetup } from '@/components/live-stream/go-live-setup'
import { StreamManager } from '@/components/live-stream/stream-manager'

interface StreamSettings {
  title: string
  description: string
  category: string
  isPublic: boolean
  allowChat: boolean
  allowGifts: boolean
  maturityRating: string
  tags: string[]
}

export default function StreamSetupPage() {
  const { data: session } = useSession() || {}
  
  const [isLive, setIsLive] = useState(false)
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    allowChat: true,
    allowGifts: true,
    maturityRating: 'everyone',
    tags: []
  })
  
  // Generate unique stream key (in real app, this would come from backend)
  const streamKey = `bw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const handleGoLive = () => {
    setIsLive(true)
    // In a real app, this would notify the backend that the user is going live
    console.log('Going live with settings:', streamSettings)
  }

  return (
    <div className="min-h-screen bg-tech-gradient p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 border-purple-500/30 glow-purple">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center glow-hover flex-shrink-0">
                  <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                    Block Wars Streaming Studio
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">Stream your Block Wars gameplay live to the world</p>
                </div>
              </div>
              <div className="text-center flex-shrink-0">
                {isLive ? (
                  <div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                      LIVE NOW
                    </Badge>
                    <div className="text-xs text-muted-foreground">Broadcasting</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">Ready</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">To Stream</div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/80 border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-400">Desktop Camera</h3>
                <p className="text-sm text-muted-foreground">Stream directly from your webcam or external camera</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Most Popular
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50 hover:border-green-500/30 transition-colors cursor-pointer group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-400">Mobile Stream</h3>
                <p className="text-sm text-muted-foreground">Stream from your phone or tablet camera</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Quick Setup
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50 hover:border-purple-500/30 transition-colors cursor-pointer group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-400">Pro WebRTC</h3>
                <p className="text-sm text-muted-foreground">Professional real-time streaming with WebRTC</p>
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Pro Quality
              </Badge>
            </CardContent>
          </Card>
        </div>

        {!isLive ? (
          /* Stream Setup Mode */
          <GoLiveSetup
            streamSettings={streamSettings}
            setStreamSettings={setStreamSettings}
            streamKey={streamKey}
            onGoLive={handleGoLive}
            isLive={isLive}
          />
        ) : (
          /* Live Streaming Mode */
          <div className="space-y-6">
            {/* Live Stream Header */}
            <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 glow-green">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        You're Live! 🎉
                      </h2>
                      <p className="text-muted-foreground">Broadcasting to the Block Wars community</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">1,247</div>
                    <div className="text-sm text-muted-foreground">Live Viewers</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">892</div>
                    <div className="text-xs text-muted-foreground">Total Likes</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">156</div>
                    <div className="text-xs text-muted-foreground">New Followers</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">23</div>
                    <div className="text-xs text-muted-foreground">Gifts Received</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">2h 15m</div>
                    <div className="text-xs text-muted-foreground">Stream Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Streaming Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Stream Controls */}
                <StreamManager 
                  isStreamer={true}
                  streamerId="current-user"
                />
              </div>
              
              <div className="space-y-4">
                {/* Live Stream Info */}
                <Card className="bg-slate-900/80 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Stream Info</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h4 className="font-bold text-lg line-clamp-2">
                      {streamSettings.title || '🎮 Your Amazing Live Stream'}
                    </h4>
                    {streamSettings.category && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <Gamepad2 className="w-3 h-3 mr-1" />
                        {streamSettings.category}
                      </Badge>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <p>Started: Just now</p>
                      <p>Quality: HD 720p</p>
                      <p>Connection: Excellent</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-900/80 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setIsLive(false)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      End Stream
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Stream Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Viewer List
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Helpful Tips */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Streaming Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h6 className="font-semibold text-green-400">Good Lighting</h6>
                  <p className="text-muted-foreground">Make sure you have adequate lighting for clear video quality</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h6 className="font-semibold text-blue-400">Stable Internet</h6>
                  <p className="text-muted-foreground">Ensure you have a stable internet connection for smooth streaming</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h6 className="font-semibold text-purple-400">Engage Viewers</h6>
                  <p className="text-muted-foreground">Interact with chat and respond to viewer comments regularly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
