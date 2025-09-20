
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  
  const [activeStreamers] = useState<Streamer[]>([
    {
      id: 'streamer_1',
      name: 'CryptoKing',
      username: '@cryptoking_bw',
      avatar: '👑',
      followers: 15420,
      isLive: true,
      streamTitle: '🔥 Going for Top 10 Leaderboard! Epic Block Hunt!',
      gameLevel: 47,
      totalBlocks: 156,
      monthlyEarnings: 45000,
      rank: 3,
      badges: ['🏆 Top 10', '💎 Legendary Hunter', '🚀 Early Adopter'],
      isVerified: true,
      viewerCount: 1247,
      likes: 892,
      startTime: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      category: 'Block Hunting'
    },
    {
      id: 'streamer_2',
      name: 'BlockBeast',
      username: '@blockbeast_live',
      avatar: '🐉',
      followers: 8930,
      isLive: true,
      streamTitle: 'Secret Block Farming Strategy - 500k+ Monthly!',
      gameLevel: 32,
      totalBlocks: 89,
      monthlyEarnings: 28000,
      rank: 12,
      badges: ['🎯 Strategy Master', '💰 Money Maker'],
      isVerified: false,
      viewerCount: 634,
      likes: 445,
      startTime: Date.now() - (45 * 60 * 1000), // 45 minutes ago
      category: 'Strategy'
    },
    {
      id: 'streamer_3',
      name: 'WhaleStalker',
      username: '@whalestalker_bw',
      avatar: '🐋',
      followers: 23100,
      isLive: true,
      streamTitle: '🎮 Live PvP Battles - Stealing Legendary Blocks!',
      gameLevel: 61,
      totalBlocks: 203,
      monthlyEarnings: 72000,
      rank: 1,
      badges: ['👑 #1 Player', '⚔️ PvP Champion', '🔥 Unstoppable'],
      isVerified: true,
      viewerCount: 2156,
      likes: 1834,
      startTime: Date.now() - (3.5 * 60 * 60 * 1000), // 3.5 hours ago
      category: 'PvP Battle'
    },
    {
      id: 'streamer_4',
      name: 'DefidashQueen',
      username: '@defidash_queen',
      avatar: '👸',
      followers: 11750,
      isLive: true,
      streamTitle: 'Teaching Newbies - From Zero to Hero Guide!',
      gameLevel: 28,
      totalBlocks: 67,
      monthlyEarnings: 18500,
      rank: 25,
      badges: ['🎓 Teacher', '💎 Community Hero'],
      isVerified: true,
      viewerCount: 389,
      likes: 312,
      startTime: Date.now() - (1.2 * 60 * 60 * 1000), // 1.2 hours ago
      category: 'Tutorial'
    }
  ])

  const [selectedStreamer, setSelectedStreamer] = useState<Streamer>(activeStreamers[0])
  const [followedStreamers, setFollowedStreamers] = useState<string[]>([])
  const [likedStreams, setLikedStreams] = useState<string[]>([])

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
              <div className="text-center flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-red-400">{activeStreamers.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Live Streamers</div>
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
                      <VideoFeed 
                        isStreamer={false}
                        streamerId={selectedStreamer.id}
                        showControls={false}
                        autoStart={true}
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
