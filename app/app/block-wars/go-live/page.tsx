

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
    
    // If user is already live, show dashboard
    const savedStreamState = localStorage.getItem('isLive')
    if (savedStreamState === 'true') {
      setIsLive(true)
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

  const handleGoLive = () => {
    if (!streamSettings.title || !streamSettings.category) {
      alert('Please fill in all required fields')
      return
    }

    setIsLive(true)
    setActiveTab('dashboard')
    localStorage.setItem('isLive', 'true')
    
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
  }

  const handleEndStream = () => {
    setIsLive(false)
    setActiveTab('setup')
    localStorage.removeItem('isLive')
    
    // Reset stream stats
    setStreamStats({
      viewers: 0,
      likes: 0,
      chatMessages: 0,
      giftsReceived: 0,
      streamDuration: 0,
      peakViewers: 0
    })
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
    <div className="min-h-screen bg-tech-gradient p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={cn(
          "border-red-500/30 glow-red",
          isLive 
            ? "bg-gradient-to-r from-red-500/20 to-pink-500/20" 
            : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
        )}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center glow-hover",
                  isLive 
                    ? "bg-gradient-to-br from-red-500 to-pink-500" 
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                )}>
                  {isLive ? <Radio className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <CardTitle className={cn(
                    "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    isLive 
                      ? "from-red-400 to-pink-400" 
                      : "from-blue-400 to-purple-400"
                  )}>
                    {isLive ? 'You\'re Live!' : 'Go Live - Block Wars'}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {isLive 
                      ? `Streaming for ${formatDuration(streamStats.streamDuration)}` 
                      : 'Start your Block Wars live stream'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {isLive && (
                  <div className="flex items-center space-x-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-400">{streamStats.viewers}</div>
                      <div className="text-sm text-muted-foreground">Viewers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-400">{streamStats.likes}</div>
                      <div className="text-sm text-muted-foreground">Likes</div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">#{userStats.rank}</div>
                  <div className="text-sm text-muted-foreground">Your Rank</div>
                </div>
              </div>
            </div>

            {isLive && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    LIVE - {streamSettings.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{streamSettings.title}</span>
                </div>
                
                <Button
                  onClick={handleEndStream}
                  variant="destructive"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>End Stream</span>
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* User Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">{userStats.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">#{userStats.rank}</div>
              <div className="text-xs text-muted-foreground">Rank</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">{userStats.followers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{userStats.totalBlocks}</div>
              <div className="text-xs text-muted-foreground">Blocks</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Video className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-400">{userStats.totalStreams}</div>
              <div className="text-xs text-muted-foreground">Streams</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cyan-400">{userStats.avgViewers}</div>
              <div className="text-xs text-muted-foreground">Avg Views</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-400">{userStats.totalHours}h</div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-400">${(userStats.monthlyEarnings / 1000).toFixed(1)}k</div>
              <div className="text-xs text-muted-foreground">Monthly</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/80 border-slate-700/50">
            <TabsTrigger value="setup" disabled={isLive}>
              Stream Setup
            </TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!isLive}>
              Live Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <GoLiveSetup
              streamSettings={streamSettings}
              setStreamSettings={setStreamSettings}
              streamKey={streamKey}
              onGoLive={handleGoLive}
              isLive={isLive}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <StreamDashboard
              streamStats={streamStats}
              streamSettings={streamSettings}
              userStats={userStats}
              onEndStream={handleEndStream}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle>Stream Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground">Advanced streaming settings will be available here.</p>
                  <p className="text-sm text-muted-foreground mt-2">Coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

