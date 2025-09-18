
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart,
  UserPlus,
  Gift,
  Share,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Star,
  ThumbsUp
} from 'lucide-react'

interface StreamControlsProps {
  isFollowing: boolean
  isLiked: boolean
  onFollow: () => void
  onLike: () => void
  onGift: () => void
  onShare: () => void
  viewerCount: number
  likes: number
}

export function StreamControls({
  isFollowing,
  isLiked,
  onFollow,
  onLike,
  onGift,
  onShare,
  viewerCount,
  likes
}: StreamControlsProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Social actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={onLike}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-400' : ''}`} />
              <span>{likes.toLocaleString()}</span>
            </Button>

            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={onFollow}
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onGift}
              className="flex items-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>Gift</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {/* Center - Stream stats */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              {viewerCount.toLocaleString()} viewers
            </div>
          </div>

          {/* Right side - Player controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
