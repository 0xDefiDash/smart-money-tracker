
'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, Trophy, Star, Crown, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { downloadFile } from '@/lib/s3'
import { UserProfile } from '@/components/auth/user-profile'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

interface UserBoardProps {
  gameCoins: number
  gameLevel: number
  gameExp: number
  onCoinsUpdate?: (coins: number) => void
}

export function UserBoard({ gameCoins, gameLevel, gameExp, onCoinsUpdate }: UserBoardProps) {
  const { data: session } = useSession() || {}
  const [profileImageUrl, setProfileImageUrl] = useState<string>('')
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (session?.user?.profileImage) {
      loadProfileImage()
    }
  }, [session?.user?.profileImage])

  const loadProfileImage = async () => {
    try {
      if (session?.user?.profileImage) {
        const imageUrl = await downloadFile(session.user.profileImage)
        setProfileImageUrl(imageUrl)
      }
    } catch (error) {
      console.error('Failed to load profile image:', error)
    }
  }

  const expToNext = gameLevel * 100 // Experience needed for next level
  const expProgress = (gameExp % 100) / 100 * 100 // Progress to next level

  if (!session?.user) {
    return null
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                <AvatarImage src={profileImageUrl} alt={session.user.username} />
                <AvatarFallback className="bg-purple-600/20 text-purple-400 text-lg">
                  {session.user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {session.user.isAdmin && (
                <div className="absolute -top-1 -right-1 p-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                  <Crown className="h-3 w-3 text-yellow-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  {session.user.name || session.user.username}
                </span>
                {session.user.isAdmin && (
                  <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-400">@{session.user.username}</p>
            </div>
            <Dialog open={showProfile} onOpenChange={setShowProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
                <UserProfile />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                <Coins className="h-4 w-4" />
                <span className="font-bold text-sm">{gameCoins.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">Coins</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="font-bold text-sm">{gameLevel}</span>
              </div>
              <p className="text-xs text-slate-400">Level</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                <Star className="h-4 w-4" />
                <span className="font-bold text-sm">{gameExp}</span>
              </div>
              <p className="text-xs text-slate-400">EXP</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Level Progress</span>
              <span className="text-slate-300">{gameExp % 100}/{expToNext % 100}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
