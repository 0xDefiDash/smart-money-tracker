
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Video,
  Play,
  Camera,
  Mic,
  Settings,
  CheckCircle,
  AlertCircle,
  Radio,
  Eye,
  Users,
  Zap,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VideoFeed } from './video-feed'

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

interface GoLiveSetupProps {
  streamSettings: StreamSettings
  setStreamSettings: (settings: StreamSettings) => void
  streamKey: string
  streamerId?: string
  onGoLive: () => void
  isLive: boolean
}

export function GoLiveSetup({
  streamSettings,
  setStreamSettings,
  streamKey,
  streamerId = '',
  onGoLive,
  isLive
}: GoLiveSetupProps) {
  const [currentTag, setCurrentTag] = useState('')
  const [previewMode, setPreviewMode] = useState(true)
  const [localStreamerId, setLocalStreamerId] = useState('')

  // Generate streamer ID for this session if not provided
  useEffect(() => {
    if (!streamerId) {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setLocalStreamerId(id)
    } else {
      setLocalStreamerId(streamerId)
    }
  }, [streamerId])

  const addTag = () => {
    if (currentTag.trim() && !streamSettings.tags.includes(currentTag.trim())) {
      setStreamSettings({
        ...streamSettings,
        tags: [...streamSettings.tags, currentTag.trim()]
      })
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setStreamSettings({
      ...streamSettings,
      tags: streamSettings.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const categories = [
    'Block Hunting',
    'PvP Battle',
    'Strategy',
    'Tutorial',
    'Casual Play',
    'Speedrun',
    'Community Event',
    'Q&A Session'
  ]

  const maturityRatings = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'teen', label: 'Teen (13+)' },
    { value: 'mature', label: 'Mature (17+)' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stream Setup Form */}
      <div className="space-y-6">
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Stream Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stream Title */}
            <div className="space-y-2">
              <Label htmlFor="stream-title">Stream Title *</Label>
              <Input
                id="stream-title"
                placeholder="Enter an engaging title for your stream..."
                value={streamSettings.title}
                onChange={(e) => setStreamSettings({ ...streamSettings, title: e.target.value })}
                className="bg-slate-800/50 border-slate-700"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {streamSettings.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell viewers what you'll be doing in this stream..."
                value={streamSettings.description}
                onChange={(e) => setStreamSettings({ ...streamSettings, description: e.target.value })}
                className="bg-slate-800/50 border-slate-700 resize-none h-24"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {streamSettings.description.length}/500 characters
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={streamSettings.category} 
                onValueChange={(value) => setStreamSettings({ ...streamSettings, category: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add tags..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-slate-800/50 border-slate-700 flex-1"
                  maxLength={20}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  disabled={!currentTag.trim() || streamSettings.tags.length >= 5}
                >
                  Add
                </Button>
              </div>
              {streamSettings.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {streamSettings.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-red-500/20"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {streamSettings.tags.length}/5 tags • Click tags to remove
              </p>
            </div>

            {/* Maturity Rating */}
            <div className="space-y-2">
              <Label>Maturity Rating</Label>
              <Select 
                value={streamSettings.maturityRating} 
                onValueChange={(value) => setStreamSettings({ ...streamSettings, maturityRating: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maturityRatings.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stream Preferences */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Stream Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-stream">Public Stream</Label>
                <p className="text-xs text-muted-foreground">Allow anyone to discover your stream</p>
              </div>
              <Switch
                id="public-stream"
                checked={streamSettings.isPublic}
                onCheckedChange={(checked) => setStreamSettings({ ...streamSettings, isPublic: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-chat">Enable Chat</Label>
                <p className="text-xs text-muted-foreground">Let viewers chat during your stream</p>
              </div>
              <Switch
                id="allow-chat"
                checked={streamSettings.allowChat}
                onCheckedChange={(checked) => setStreamSettings({ ...streamSettings, allowChat: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-gifts">Enable Gifts</Label>
                <p className="text-xs text-muted-foreground">Allow viewers to send virtual gifts</p>
              </div>
              <Switch
                id="allow-gifts"
                checked={streamSettings.allowGifts}
                onCheckedChange={(checked) => setStreamSettings({ ...streamSettings, allowGifts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Go Live Button */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Ready to Go Live?</h3>
                <p className="text-muted-foreground">
                  Make sure your camera and microphone are working properly
                </p>
              </div>
              
              <Button
                onClick={onGoLive}
                disabled={!streamSettings.title || !streamSettings.category || isLive}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 w-full"
              >
                {isLive ? (
                  <>
                    <Radio className="w-5 h-5 mr-2 animate-pulse" />
                    You're Live!
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Streaming
                  </>
                )}
              </Button>

              {(!streamSettings.title || !streamSettings.category) && (
                <div className="flex items-center space-x-2 text-sm text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please fill in the required fields above</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Preview */}
      <div className="space-y-6">
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>Camera Preview</span>
              </CardTitle>
              {previewMode && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  Preview Mode
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <VideoFeed 
              isStreamer={true}
              streamerId={localStreamerId}
              showControls={true}
              autoStart={false}
            />
          </CardContent>
        </Card>

        {/* Stream Key Info */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Stream Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Stream Key</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={streamKey}
                  readOnly
                  className="bg-slate-800/50 border-slate-700 text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(streamKey)}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is your unique stream identifier. Keep it secure!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Server URL</Label>
                <p className="font-mono text-xs bg-slate-800/30 p-2 rounded mt-1">
                  rtmp://stream.blockwars.io/live
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Quality</Label>
                <p className="text-blue-400 font-semibold mt-1">Auto (720p-1080p)</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-400">Ready for Broadcasting</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Your stream will be available to viewers once you go live
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
