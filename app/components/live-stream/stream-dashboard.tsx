

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Radio,
  Eye,
  Heart,
  MessageCircle,
  Gift,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Trophy,
  Zap,
  Activity,
  BarChart3,
  Settings,
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecentTips } from '@/components/dash-tv/recent-tips'

interface StreamStats {
  viewers: number
  likes: number
  chatMessages: number
  giftsReceived: number
  streamDuration: number
  peakViewers: number
}

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

interface StreamDashboardProps {
  streamStats: StreamStats
  streamSettings: StreamSettings
  userStats: UserStats
  onEndStream: () => void
  streamerId?: string
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
  type: 'chat' | 'follow' | 'gift' | 'like'
  amount?: number
}

export function StreamDashboard({ 
  streamStats, 
  streamSettings, 
  userStats, 
  onEndStream,
  streamerId 
}: StreamDashboardProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [recentActivity, setRecentActivity] = useState<ChatMessage[]>([])
  const [viewerHistory, setViewerHistory] = useState<number[]>([])

  useEffect(() => {
    // Simulate activity feed
    const activities: ChatMessage[] = [
      { id: '1', username: 'BlockHunter92', message: 'Amazing gameplay!', timestamp: Date.now() - 30000, type: 'chat' },
      { id: '2', username: 'CryptoWhale', message: '', timestamp: Date.now() - 45000, type: 'follow' },
      { id: '3', username: 'GameMaster', message: '', timestamp: Date.now() - 60000, type: 'gift', amount: 50 },
      { id: '4', username: 'StreamFan', message: 'Love this stream!', timestamp: Date.now() - 90000, type: 'like' },
      { id: '5', username: 'NewViewer', message: 'How do you play this?', timestamp: Date.now() - 120000, type: 'chat' }
    ]
    setRecentActivity(activities)

    // Simulate viewer history for chart
    const history = Array.from({ length: 20 }, (_, i) => 
      Math.max(0, streamStats.viewers + Math.floor(Math.random() * 40) - 20)
    )
    setViewerHistory(history)
  }, [streamStats.viewers])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follow': return <Users className="w-4 h-4 text-blue-400" />
      case 'gift': return <Gift className="w-4 h-4 text-yellow-400" />
      case 'like': return <Heart className="w-4 h-4 text-red-400" />
      default: return <MessageCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityMessage = (activity: ChatMessage) => {
    switch (activity.type) {
      case 'follow': return 'started following'
      case 'gift': return `gifted ${activity.amount} coins`
      case 'like': return 'liked the stream'
      default: return activity.message
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Stream Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{streamStats.viewers}</div>
            <div className="text-xs text-muted-foreground">Current Viewers</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{streamStats.peakViewers}</div>
            <div className="text-xs text-muted-foreground">Peak Viewers</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-400">{streamStats.likes}</div>
            <div className="text-xs text-muted-foreground">Likes</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{streamStats.chatMessages}</div>
            <div className="text-xs text-muted-foreground">Chat Messages</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{streamStats.giftsReceived}</div>
            <div className="text-xs text-muted-foreground">Gifts Received</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-cyan-400">{formatDuration(streamStats.streamDuration)}</div>
            <div className="text-xs text-muted-foreground">Stream Duration</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stream Controls */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-red-500" />
                  <span>Live Stream Controls</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stream Info */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{streamSettings.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Badge variant="outline">{streamSettings.category}</Badge>
                  <span>•</span>
                  <span>{streamSettings.maturityRating}</span>
                  <span>•</span>
                  <span>{streamSettings.isPublic ? 'Public' : 'Private'}</span>
                </div>
                {streamSettings.tags && streamSettings.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {streamSettings.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center space-x-2"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </Button>

                <Button
                  variant={isCameraOn ? "outline" : "destructive"}
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className="flex items-center space-x-2"
                >
                  {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  <span>{isCameraOn ? 'Camera On' : 'Camera Off'}</span>
                </Button>

                <Button variant="outline" className="flex items-center space-x-2">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </Button>

                <Button variant="outline" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              </div>

              {/* End Stream Button */}
              <div className="pt-4 border-t border-slate-700/50">
                <Button
                  onClick={onEndStream}
                  variant="destructive"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>End Stream</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Viewer Analytics */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Viewer Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple viewer chart visualization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Viewer Trend</span>
                  <span className="text-green-400">+{Math.floor(Math.random() * 20)}% from last stream</span>
                </div>
                
                <div className="h-32 flex items-end space-x-1">
                  {viewerHistory.map((viewers, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-400/50 rounded-t-sm"
                      style={{ height: `${(viewers / Math.max(...viewerHistory)) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-blue-400">{Math.floor(streamStats.viewers * 0.7)}</div>
                    <div className="text-muted-foreground">Avg Viewers</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-400">{streamStats.peakViewers}</div>
                    <div className="text-muted-foreground">Peak Today</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-400">{Math.floor(streamStats.viewers * 1.2)}</div>
                    <div className="text-muted-foreground">Unique Views</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg bg-slate-800/30">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 text-sm">
                          <span className="font-semibold text-blue-400">{activity.username}</span>
                          <span className="text-muted-foreground">{getActivityMessage(activity)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Session Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Followers</span>
                  <span className="font-bold text-blue-400">+{Math.floor(streamStats.viewers * 0.1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="font-bold text-green-400">{Math.floor(Math.random() * 20 + 60)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Earnings</span>
                  <span className="font-bold text-yellow-400">${(streamStats.giftsReceived * 0.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stream Quality</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Excellent</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tips */}
          {streamerId && (
            <RecentTips 
              streamerId={streamerId} 
              showStats={false} 
              limit={5} 
            />
          )}

          {/* Export Options */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download Highlights
              </Button>
              <Button variant="outline" className="w-full text-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

