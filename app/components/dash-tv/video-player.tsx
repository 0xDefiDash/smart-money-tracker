
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  ThumbsUp,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface VideoPlayerProps {
  videoId: string
  video: any
}

export function VideoPlayer({ videoId, video }: VideoPlayerProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(video?.likesCount || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkLikeStatus()
  }, [videoId])

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/dash-tv/likes?videoId=${videoId}`)
      const data = await response.json()
      setLiked(data.liked)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const handleLike = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dash-tv/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like video')
      }

      setLiked(data.liked)
      setLikes((prev: number) => data.liked ? prev + 1 : prev - 1)
      toast.success(data.liked ? 'Video liked!' : 'Like removed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to like video')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/dash-tv/video/${videoId}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card className="bg-slate-900/80 border-slate-700/50 overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video
            controls
            className="w-full h-full"
            poster={video?.thumbnailUrl}
          >
            <source src={video?.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </Card>

      {/* Video Info */}
      <Card className="bg-slate-900/80 border-slate-700/50 p-4">
        <div className="space-y-4">
          {/* Title and Category */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl font-bold">{video?.title}</h1>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {video?.category}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{video?.viewCount?.toLocaleString() || 0} views</span>
              </div>
              <span>•</span>
              <span>{new Date(video?.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likes.toLocaleString()}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {/* Streamer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
                {video?.streamer?.avatar || video?.streamer?.displayName?.[0] || '?'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold">{video?.streamer?.displayName}</p>
                  {video?.streamer?.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{video?.streamer?.username}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {video?.description && (
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {video?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
