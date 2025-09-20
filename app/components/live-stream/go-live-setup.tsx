

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
import { Progress } from '@/components/ui/progress'
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
  Swords,
  Zap,
  Star,
  Sparkles,
  Rocket,
  Crown,
  Shield,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Radio
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
  onGoLive: () => void
  isLive: boolean
}

const CATEGORIES = [
  { 
    value: 'block-hunting', 
    label: 'Block Hunting', 
    icon: Target, 
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    description: 'Hunt for rare blocks and showcase your strategies'
  },
  { 
    value: 'pvp-battle', 
    label: 'PvP Battles', 
    icon: Swords, 
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    description: 'Epic battles and competitive gameplay'
  },
  { 
    value: 'strategy', 
    label: 'Strategy & Tips', 
    icon: Trophy, 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    description: 'Share pro tips and advanced strategies'
  },
  { 
    value: 'tutorial', 
    label: 'Beginner Guide', 
    icon: Star, 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    description: 'Help newcomers learn the ropes'
  },
  { 
    value: 'high-stakes', 
    label: 'High Stakes', 
    icon: Crown, 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    description: 'Big money plays and whale watching'
  },
  { 
    value: 'casual', 
    label: 'Casual Gaming', 
    icon: Gamepad2, 
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    description: 'Relaxed gaming and community fun'
  }
]

const MATURITY_RATINGS = [
  { value: 'everyone', label: 'Everyone', desc: 'Suitable for all ages' },
  { value: 'teen', label: 'Teen', desc: '13+ years old' },
  { value: 'mature', label: 'Mature', desc: '18+ years old' }
]

const SUGGESTED_TAGS = [
  { label: 'beginner-friendly', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'pro-tips', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'live-battles', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { label: 'block-farming', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'high-stakes', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'community', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { label: 'educational', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { label: 'competitive', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { label: 'whale-hunting', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { label: 'giveaways', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
]

const STREAM_TEMPLATES = [
  {
    title: "🔥 Epic Block Hunt - Going for Record!",
    category: "block-hunting",
    tags: ["pro-tips", "live-battles", "high-stakes"]
  },
  {
    title: "⚔️ PvP Championship Battles - Live Commentary",
    category: "pvp-battle", 
    tags: ["competitive", "live-battles", "pro-tips"]
  },
  {
    title: "💰 Whale Tracking & Big Money Moves",
    category: "high-stakes",
    tags: ["whale-hunting", "high-stakes", "pro-tips"]
  },
  {
    title: "🎓 Newbie Bootcamp - Learn Block Wars Basics",
    category: "tutorial",
    tags: ["beginner-friendly", "educational", "community"]
  }
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
  const [currentStep, setCurrentStep] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

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

  const applyTemplate = (templateIndex: number) => {
    const template = STREAM_TEMPLATES[templateIndex]
    setStreamSettings({
      ...streamSettings,
      title: template.title,
      category: template.category,
      tags: template.tags
    })
    setSelectedTemplate(templateIndex)
    setCurrentStep(2)
  }

  const getSetupProgress = () => {
    let progress = 0
    if (streamSettings.title.trim()) progress += 25
    if (streamSettings.category) progress += 25
    if (streamSettings.description.trim()) progress += 25
    if (streamSettings.tags && streamSettings.tags.length > 0) progress += 25
    return progress
  }

  const isSetupValid = streamSettings.title.trim() && streamSettings.category
  const setupProgress = getSetupProgress()

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 border-purple-500/30 glow-purple">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Stream Setup Wizard
                  </h2>
                  <p className="text-muted-foreground">Create your perfect Block Wars live stream</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{setupProgress}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={setupProgress} className="h-3 bg-slate-800" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Basic Info</span>
                <span>Category & Tags</span>
                <span>Description</span>
                <span>Ready to Go Live!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Templates */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-blue-400" />
            <span>Quick Start Templates</span>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Popular</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STREAM_TEMPLATES.map((template, index) => (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105 border-2",
                  selectedTemplate === index
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 glow-purple"
                    : "bg-slate-800/50 border-slate-700/30 hover:border-purple-500/30"
                )}
                onClick={() => applyTemplate(index)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{template.title}</h4>
                    {selectedTemplate === index && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const category = CATEGORIES.find(c => c.value === template.category)
                      return category ? (
                        <>
                          <category.icon className={`w-3 h-3 ${category.color}`} />
                          <span className="text-xs text-muted-foreground">{category.label}</span>
                        </>
                      ) : null
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Stream Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stream Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold flex items-center space-x-2">
                  <span>Stream Title</span>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </Label>
                <Input
                  id="title"
                  placeholder="🔥 Your Epic Stream Title Here..."
                  value={streamSettings.title}
                  onChange={(e) => updateSettings('title', e.target.value)}
                  maxLength={100}
                  className="bg-slate-800/50 border-slate-700/50 text-lg font-medium h-12"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Make it exciting! Use emojis and action words 🚀
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {streamSettings.title.length}/100
                  </span>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <span>Stream Category</span>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CATEGORIES.map((category) => (
                    <Card
                      key={category.value}
                      className={cn(
                        "cursor-pointer transition-all border-2",
                        streamSettings.category === category.value
                          ? `${category.bgColor} ${category.borderColor} glow-hover`
                          : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                      )}
                      onClick={() => updateSettings('category', category.value)}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <div className={cn("w-8 h-8 mx-auto", category.color)}>
                          <category.icon className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-sm">{category.label}</h4>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold">
                  Stream Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell your viewers what epic content they can expect! What strategies will you share? What battles will you fight? 🎮"
                  value={streamSettings.description}
                  onChange={(e) => updateSettings('description', e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="bg-slate-800/50 border-slate-700/50"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Optional: Boost discoverability with a good description
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {streamSettings.description.length}/500
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Stream Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <Badge
                      key={tag.label}
                      variant={streamSettings.tags?.includes(tag.label) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105 text-sm py-1 px-3",
                        streamSettings.tags?.includes(tag.label) 
                          ? tag.color
                          : "hover:bg-slate-700/50"
                      )}
                      onClick={() => handleTagToggle(tag.label)}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select tags that best describe your stream content
                </p>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="pt-4 border-t border-slate-700/50">
                <Button
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-white"
                >
                  {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span>Advanced Settings</span>
                </Button>

                {showAdvanced && (
                  <div className="mt-4 space-y-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    {/* Stream Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Eye className="w-4 h-4 text-green-400" />
                          <div>
                            <Label>Public Stream</Label>
                            <p className="text-sm text-muted-foreground">
                              Anyone can discover and watch your stream
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={streamSettings.isPublic}
                          onCheckedChange={(checked) => updateSettings('isPublic', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-blue-400" />
                          <div>
                            <Label>Enable Chat</Label>
                            <p className="text-sm text-muted-foreground">
                              Let viewers interact with you via chat
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={streamSettings.allowChat}
                          onCheckedChange={(checked) => updateSettings('allowChat', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Gift className="w-4 h-4 text-purple-400" />
                          <div>
                            <Label>Accept Gifts</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow viewers to send virtual gifts and support
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={streamSettings.allowGifts}
                          onCheckedChange={(checked) => updateSettings('allowGifts', checked)}
                        />
                      </div>
                    </div>

                    {/* Maturity Rating */}
                    <div className="space-y-2">
                      <Label>Content Rating</Label>
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Setup */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Streaming Setup</span>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Easy</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Device Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Choose Your Device</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={selectedDevice === 'desktop' ? "default" : "outline"}
                    onClick={() => setSelectedDevice('desktop')}
                    className="h-20 flex flex-col items-center space-y-2 text-center"
                  >
                    <Monitor className="w-8 h-8" />
                    <div>
                      <div className="font-semibold">Desktop/PC</div>
                      <div className="text-xs text-muted-foreground">OBS, Streamlabs</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedDevice === 'mobile' ? "default" : "outline"}
                    onClick={() => setSelectedDevice('mobile')}
                    className="h-20 flex flex-col items-center space-y-2 text-center"
                  >
                    <Smartphone className="w-8 h-8" />
                    <div>
                      <div className="font-semibold">Mobile</div>
                      <div className="text-xs text-muted-foreground">Quick & Easy</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Your Stream Key</Label>
                <div className="relative">
                  <Input
                    value={streamKey}
                    readOnly
                    className="bg-slate-800/50 border-slate-700/50 font-mono text-sm pr-20"
                  />
                  <Button
                    onClick={copyStreamKey}
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8"
                  >
                    {copiedKey ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  🔐 Keep this private! Use in your streaming software
                </p>
              </div>

              {/* Server URL */}
              <div className="space-y-2">
                <Label>RTMP Server</Label>
                <Input
                  value="rtmp://stream.blockwars.com/live"
                  readOnly
                  className="bg-slate-800/50 border-slate-700/50 font-mono text-sm"
                />
              </div>

              {/* Quick Instructions */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-blue-400">Quick Setup Guide</h5>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-xs text-green-400 font-bold">1</div>
                        <span>Copy your stream key above</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-xs text-green-400 font-bold">2</div>
                        <span>Open streaming app (OBS, Streamlabs, or mobile app)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-xs text-green-400 font-bold">3</div>
                        <span>Paste server URL and stream key</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-xs text-green-400 font-bold">4</div>
                        <span>Test your audio/video, then hit "Go Live"!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Go Live Sidebar */}
        <div className="space-y-6">
          {/* Stream Preview */}
          <VideoFeed 
            isStreamer={true}
            showControls={true}
            className="bg-slate-900/80 border-slate-700/50"
          />

          {/* Stream Info Preview */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Stream Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="font-bold text-lg line-clamp-2">
                {streamSettings.title || '🎮 Your Amazing Stream Title'}
              </h4>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                {streamSettings.category && (() => {
                  const category = CATEGORIES.find(c => c.value === streamSettings.category)
                  return category ? (
                    <Badge className={cn("text-xs", category.bgColor, category.color, category.borderColor)}>
                      <category.icon className="w-3 h-3 mr-1" />
                      {category.label}
                    </Badge>
                  ) : null
                })()}
                <Badge variant="outline" className="text-xs capitalize">
                  {streamSettings.maturityRating || 'everyone'}
                </Badge>
              </div>
              {streamSettings.tags && streamSettings.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {streamSettings.tags.slice(0, 3).map((tag) => {
                    const tagObj = SUGGESTED_TAGS.find(t => t.label === tag)
                    return (
                      <Badge key={tag} className={cn("text-xs", tagObj?.color || "bg-slate-700/50")}>
                        {tag}
                      </Badge>
                    )
                  })}
                  {streamSettings.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{streamSettings.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Go Live Action Card */}
          <Card className={cn(
            "border-2",
            isSetupValid 
              ? "bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 border-green-500/30 glow-green"
              : "bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-600/30"
          )}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                {isSetupValid ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Ready to Launch! 🚀
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your stream setup looks amazing! Time to go live and dominate Block Wars!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Almost Ready!</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete your stream title and category to go live
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={onGoLive}
                disabled={!isSetupValid || isLive}
                size="lg"
                className={cn(
                  "w-full font-bold py-4 h-14 text-lg",
                  isSetupValid
                    ? "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white"
                    : "bg-gray-600 text-gray-400"
                )}
              >
                {isLive ? (
                  <>
                    <Radio className="w-6 h-6 mr-2 animate-pulse" />
                    Currently Live
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Go Live Now!
                  </>
                )}
              </Button>

              {/* Stream Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                <div className="text-center space-y-1">
                  <Users className="w-5 h-5 text-blue-400 mx-auto" />
                  <span className="text-xs font-medium">Live Audience</span>
                </div>
                <div className="text-center space-y-1">
                  <Heart className="w-5 h-5 text-red-400 mx-auto" />
                  <span className="text-xs font-medium">Fan Interaction</span>
                </div>
                <div className="text-center space-y-1">
                  <Gift className="w-5 h-5 text-purple-400 mx-auto" />
                  <span className="text-xs font-medium">Virtual Gifts</span>
                </div>
                <div className="text-center space-y-1">
                  <Crown className="w-5 h-5 text-yellow-400 mx-auto" />
                  <span className="text-xs font-medium">Build Fame</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

