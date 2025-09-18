
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown,
  Star,
  Trophy,
  Target,
  DollarSign,
  UserPlus,
  Users,
  Zap,
  Shield,
  Sword
} from 'lucide-react'

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

interface StreamerProfileProps {
  streamer: Streamer
  isFollowing: boolean
  onFollow: () => void
}

export function StreamerProfile({ streamer, isFollowing, onFollow }: StreamerProfileProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                {streamer.avatar}
              </div>
              {streamer.isLive && (
                <div className="absolute -top-1 -right-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  LIVE
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">{streamer.name}</h2>
                {streamer.isVerified && (
                  <Star className="w-5 h-5 text-blue-400 fill-current" />
                )}
                {streamer.rank <= 10 && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <p className="text-muted-foreground">{streamer.username}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">{streamer.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onFollow}
            variant={isFollowing ? "outline" : "default"}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">#{streamer.rank}</span>
            </div>
            <p className="text-xs text-muted-foreground">Global Rank</p>
          </div>

          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">{streamer.gameLevel}</span>
            </div>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>

          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">{streamer.totalBlocks}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Blocks</p>
          </div>

          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xl font-bold text-green-500">${(streamer.monthlyEarnings / 1000).toFixed(0)}k</span>
            </div>
            <p className="text-xs text-muted-foreground">Monthly</p>
          </div>
        </div>

        {/* Achievements/Badges */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Achievements</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {streamer.badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stream Info */}
        <div>
          <h4 className="font-semibold mb-2">Current Stream</h4>
          <p className="text-muted-foreground text-sm">{streamer.streamTitle}</p>
          <div className="flex items-center justify-between mt-2 text-sm">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {streamer.category}
            </Badge>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span>{streamer.viewerCount.toLocaleString()} viewers</span>
              <span>{streamer.likes.toLocaleString()} likes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
