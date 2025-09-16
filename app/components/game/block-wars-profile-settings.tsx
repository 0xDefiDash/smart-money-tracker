
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  User, 
  Coins, 
  Trophy, 
  Star, 
  Settings, 
  Crown,
  Camera,
  Gamepad2,
  Bell,
  Volume2,
  Shield,
  Target
} from 'lucide-react'
import { ProfileImageUpload } from '@/components/ui/profile-image-upload'
import { ProfileImage } from '@/components/ui/profile-image'

interface GameProfile {
  id: string
  username: string
  name: string
  email: string
  profileImage?: string
  xHandle?: string
  gameMoney: number
  gameLevel: number
  gameExp: number
  isAdmin: boolean
}

interface BlockWarsProfileSettingsProps {
  onClose?: () => void
  onProfileUpdate?: (profile: GameProfile) => void
}

export function BlockWarsProfileSettings({ 
  onClose, 
  onProfileUpdate 
}: BlockWarsProfileSettingsProps) {
  const { data: session, update: updateSession } = useSession() || {}
  const [profile, setProfile] = useState<GameProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editXHandle, setEditXHandle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Game Settings
  const [gameSettings, setGameSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    autoSpawnAlerts: true,
    whaleTransactionAlerts: false,
    privateProfile: false
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditName(data.user.name || '')
        setEditXHandle(data.user.xHandle || '')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('xHandle', editXHandle)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.user)
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        onProfileUpdate?.(data.user)
        
        // Update session data
        await updateSession?.({
          ...session,
          user: { ...session?.user, ...data.user }
        })
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpdate = (imageUrl: string | null) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        profileImage: imageUrl || undefined
      }
      setProfile(updatedProfile)
      onProfileUpdate?.(updatedProfile)
      setSuccess('Profile image updated successfully!')
    }
  }

  const getPlayerRank = (level: number) => {
    if (level >= 50) return 'Legendary Block Master'
    if (level >= 30) return 'Elite Block Warrior'
    if (level >= 20) return 'Advanced Block Fighter'
    if (level >= 10) return 'Block Veteran'
    if (level >= 5) return 'Block Apprentice'
    return 'Block Rookie'
  }

  const getNextLevelProgress = (exp: number, level: number) => {
    const currentLevelExp = exp % 100
    const nextLevelExp = 100
    return (currentLevelExp / nextLevelExp) * 100
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
      <Card className="bg-slate-800/95 border-purple-500/30 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Block Wars Profile</CardTitle>
                <p className="text-sm text-slate-400">Customize your warrior identity</p>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
                ✕
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="border-3 border-purple-500/50 rounded-full p-1 bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                <ProfileImage 
                  user={profile} 
                  size="xl" 
                  className="h-20 w-20"
                />
              </div>
              {profile.isAdmin && (
                <div className="absolute -top-1 -right-1 p-1 bg-yellow-500/20 rounded-full border-2 border-yellow-500/50">
                  <Crown className="h-4 w-4 text-yellow-400" />
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {profile.name || profile.username}
          </h2>
          <p className="text-slate-400">@{profile.username}</p>
          {profile.xHandle && (
            <p className="text-blue-400 text-sm">𝕏 @{profile.xHandle}</p>
          )}
          
          <div className="flex justify-center mt-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {getPlayerRank(profile.gameLevel)}
            </Badge>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <Coins className="h-5 w-5" />
                <span className="font-bold">${profile.gameMoney.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">Total Money</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">{profile.gameLevel}</span>
              </div>
              <p className="text-xs text-slate-400">Level</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                <Target className="h-5 w-5" />
                <span className="font-bold">{profile.gameExp}</span>
              </div>
              <p className="text-xs text-slate-400">Experience</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Level Progress</span>
              <span className="text-slate-300">{profile.gameExp % 100}/100 XP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getNextLevelProgress(profile.gameExp, profile.gameLevel)}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10 mb-4">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-500/20 bg-green-500/10 mb-4">
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-slate-700/50">
              <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500/20">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="avatar" className="data-[state=active]:bg-purple-500/20">
                <Camera className="h-4 w-4 mr-2" />
                Avatar
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <h3 className="text-white font-semibold mb-3">Player Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Display Name:</span>
                        <span className="text-white">{profile.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Username:</span>
                        <span className="text-white">@{profile.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">X Handle:</span>
                        <span className="text-blue-400">{profile.xHandle ? `@${profile.xHandle}` : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Type:</span>
                        <span className="text-white">
                          {profile.isAdmin ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            'Player'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile Information
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Display Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your display name"
                        className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="xHandle" className="text-slate-300">X Handle (Twitter)</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">@</span>
                        <Input
                          id="xHandle"
                          type="text"
                          value={editXHandle}
                          onChange={(e) => setEditXHandle(e.target.value.replace('@', ''))}
                          placeholder="your_handle"
                          className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setEditName(profile.name || '')
                        setEditXHandle(profile.xHandle || '')
                        setError('')
                        setSuccess('')
                      }}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="avatar" className="space-y-4 mt-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <h3 className="text-white font-semibold mb-4 text-center">Profile Avatar</h3>
                <ProfileImageUpload 
                  user={profile}
                  onImageUpdate={handleImageUpdate}
                  size="xl"
                  className="flex flex-col items-center"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Game Audio
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300">Sound Effects</p>
                        <p className="text-xs text-slate-400">Block collection and battle sounds</p>
                      </div>
                      <Switch 
                        checked={gameSettings.soundEnabled}
                        onCheckedChange={(checked) => 
                          setGameSettings(prev => ({ ...prev, soundEnabled: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300">Game Notifications</p>
                        <p className="text-xs text-slate-400">Level ups, achievements, etc.</p>
                      </div>
                      <Switch 
                        checked={gameSettings.notificationsEnabled}
                        onCheckedChange={(checked) => 
                          setGameSettings(prev => ({ ...prev, notificationsEnabled: checked }))
                        }
                      />
                    </div>
                    <Separator className="bg-slate-600" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300">Auto-Spawn Alerts</p>
                        <p className="text-xs text-slate-400">Notify when blocks are ready to spawn</p>
                      </div>
                      <Switch 
                        checked={gameSettings.autoSpawnAlerts}
                        onCheckedChange={(checked) => 
                          setGameSettings(prev => ({ ...prev, autoSpawnAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300">Whale Transaction Alerts</p>
                        <p className="text-xs text-slate-400">Large crypto movements detected</p>
                      </div>
                      <Switch 
                        checked={gameSettings.whaleTransactionAlerts}
                        onCheckedChange={(checked) => 
                          setGameSettings(prev => ({ ...prev, whaleTransactionAlerts: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300">Private Profile</p>
                        <p className="text-xs text-slate-400">Hide stats from leaderboards</p>
                      </div>
                      <Switch 
                        checked={gameSettings.privateProfile}
                        onCheckedChange={(checked) => 
                          setGameSettings(prev => ({ ...prev, privateProfile: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
