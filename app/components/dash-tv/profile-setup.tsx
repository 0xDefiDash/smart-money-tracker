
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  AtSign, 
  FileText, 
  Image as ImageIcon, 
  Twitter, 
  MessageSquare, 
  Globe,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProfileSetupProps {
  onProfileCreated?: (profile: any) => void
}

export function ProfileSetup({ onProfileCreated }: ProfileSetupProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    avatar: '',
    twitterHandle: '',
    telegramHandle: '',
    discordHandle: '',
    websiteUrl: '',
    category: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.displayName || !formData.username || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/dash-tv/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      toast.success('Profile created successfully!')
      onProfileCreated?.(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-6 h-6 text-blue-500" />
          <span>Create Your Dash TV Profile</span>
        </CardTitle>
        <CardDescription>
          Set up your broadcaster profile to start sharing your crypto projects with the world
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Display Name *</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
              className="bg-slate-800/50 border-slate-700/50"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center space-x-2">
              <AtSign className="w-4 h-4" />
              <span>Username *</span>
            </Label>
            <Input
              id="username"
              placeholder="@yourusername"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
              required
              className="bg-slate-800/50 border-slate-700/50"
            />
            <p className="text-xs text-muted-foreground">Only letters, numbers, and underscores allowed</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Content Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                <SelectValue placeholder="Select your content category" />
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

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Bio</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell viewers about yourself and your content..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="bg-slate-800/50 border-slate-700/50 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar" className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Avatar URL</span>
            </Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="bg-slate-800/50 border-slate-700/50"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Social Links (Optional)</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center space-x-2">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </Label>
                <Input
                  id="twitter"
                  placeholder="@yourhandle"
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Telegram</span>
                </Label>
                <Input
                  id="telegram"
                  placeholder="@yourhandle"
                  value={formData.telegramHandle}
                  onChange={(e) => setFormData({ ...formData, telegramHandle: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Discord</span>
                </Label>
                <Input
                  id="discord"
                  placeholder="username#1234"
                  value={formData.discordHandle}
                  onChange={(e) => setFormData({ ...formData, discordHandle: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
