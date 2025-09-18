

'use client'

import { useState } from 'react'
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
  Camera,
  Mic,
  Monitor,
  Smartphone,
  Settings,
  Eye,
  Users,
  Heart,
  Gift,
  Copy,
  CheckCircle,
  AlertCircle,
  Play,
  Gamepad2,
  Trophy,
  Target,
  Swords
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  onGoLive: () => void
  isLive: boolean
}

const CATEGORIES = [
  { value: 'block-hunting', label: 'Block Hunting', icon: Target, color: 'text-green-400' },
  { value: 'pvp-battle', label: 'PvP Battles', icon: Swords, color: 'text-red-400' },
  { value: 'strategy', label: 'Strategy & Tips', icon: Trophy, color: 'text-blue-400' },
  { value: 'tutorial', label: 'Tutorial', icon: Users, color: 'text-purple-400' },
  { value: 'casual', label: 'Casual Gaming', icon: Gamepad2, color: 'text-orange-400' }
]

const MATURITY_RATINGS = [
  { value: 'everyone', label: 'Everyone', desc: 'Suitable for all ages' },
  { value: 'teen', label: 'Teen', desc: '13+ years old' },
  { value: 'mature', label: 'Mature', desc: '18+ years old' }
]

const SUGGESTED_TAGS = [
  'beginner-friendly', 'pro-tips', 'live-battles', 'block-farming', 
  'high-stakes', 'community', 'educational', 'competitive'
]

export function GoLiveSetup({ 
  streamSettings, 
  setStreamSettings, 
  streamKey, 
  onGoLive, 
  isLive 
}: GoLiveSetupProps) {
  const [copiedKey, setCopiedKey] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile'>('desktop')

  const copyStreamKey = async () => {
    try {
      await navigator.clipboard.writeText(streamKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } catch (err) {
      console.error('Failed to copy stream key:', err)
    }
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = streamSettings.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    setStreamSettings({ ...streamSettings, tags: newTags })
  }

  const updateSettings = (key: keyof StreamSettings, value: any) => {
    setStreamSettings({ ...streamSettings, [key]: value })
  }

  const isSetupValid = streamSettings.title.trim() && streamSettings.category

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stream Configuration */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span>Stream Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stream Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title *</Label>
              <Input
                id="title"
                placeholder="Enter an exciting title for your stream..."
                value={streamSettings.title}
                onChange={(e) => updateSettings('title', e.target.value)}
                maxLength={100}
                className="bg-slate-800/50 border-slate-700/50"
              />
              <p className="text-xs text-muted-foreground">
                {streamSettings.title.length}/100 characters
              </p>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={streamSettings.category} onValueChange={(value) => updateSettings('category', value)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <category.icon className={`w-4 h-4 ${category.color}`} />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell viewers what to expect from your stream..."
                value={streamSettings.description}
                onChange={(e) => updateSettings('description', e.target.value)}
                maxLength={500}
                rows={3}
                className="bg-slate-800/50 border-slate-700/50"
              />
              <p className="text-xs text-muted-foreground">
                {streamSettings.description.length}/500 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={streamSettings.tags?.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      streamSettings.tags?.includes(tag) 
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                        : "hover:bg-slate-700/50"
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stream Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold">Stream Settings</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Stream</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone to find and watch your stream
                    </p>
                  </div>
                  <Switch
                    checked={streamSettings.isPublic}
                    onCheckedChange={(checked) => updateSettings('isPublic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow viewers to chat during your stream
                    </p>
                  </div>
                  <Switch
                    checked={streamSettings.allowChat}
                    onCheckedChange={(checked) => updateSettings('allowChat', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Accept Gifts</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow viewers to send virtual gifts
                    </p>
                  </div>
                  <Switch
                    checked={streamSettings.allowGifts}
                    onCheckedChange={(checked) => updateSettings('allowGifts', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Maturity Rating */}
            <div className="space-y-2">
              <Label>Maturity Rating</Label>
              <Select value={streamSettings.maturityRating} onValueChange={(value) => updateSettings('maturityRating', value)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATURITY_RATINGS.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      <div>
                        <div className="font-medium">{rating.label}</div>
                        <div className="text-sm text-muted-foreground">{rating.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stream Key & Technical Setup */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Technical Setup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Selection */}
            <div className="space-y-3">
              <Label>Streaming Device</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedDevice === 'desktop' ? "default" : "outline"}
                  onClick={() => setSelectedDevice('desktop')}
                  className="h-16 flex flex-col items-center space-y-1"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs">Desktop</span>
                </Button>
                <Button
                  variant={selectedDevice === 'mobile' ? "default" : "outline"}
                  onClick={() => setSelectedDevice('mobile')}
                  className="h-16 flex flex-col items-center space-y-1"
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">Mobile</span>
                </Button>
              </div>
            </div>

            {/* Stream Key */}
            <div className="space-y-2">
              <Label>Stream Key</Label>
              <div className="flex space-x-2">
                <Input
                  value={streamKey}
                  readOnly
                  className="bg-slate-800/50 border-slate-700/50 font-mono text-sm"
                />
                <Button
                  onClick={copyStreamKey}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {copiedKey ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key in your streaming software (OBS, Streamlabs, etc.)
              </p>
            </div>

            {/* Server URLs */}
            <div className="space-y-2">
              <Label>Server URL</Label>
              <Input
                value="rtmp://stream.blockwars.com/live"
                readOnly
                className="bg-slate-800/50 border-slate-700/50 font-mono text-sm"
              />
            </div>

            {/* Quick Setup Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="space-y-2">
                  <h5 className="font-medium text-blue-400">Quick Setup Instructions</h5>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Copy your stream key above</li>
                    <li>Open your streaming software (OBS, Streamlabs, etc.)</li>
                    <li>Add the server URL and stream key</li>
                    <li>Configure your audio/video settings</li>
                    <li>Click "Go Live" below to start streaming!</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Go Live */}
      <div className="space-y-6">
        {/* Stream Preview */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mock Stream Preview */}
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center border border-slate-700/50">
              <div className="text-center space-y-2">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Stream Preview</p>
                <p className="text-xs text-muted-foreground">Connect your camera to see preview</p>
              </div>
            </div>

            {/* Stream Info Preview */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {streamSettings.title || 'Your Stream Title'}
              </h4>
              <div className="flex items-center space-x-2">
                {streamSettings.category && (
                  <Badge variant="outline" className="text-xs">
                    {CATEGORIES.find(c => c.value === streamSettings.category)?.label || streamSettings.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {streamSettings.maturityRating}
                </Badge>
              </div>
              {streamSettings.tags && streamSettings.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {streamSettings.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Go Live Button */}
        <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30">
          <CardContent className="p-6 text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready to Go Live?</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your streaming software is set up and ready
              </p>
            </div>

            <Button
              onClick={onGoLive}
              disabled={!isSetupValid || isLive}
              size="lg"
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              {isLive ? 'Currently Live' : 'Go Live'}
            </Button>

            {!isSetupValid && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please fill in title and category to continue</span>
              </div>
            )}

            {/* Feature List */}
            <div className="text-left space-y-2 pt-4 border-t border-slate-700/50">
              <h5 className="font-medium text-sm">Stream Features:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>Live Chat</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>Likes & Follows</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-3 h-3" />
                  <span>Virtual Gifts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>Game Integration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

