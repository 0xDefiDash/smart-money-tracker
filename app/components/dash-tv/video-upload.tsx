
'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  X, 
  FileVideo,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface VideoUploadProps {
  onVideoUploaded?: (video: any) => void
}

export function VideoUpload({ onVideoUploaded }: VideoUploadProps) {
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true
  })

  const categories = [
    'Crypto Trading',
    'DeFi',
    'NFTs',
    'Blockchain Gaming',
    'Web3 Development',
    'Market Analysis',
    'News & Education',
    'Meme Coins',
    'AI Tokens',
    'General Crypto'
  ]

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('Video file size must be less than 500MB')
        return
      }
      setVideoFile(file)
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail size must be less than 5MB')
        return
      }
      setThumbnailFile(file)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const uploadFile = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch('/api/dash-tv/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`)
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    if (!formData.title || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Upload video
      toast.loading('Uploading video...', { id: 'upload' })
      setUploadProgress(30)
      const videoUrl = await uploadFile(videoFile, 'video')
      
      // Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        toast.loading('Uploading thumbnail...', { id: 'upload' })
        setUploadProgress(60)
        thumbnailUrl = await uploadFile(thumbnailFile, 'image')
      }

      // Create video record
      toast.loading('Saving video details...', { id: 'upload' })
      setUploadProgress(80)
      
      const response = await fetch('/api/dash-tv/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          videoUrl,
          thumbnailUrl,
          tags
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save video')
      }

      setUploadProgress(100)
      toast.success('Video uploaded successfully!', { id: 'upload' })
      
      // Reset form
      setVideoFile(null)
      setThumbnailFile(null)
      setTags([])
      setFormData({
        title: '',
        description: '',
        category: '',
        isPublic: true
      })

      onVideoUploaded?.(data)
    } catch (error: any) {
      toast.error(error.message || 'Upload failed', { id: 'upload' })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-6 h-6 text-blue-500" />
          <span>Upload Video</span>
        </CardTitle>
        <CardDescription>
          Share your crypto project or educational content with the community
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File Upload */}
          <div className="space-y-2">
            <Label>Video File *</Label>
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              {videoFile ? (
                <div className="space-y-2">
                  <FileVideo className="w-12 h-12 text-blue-500 mx-auto" />
                  <p className="text-sm font-medium">{videoFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideoFile(null)
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">Click to select video</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM, or AVI (max 500MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Thumbnail (Optional)</Label>
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
              {thumbnailFile ? (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 text-blue-500 mx-auto" />
                  <p className="text-sm font-medium">{thumbnailFile.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setThumbnailFile(null)
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm">Click to add thumbnail</p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter an engaging title for your video"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-slate-800/50 border-slate-700/50"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your video content..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800/50 border-slate-700/50 min-h-[100px]"
              maxLength={1000}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="bg-slate-800/50 border-slate-700/50"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveTag(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !videoFile}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
