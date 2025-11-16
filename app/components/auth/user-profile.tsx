
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Coins, Trophy, Star, LogOut } from 'lucide-react'
import { ProfileImage } from '@/components/ui/profile-image'
import { ProfileImageUpload } from '@/components/ui/profile-image-upload'

interface UserProfile {
  id: string
  username: string
  name: string
  email: string
  profileImage?: string
  xHandle?: string
  gameMoney: number // Changed from gameCoins
  gameLevel: number
  gameExp: number
  isAdmin: boolean
}

export function UserProfile() {
  const { data: session, status } = useSession() || {}
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editXHandle, setEditXHandle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id])

  // Show message if user is not logged in
  if (status !== 'loading' && !session) {
    return (
      <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-purple-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-white">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-300">
            Sign in to view and manage your profile
          </p>
          <Button 
            onClick={() => window.location.href = '/auth/signin'}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

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

  const handleUpdate = async (e: React.FormEvent) => {
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
      setProfile({
        ...profile,
        profileImage: imageUrl || undefined
      })
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-purple-500/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="border-2 border-purple-500/30 rounded-full p-1">
              <ProfileImage 
                user={profile} 
                size="xl" 
                className="h-20 w-20"
              />
            </div>
            {profile.isAdmin && (
              <div className="absolute -top-1 -right-1 p-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                <Star className="h-3 w-3 text-yellow-400" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-white">
          {profile.name || profile.username}
        </CardTitle>
        <p className="text-slate-400 text-sm">@{profile.username}</p>
        {profile.xHandle && (
          <p className="text-blue-400 text-xs">𝕏 @{profile.xHandle}</p>
        )}
        
        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400">
              <Coins className="h-4 w-4" />
              <span className="font-semibold">${profile.gameMoney.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">Money</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400">
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">{profile.gameLevel}</span>
            </div>
            <p className="text-xs text-slate-400">Level</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400">
              <Star className="h-4 w-4" />
              <span className="font-semibold">${profile.gameExp.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">Money</p>
          </div>
        </div>

        {profile.isAdmin && (
          <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Admin
          </Badge>
        )}
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

        {!isEditing ? (
          <div className="space-y-4">
            <Button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Image Upload Section */}
            <div className="text-center">
              <Label className="text-slate-300 text-sm font-medium block mb-3">Profile Picture</Label>
              <ProfileImageUpload 
                user={profile} 
                onImageUpdate={handleImageUpdate}
                size="xl"
                className="flex flex-col items-center"
              />
            </div>

            {/* Profile Information Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your display name"
                  className="bg-slate-700/50 border-slate-600 text-white"
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
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
