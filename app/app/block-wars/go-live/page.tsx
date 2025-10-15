

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video,
  Radio,
  Settings,
  Eye,
  Users,
  Heart,
  Play,
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Gamepad2,
  Trophy,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoLiveSetup } from '@/components/live-stream/go-live-setup'
import { StreamDashboard } from '@/components/live-stream/stream-dashboard'
import { TipButton } from '@/components/dash-tv/tip-button'
import { RecentTips } from '@/components/dash-tv/recent-tips'
import { WalletSetup } from '@/components/dash-tv/wallet-setup'

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

interface UserStats {
  level: number
  rank: number
  totalBlocks: number
  monthlyEarnings: number
  followers: number
  totalStreams: number
  avgViewers: number
  totalHours: number
}

export default function GoLivePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  
  const [isLive, setIsLive] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [streamKey, setStreamKey] = useState('')
  const [activeTab, setActiveTab] = useState('setup')
  const [previewMode, setPreviewMode] = useState(false)
  const [currentStreamerId, setCurrentStreamerId] = useState('')
  
  // Mock user stats
  const [userStats] = useState<UserStats>({
    level: 28,
    rank: 145,
    totalBlocks: 89,
    monthlyEarnings: 12500,
    followers: 1247,
    totalStreams: 23,
    avgViewers: 156,
    totalHours: 47.5
  })

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

  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    likes: 0,
    chatMessages: 0,
    giftsReceived: 0,
    streamDuration: 0,
    peakViewers: 0
  })

  useEffect(() => {
    // Generate stream key
    setStreamKey(`stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    
    // If user is already live, show dashboard and restore stream ID
    const savedStreamState = localStorage.getItem('isLive')
    const savedStreamerId = localStorage.getItem('currentStreamerId')
    if (savedStreamState === 'true' && savedStreamerId) {
      setIsLive(true)
      setCurrentStreamerId(savedStreamerId)
      setActiveTab('dashboard')
      startStreamStatsSimulation()
    }
  }, [])

  const startStreamStatsSimulation = () => {
    const interval = setInterval(() => {
      if (!isLive) {
        clearInterval(interval)
        return
      }

      setStreamStats(prev => ({
        viewers: Math.max(0, prev.viewers + Math.floor(Math.random() * 10) - 4),
        likes: prev.likes + (Math.random() > 0.7 ? 1 : 0),
        chatMessages: prev.chatMessages + (Math.random() > 0.6 ? 1 : 0),
        giftsReceived: prev.giftsReceived + (Math.random() > 0.95 ? 1 : 0),
        streamDuration: prev.streamDuration + 1,
        peakViewers: Math.max(prev.peakViewers, prev.viewers)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }

  const handleGoLive = async () => {
    if (!streamSettings.title || !streamSettings.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Generate a consistent streamer ID for this session
      const streamerId = `user_${session?.user?.email?.split('@')[0] || 'anonymous'}_${Date.now()}`
      const streamData = {
        name: session?.user?.name || 'Anonymous Streamer',
        username: `@${session?.user?.email?.split('@')[0] || 'anonymous'}`,
        avatar: '🎮',
        followers: userStats.followers,
        streamTitle: streamSettings.title,
        category: streamSettings.category,
        description: streamSettings.description,
        tags: streamSettings.tags,
        isPublic: streamSettings.isPublic,
        allowChat: streamSettings.allowChat,
        allowGifts: streamSettings.allowGifts,
        maturityRating: streamSettings.maturityRating,
        gameLevel: userStats.level,
        totalBlocks: userStats.totalBlocks,
        rank: userStats.rank,
        isVerified: false,
        startTime: Date.now()
      }

      const response = await fetch('/api/stream/live-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamerId, streamData })
      })

      if (!response.ok) {
        throw new Error('Failed to register stream')
      }

      // Store the streamer ID for later cleanup and cross-page access
      localStorage.setItem('currentStreamerId', streamerId)
      localStorage.setItem('isLive', 'true')
      localStorage.setItem('streamData', JSON.stringify(streamData))

      setIsLive(true)
      setCurrentStreamerId(streamerId)
      setActiveTab('dashboard')
      
      // Initialize stream stats
      setStreamStats({
        viewers: Math.floor(Math.random() * 5) + 1,
        likes: 0,
        chatMessages: 0,
        giftsReceived: 0,
        streamDuration: 0,
        peakViewers: 0
      })

      startStreamStatsSimulation()
      
      console.log('Successfully went live with stream ID:', streamerId)
      
      // Notify that we're going live (this will be used by the VideoFeed component)
      window.dispatchEvent(new CustomEvent('streamGoLive', { 
        detail: { streamerId, streamData } 
      }))
    } catch (error) {
      console.error('Failed to go live:', error)
      alert('Failed to start stream. Please try again.')
    }
  }

  const handleEndStream = async () => {
    try {
      // Unregister the stream from the live streams API
      const streamerId = currentStreamerId || localStorage.getItem('currentStreamerId')
      if (streamerId) {
        const response = await fetch('/api/stream/live-streams', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamerId })
        })

        if (!response.ok) {
          console.error('Failed to unregister stream')
        }

        // Notify that stream is ending
        window.dispatchEvent(new CustomEvent('streamEnd', { 
          detail: { streamerId } 
        }))
      }

      localStorage.removeItem('currentStreamerId')
      localStorage.removeItem('isLive')
      localStorage.removeItem('streamData')

      setIsLive(false)
      setCurrentStreamerId('')
      setActiveTab('setup')
      
      // Reset stream stats
      setStreamStats({
        viewers: 0,
        likes: 0,
        chatMessages: 0,
        giftsReceived: 0,
        streamDuration: 0,
        peakViewers: 0
      })

      console.log('Stream ended successfully')
    } catch (error) {
      console.error('Failed to end stream:', error)
      // Still end the local stream even if API call fails
      setIsLive(false)
      setCurrentStreamerId('')
      setActiveTab('setup')
      localStorage.removeItem('currentStreamerId')
      localStorage.removeItem('isLive')
      localStorage.removeItem('streamData')
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-tech-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-tech-gradient flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to start streaming</p>
            <Button onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tech-gradient p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {/* Mobile-Optimized Header */}
        <Card className={cn(
          "border-red-500/30 glow-red",
          isLive 
            ? "bg-gradient-to-r from-red-500/20 to-pink-500/20" 
            : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
        )}>
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-3 sm:pb-4">
            {/* Mobile-first header layout */}
            <div className="space-y-3 sm:space-y-4">
              {/* Top row - Icon and title */}
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center glow-hover flex-shrink-0",
                    isLive 
                      ? "bg-gradient-to-br from-red-500 to-pink-500" 
                      : "bg-gradient-to-br from-blue-500 to-purple-500"
                  )}>
                    {isLive ? <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className={cn(
                      "text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent line-clamp-1",
                      isLive 
                        ? "from-red-400 to-pink-400" 
                        : "from-blue-400 to-purple-400"
                    )}>
                      {isLive ? 'You\'re Live!' : 'Go Live - Dash TV'}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {isLive 
                        ? `Streaming for ${formatDuration(streamStats.streamDuration)}` 
                        : 'Start your Dash TV live stream'}
                    </p>
                  </div>
                </div>
                
                {/* Your rank - compact on mobile */}
                <div className="text-center flex-shrink-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">#{userStats.rank}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Rank</div>
                </div>
              </div>
              
              {/* Live stats row - optimized for mobile */}
              {isLive && (
                <div className="flex items-center justify-around sm:justify-center sm:space-x-8 py-2 border-t border-slate-700/30">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">{streamStats.viewers}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Viewers</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700/30" />
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-400">{streamStats.likes}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700/30 hidden sm:block" />
                  <div className="text-center hidden sm:block">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">{streamStats.chatMessages}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Messages</div>
                  </div>
                </div>
              )}
            </div>

            {isLive && (
              <div className="space-y-2 sm:space-y-3 pt-3 border-t border-slate-700/50">
                {/* Live indicator and title */}
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] sm:text-xs flex-shrink-0">
                    LIVE - {streamSettings.category}
                  </Badge>
                  <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1 flex-1 min-w-0">
                    {streamSettings.title}
                  </div>
                </div>
                
                {/* End stream button - full width on mobile */}
                <Button
                  onClick={handleEndStream}
                  variant="destructive"
                  size="sm"
                  className="flex items-center justify-center space-x-2 w-full touch-manipulation h-10 sm:h-11"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-sm sm:text-base">End Stream</span>
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* User Stats Overview - Mobile optimized grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {[
            { icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />, value: userStats.level, label: 'Level', color: 'text-blue-400' },
            { icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />, value: `#${userStats.rank}`, label: 'Rank', color: 'text-yellow-400' },
            { icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />, value: userStats.followers.toLocaleString(), label: 'Followers', color: 'text-purple-400' },
            { icon: <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />, value: userStats.totalBlocks, label: 'Blocks', color: 'text-green-400' },
            { icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />, value: userStats.totalStreams, label: 'Streams', color: 'text-orange-400' },
            { icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />, value: userStats.avgViewers, label: 'Avg Views', color: 'text-cyan-400' },
            { icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />, value: `${userStats.totalHours}h`, label: 'Hours', color: 'text-pink-400' },
            { icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />, value: `$${(userStats.monthlyEarnings / 1000).toFixed(1)}k`, label: 'Monthly', color: 'text-green-400' },
          ].map((stat, index) => (
            <Card key={index} className="bg-slate-900/80 border-slate-700/50 hover:bg-slate-800/80 transition-colors touch-manipulation active:scale-95">
              <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                <div className="mx-auto mb-1">{stat.icon}</div>
                <div className={cn("text-base sm:text-lg md:text-xl font-bold", stat.color)}>{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Mobile-optimized tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/80 border-slate-700/50 h-auto p-1">
            <TabsTrigger 
              value="setup" 
              disabled={isLive} 
              className="text-xs sm:text-sm font-medium py-2.5 sm:py-3 touch-manipulation"
            >
              <span className="hidden sm:inline">Stream Setup</span>
              <span className="sm:hidden">Setup</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              disabled={!isLive} 
              className="text-xs sm:text-sm font-medium py-2.5 sm:py-3 touch-manipulation"
            >
              <span className="hidden sm:inline">Live Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-xs sm:text-sm font-medium py-2.5 sm:py-3 touch-manipulation"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-3 sm:space-y-4 md:space-y-6">
            <GoLiveSetup
              streamSettings={streamSettings}
              setStreamSettings={setStreamSettings}
              streamKey={streamKey}
              streamerId={currentStreamerId}
              onGoLive={handleGoLive}
              isLive={isLive}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-3 sm:space-y-4 md:space-y-6">
            <StreamDashboard
              streamStats={streamStats}
              streamSettings={streamSettings}
              userStats={userStats}
              onEndStream={handleEndStream}
              streamerId={currentStreamerId}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <WalletSetup streamerId={currentStreamerId} />
              
              <Card className="bg-slate-900/80 border-slate-700/50">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Stream Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="text-center py-8">
                    <p className="text-sm sm:text-base text-muted-foreground">Advanced streaming settings will be available here.</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">Coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <RecentTips streamerId={currentStreamerId} showStats={true} limit={10} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

