
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { VideoPlayer } from '@/components/dash-tv/video-player'
import { CommentsSection } from '@/components/dash-tv/comments-section'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params?.id as string
  
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (videoId) {
      loadVideo()
    }
  }, [videoId])

  const loadVideo = async () => {
    try {
      const response = await fetch(`/api/dash-tv/videos/${videoId}`)
      if (response.ok) {
        const data = await response.json()
        setVideo(data)
      } else {
        router.push('/dash-tv')
      }
    } catch (error) {
      console.error('Error loading video:', error)
      router.push('/dash-tv')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tech-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 border-2 border-blue-500 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tech-gradient p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {/* Video Player */}
        <VideoPlayer videoId={videoId} video={video} />

        {/* Comments Section */}
        <CommentsSection videoId={videoId} />
      </div>
    </div>
  )
}
