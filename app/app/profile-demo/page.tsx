
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileImage } from '@/components/ui/profile-image'
import { ProfileImageUpload } from '@/components/ui/profile-image-upload'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Upload } from 'lucide-react'

interface User {
  id: string
  name: string | null
  username: string | null
  email: string | null
  profileImage: string | null
  isAdmin?: boolean
}

export default function ProfileDemoPage() {
  const [users, setUsers] = useState<User[]>([])
  const [demoUser, setDemoUser] = useState<User | null>(null)

  useEffect(() => {
    // Create some demo users to show profile image functionality
    const demoUsers: User[] = [
      {
        id: 'demo1',
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        profileImage: null
      },
      {
        id: 'demo2', 
        name: 'Alice Smith',
        username: 'alicesmith',
        email: 'alice@example.com',
        profileImage: null
      },
      {
        id: 'demo3',
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        profileImage: null,
        isAdmin: true
      }
    ]
    setUsers(demoUsers)
    setDemoUser(demoUsers[0])
  }, [])

  const handleImageUpdate = (imageUrl: string | null) => {
    if (demoUser) {
      const updatedUser = { ...demoUser, profileImage: imageUrl }
      setDemoUser(updatedUser)
      
      // Update in users list too
      setUsers(prev => prev.map(u => 
        u.id === demoUser.id ? updatedUser : u
      ))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Profile Image Demo
          </h1>
          <p className="text-slate-400">
            Demonstration of profile image functionality with upload, display, and management
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Image Upload Demo */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Profile Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demoUser && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Demo User: {demoUser.name}
                    </h3>
                    <ProfileImageUpload 
                      user={demoUser}
                      onImageUpdate={handleImageUpdate}
                      size="xl"
                      className="flex flex-col items-center"
                    />
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Features:</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Upload JPG, PNG, GIF, or WebP images</li>
                      <li>• Automatic file validation and size limits (5MB)</li>
                      <li>• Secure S3 cloud storage</li>
                      <li>• Image preview and error handling</li>
                      <li>• Remove existing images</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Image Display Demo */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Image Display</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">
                  Different Sizes & Fallbacks:
                </h3>

                {users.map(user => (
                  <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                    <div className="flex items-center gap-3">
                      {/* Small size */}
                      <ProfileImage user={user} size="sm" />
                      {/* Medium size */}
                      <ProfileImage user={user} size="md" />
                      {/* Large size */}
                      <div className="relative">
                        <ProfileImage user={user} size="lg" />
                        {user.isAdmin && (
                          <div className="absolute -top-1 -right-1 p-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                            <Crown className="h-2 w-2 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{user.name}</span>
                        {user.isAdmin && (
                          <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">@{user.username}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {user.profileImage ? 'Custom Image' : 'Fallback Avatar'}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Display Features:</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Multiple size options (sm, md, lg, xl)</li>
                    <li>• Automatic fallback to user initials</li>
                    <li>• Signed URL generation for S3 images</li>
                    <li>• Loading states and error handling</li>
                    <li>• Responsive design with gradient fallbacks</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Integration Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <h4 className="text-white font-medium mb-2">Dash Wars Game</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Profile images in user boards and game interfaces
                </p>
                <Button size="sm" onClick={() => window.open('/block-wars', '_blank')}>
                  View in Game
                </Button>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <h4 className="text-white font-medium mb-2">User Profile Editor</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Full profile management with image upload
                </p>
                <Button size="sm" onClick={() => window.open('/auth/test', '_blank')}>
                  Test Auth System
                </Button>
              </div>

              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <h4 className="text-white font-medium mb-2">Scalable & Secure</h4>
                <p className="text-sm text-slate-400 mb-3">
                  AWS S3 storage with automatic cleanup
                </p>
                <div className="text-xs text-green-400">✅ Production Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
