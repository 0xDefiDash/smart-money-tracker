
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, User, Coins, Trophy, Star, LogOut, Camera } from 'lucide-react'
import { downloadFile } from '@/lib/s3'

interface UserProfile {
  id: string
  username: string
  name: string
  email: string
  profileImage?: string
  gameCoins: number
  gameLevel: number
  gameExp: number
  isAdmin: boolean
}

export function UserProfile() {
  const { data: session } = useSession() || {}
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        
        // Load profile image from S3 if it exists
        if (data.user.profileImage) {
          const imageUrl = await downloadFile(data.user.profileImage)
          setProfileImageUrl(imageUrl)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      setSelectedFile(file)
      setError('')
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
      if (selectedFile) {
        formData.append('profileImage', selectedFile)
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.user)
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        setSelectedFile(null)
        
        // Reload profile image
        if (data.user.profileImage) {
          const imageUrl = await downloadFile(data.user.profileImage)
          setProfileImageUrl(imageUrl)
        }
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
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
            <Avatar className="h-24 w-24 border-2 border-purple-500/30">
              <AvatarImage src={profileImageUrl} alt={profile.username} />
              <AvatarFallback className="text-2xl bg-purple-600/20 text-purple-400">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
        
        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400">
              <Coins className="h-4 w-4" />
              <span className="font-semibold">{profile.gameCoins.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">Coins</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400">
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">{profile.gameLevel}</span>
            </div>
            <p className="text-xs text-slate-400">Level</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400">
              <Star className="h-4 w-4" />
              <span className="font-semibold">{profile.gameExp}</span>
            </div>
            <p className="text-xs text-slate-400">EXP</p>
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
              <Label htmlFor="profileImage" className="text-slate-300">Profile Picture</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-slate-700/50 border-slate-600 text-white file:text-white"
                />
                <Camera className="h-4 w-4 text-slate-400" />
              </div>
              {selectedFile && (
                <p className="text-sm text-slate-400">
                  Selected: {selectedFile.name}
                </p>
              )}
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
                  setSelectedFile(null)
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
      </CardContent>
    </Card>
  )
}
