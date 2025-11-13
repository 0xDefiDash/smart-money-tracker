
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Video,
  Play,
  Upload,
  User,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Settings,
  Radio,
  CheckCircle
} from 'lucide-react'
import { ProfileSetup } from '@/components/dash-tv/profile-setup'
import { VideoUpload } from '@/components/dash-tv/video-upload'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function DashTVPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    if (status === 'authenticated') {
      loadProfile()
      loadVideos()
    }
  }, [status])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/dash-tv/profile?userId=${(session as any)?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/dash-tv/videos?limit=12')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-tech-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading Dash TV...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-tech-gradient flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-6 text-center space-y-4">
            <Video className="w-12 h-12 text-blue-500 mx-auto" />
            <h2 className="text-xl font-bold">Welcome to Dash TV</h2>
            <p className="text-muted-foreground">
              Please sign in to start broadcasting your crypto projects and engage with the community
            </p>
            <Button onClick={() => router.push('/auth/signin')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no profile, show profile setup
  if (!profile) {
    return (
      <div className="min-h-screen bg-tech-gradient p-4">
        <div className="max-w-4xl mx-auto space-y-6 py-8">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to Dash TV
            </h1>
            <p className="text-muted-foreground">
              Create your broadcaster profile to start sharing your crypto projects with the world
            </p>
          </div>
          
          <ProfileSetup onProfileCreated={(newProfile) => {
            setProfile(newProfile)
            toast.success('Profile created! You can now start broadcasting.')
          }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tech-gradient p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Dash TV
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Broadcast your crypto projects to the world
                  </p>
                </div>
              </div>

              <Button
                onClick={() => router.push('/dash-tv')}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                <Radio className="w-4 h-4 mr-2" />
                Go Live Now
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Summary */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                  {profile.avatar || profile.displayName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold">{profile.displayName}</h3>
                    {profile.isVerified && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span><strong>{profile.followersCount}</strong> followers</span>
                    <span><strong>{profile.totalStreams}</strong> streams</span>
                    <span><strong>{profile.totalViews}</strong> views</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={() => setActiveTab('profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/80 border-slate-700/50">
            <TabsTrigger value="browse">Browse Videos</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="bg-slate-900/80 border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
                  onClick={() => router.push(`/dash-tv/video/${video.id}`)}
                >
                  <div className="relative aspect-video bg-slate-800">
                    {video.thumbnailUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {video.category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{video.viewCount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{video._count?.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{video._count?.comments || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-700/50">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs">
                        {video.streamer?.avatar || video.streamer?.displayName[0]}
                      </div>
                      <span className="text-sm font-medium">{video.streamer?.displayName}</span>
                      {video.streamer?.isVerified && (
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {videos.length === 0 && (
              <Card className="bg-slate-900/80 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to upload a video!</p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <VideoUpload onVideoUploaded={(video) => {
              loadVideos()
              toast.success('Video uploaded successfully!')
              setActiveTab('browse')
            }} />
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Profile editing coming soon!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  For now, use the API to update your profile
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
