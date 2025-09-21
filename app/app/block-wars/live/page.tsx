
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play,
  Heart,
  MessageCircle,
  Users,
  Crown,
  Star,
  Radio,
  Eye,
  ThumbsUp,
  UserPlus,
  Gift,
  Zap,
  Trophy,
  Gamepad2
} from 'lucide-react'
import { StreamerProfile } from '@/components/live-stream/streamer-profile'
import { LiveChat } from '@/components/live-stream/live-chat'
import { StreamControls } from '@/components/live-stream/stream-controls'
import { ViewersList } from '@/components/live-stream/viewers-list'
import { VideoFeed } from '@/components/live-stream/video-feed'
import { StreamManager } from '@/components/live-stream/stream-manager'
import { cn } from '@/lib/utils'

interface Streamer {
  id: string
  name: string
  username: string
  avatar: string
  followers: number
  isLive: boolean
  streamTitle: string
  gameLevel: number
  totalBlocks: number
  monthlyEarnings: number
  rank: number
  badges: string[]
  isVerified: boolean
  viewerCount: number
  likes: number
  startTime: number
  category: string
}

interface LiveStream {
  id: string
  streamerId: string
  title: string
  category: string
  viewers: number
  likes: number
  isLive: boolean
  startTime: number
  thumbnail: string
}

export default function BlockWarsLivePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  
  const [activeStreamers, setActiveStreamers] = useState<Streamer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live streams from the API
  const fetchLiveStreams = async () => {
    try {
      const response = await fetch('/api/stream/live-streams')
      const data = await response.json()
      
      if (data.streams && data.streams.length > 0) {
        // Convert API streams to Streamer format
        const liveStreamers = data.streams.map((stream: any, index: number) => ({
          id: stream.streamerId,
          name: stream.name,
          username: stream.username,
          avatar: stream.avatar,
          followers: stream.followers || Math.floor(Math.random() * 10000) + 1000,
          isLive: true,
          streamTitle: stream.streamTitle,
          gameLevel: stream.gameLevel || Math.floor(Math.random() * 50) + 1,
          totalBlocks: stream.totalBlocks || Math.floor(Math.random() * 200) + 50,
          monthlyEarnings: Math.floor(Math.random() * 50000) + 10000,
          rank: stream.rank || Math.floor(Math.random() * 100) + 1,
          badges: ['🎮 Live Streamer', '⚡ Real-time'],
          isVerified: stream.isVerified || false,
          viewerCount: Math.floor(Math.random() * 1000) + 10,
          likes: Math.floor(Math.random() * 500) + 5,
          startTime: stream.startTime,
          category: stream.category || 'Gaming'
        }))
        
        setActiveStreamers(liveStreamers)
      } else {
        // Fallback to demo streamers if no live streams
        setActiveStreamers([
          {
            id: 'demo_1',
            name: 'Demo Streamer',
            username: '@demo_user',
            avatar: '🎮',
            followers: 5420,
            isLive: true,
            streamTitle: '🎬 Demo Stream - Join the Fun!',
            gameLevel: 25,
            totalBlocks: 76,
            monthlyEarnings: 15000,
            rank: 15,
            badges: ['🎬 Demo', '👋 Welcome'],
            isVerified: false,
            viewerCount: 127,
            likes: 89,
            startTime: Date.now() - (30 * 60 * 1000), // 30 minutes ago
            category: 'Demo'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching live streams:', error)
      // Fallback to demo data on error
      setActiveStreamers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch streams on component mount and set up polling
  useEffect(() => {
    fetchLiveStreams()
    
    // Poll for new streams every 10 seconds
    const interval = setInterval(fetchLiveStreams, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null)
  const [followedStreamers, setFollowedStreamers] = useState<string[]>([])
  const [likedStreams, setLikedStreams] = useState<string[]>([])

  // Update selected streamer when activeStreamers changes
  useEffect(() => {
    if (activeStreamers.length > 0 && !selectedStreamer) {
      setSelectedStreamer(activeStreamers[0])
    }
  }, [activeStreamers, selectedStreamer])

  const handleFollow = (streamerId: string) => {
    setFollowedStreamers(prev => 
      prev.includes(streamerId)
        ? prev.filter(id => id !== streamerId)
        : [...prev, streamerId]
    )
  }

  const handleLike = (streamerId: string) => {
    setLikedStreams(prev => 
      prev.includes(streamerId)
        ? prev.filter(id => id !== streamerId)
        : [...prev, streamerId]
    )
  }

  const getStreamDuration = (startTime: number) => {
    const duration = Date.now() - startTime
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'block hunting': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'strategy': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'pvp battle': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'tutorial': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tech-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-xl font-bold text-white">Loading Live Streams...</h3>
          <p className="text-muted-foreground">Finding active Block Wars players</p>
        </div>
      </div>
    )
  }

  if (activeStreamers.length === 0) {
    return (
      <div className="min-h-screen bg-tech-gradient p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30 glow-red">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center glow-hover flex-shrink-0">
                    <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent truncate">
                      Block Wars Live
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">No active streams right now</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/block-wars/go-live')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </Button>
              </div>
            </CardHeader>
          </Card>
          
          {/* No streams message */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto">
                <Radio className="w-12 h-12 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">No Live Streams</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No Block Wars players are currently streaming. Be the first to go live and showcase your epic gameplay!
                </p>
              </div>
              <Button
                onClick={() => router.push('/block-wars/go-live')}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3"
              >
                <Radio className="w-5 h-5 mr-2" />
                Start Your Stream
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!selectedStreamer) {
    return null
  }

  return (
    <div className="min-h-screen bg-tech-gradient p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile optimized */}
        <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30 glow-red">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center glow-hover flex-shrink-0">
                  <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent truncate">
                    Block Wars Live
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">Watch top players battle for legendary blocks</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-400">{activeStreamers.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Live Streamers</div>
                </div>
                <Button
                  onClick={() => router.push('/block-wars/go-live')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4 lg:space-y-6">
          {/* Mobile: Show active streamers list at top */}
          <div className="lg:hidden">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Live Streamers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {activeStreamers.map((streamer) => (
                    <div
                      key={streamer.id}
                      onClick={() => setSelectedStreamer(streamer)}
                      className={cn(
                        "flex-shrink-0 w-16 text-center cursor-pointer transition-all duration-200",
                        selectedStreamer.id === streamer.id ? "opacity-100" : "opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="relative mb-2">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 transition-colors",
                          selectedStreamer.id === streamer.id 
                            ? "border-blue-500 bg-blue-500/20" 
                            : "border-slate-600 bg-slate-800"
                        )}>
                          {streamer.avatar}
                        </div>
                        {streamer.isLive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-xs font-medium truncate">{streamer.name}</div>
                      <div className="text-xs text-muted-foreground">{streamer.viewerCount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Main Stream View */}
            <div className="lg:col-span-3 space-y-4">
              {/* Selected Stream */}
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 overflow-hidden">
                <CardContent className="p-0">
                  {/* Real Video Stream with Overlay Info */}
                  <div className="relative">
                    {/* Live Video Feed Component */}
                    <div className="relative">
                      <StreamManager 
                        isStreamer={false}
                        streamerId={selectedStreamer.id}
                        className="border-0"
                      />
                      
                      {/* Gaming overlay effects on top of video */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Gaming UI elements overlay */}
                        <div className="absolute top-4 right-4 space-y-2">
                          <div className="bg-green-500/80 text-white text-xs px-2 py-1 rounded font-bold">
                            +350 XP
                          </div>
                        </div>
                        
                        <div className="absolute bottom-20 left-4 space-y-1">
                          <div className="bg-yellow-500/80 text-black text-xs px-2 py-1 rounded font-bold">
                            Block Found! 💰
                          </div>
                        </div>

                        {/* Health/Energy bars simulation */}
                        <div className="absolute top-6 left-6 space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-700/80 rounded-full overflow-hidden backdrop-blur-sm">
                              <div className="w-3/4 h-full bg-red-500 animate-pulse"></div>
                            </div>
                            <span className="text-xs text-white font-bold drop-shadow-lg">HP</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-700/80 rounded-full overflow-hidden backdrop-blur-sm">
                              <div className="w-5/6 h-full bg-blue-500"></div>
                            </div>
                            <span className="text-xs text-white font-bold drop-shadow-lg">MP</span>
                          </div>
                        </div>

                        {/* Live gameplay status */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                            <div className="text-green-400 font-bold text-sm mb-1">🎮 LIVE GAMEPLAY</div>
                            <div className="flex space-x-3 text-xs">
                              <div>
                                <span className="text-yellow-400">Blocks: </span>
                                <span className="text-white font-bold">{selectedStreamer.totalBlocks}</span>
                              </div>
                              <div>
                                <span className="text-blue-400">Level: </span>
                                <span className="text-white font-bold">{selectedStreamer.gameLevel}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Video quality indicator */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs font-medium">HD 1080p</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stream Info Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      {/* Left side - Stream stats */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1 flex items-center space-x-1 sm:space-x-2">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          <span className="text-white font-medium text-xs sm:text-sm">{selectedStreamer.viewerCount.toLocaleString()}</span>
                        </div>
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1 flex items-center space-x-1 sm:space-x-2">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          <span className="text-white font-medium text-xs sm:text-sm">{selectedStreamer.likes.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Right side - Live indicator */}
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-400 font-bold text-xs sm:text-sm">LIVE</span>
                        <span className="text-gray-300 text-xs sm:text-sm">•</span>
                        <span className="text-gray-300 text-xs sm:text-sm">{getStreamDuration(selectedStreamer.startTime)}</span>
                      </div>
                    </div>
                    
                    {/* Bottom overlay - Stream info */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl sm:text-4xl">{selectedStreamer.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{selectedStreamer.name}</h2>
                            <p className="text-sm text-gray-300 line-clamp-1">{selectedStreamer.streamTitle}</p>
                            <Badge className={cn("text-xs mt-1", getCategoryColor(selectedStreamer.category))}>
                              {selectedStreamer.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stream Controls - Mobile optimized */}
                  <div className="p-3 sm:p-4 bg-slate-900/50 border-t border-slate-700/50 space-y-3">
                    {/* Action buttons */}
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        variant={likedStreams.includes(selectedStreamer.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLike(selectedStreamer.id)}
                        className="flex items-center space-x-2 min-w-[80px] h-10"
                      >
                        <Heart className={cn("w-4 h-4", likedStreams.includes(selectedStreamer.id) && "fill-current")} />
                        <span className="text-sm">Like</span>
                      </Button>
                      
                      <Button
                        variant={followedStreamers.includes(selectedStreamer.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFollow(selectedStreamer.id)}
                        className="flex items-center space-x-2 min-w-[90px] h-10"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-sm">{followedStreamers.includes(selectedStreamer.id) ? 'Following' : 'Follow'}</span>
                      </Button>

                      <Button variant="outline" size="sm" className="flex items-center space-x-2 min-w-[70px] h-10">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm">Gift</span>
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span>Rank #{selectedStreamer.rank}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>Level {selectedStreamer.gameLevel}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Streamer Profile Card */}
              <StreamerProfile 
                streamer={selectedStreamer}
                isFollowing={followedStreamers.includes(selectedStreamer.id)}
                onFollow={() => handleFollow(selectedStreamer.id)}
              />
            </div>

            {/* Sidebar - Desktop only, Mobile content moved to top */}
            <div className="hidden lg:block space-y-4">
              {/* Live Chat */}
              <LiveChat streamerId={selectedStreamer.id} />

              {/* Active Streamers List - Desktop */}
              <Card className="bg-slate-900/80 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Live Streamers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {activeStreamers.map((streamer) => (
                        <div
                          key={streamer.id}
                          onClick={() => setSelectedStreamer(streamer)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all duration-200 border touch-manipulation",
                            selectedStreamer.id === streamer.id
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
                              : "bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-xl">
                                {streamer.avatar}
                              </div>
                              {streamer.isLive && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1">
                                <h4 className="font-semibold text-sm truncate">{streamer.name}</h4>
                                {streamer.isVerified && (
                                  <Star className="w-3 h-3 text-blue-400 fill-current flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {streamer.streamTitle}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Eye className="w-3 h-3" />
                                  <span>{streamer.viewerCount.toLocaleString()}</span>
                                </div>
                                <Badge className={cn("text-xs", getCategoryColor(streamer.category))}>
                                  {streamer.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Viewers List */}
              <ViewersList streamerId={selectedStreamer.id} />
            </div>
          </div>

          {/* Mobile: Live Chat at bottom */}
          <div className="lg:hidden">
            <LiveChat streamerId={selectedStreamer.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
