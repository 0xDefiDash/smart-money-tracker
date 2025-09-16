
'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, Trophy, Star, Crown, Settings } from 'lucide-react'
import { useState } from 'react'
import { ProfileImage } from '@/components/ui/profile-image'
import { BlockWarsProfileSettings } from '@/components/game/block-wars-profile-settings'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

interface UserBoardProps {
  gameMoney: number // Changed from gameCoins
  gameLevel: number
  gameExp: number
  onMoneyUpdate?: (money: number) => void // Changed from onCoinsUpdate
}

export function UserBoard({ gameMoney, gameLevel, gameExp, onMoneyUpdate }: UserBoardProps) {
  const { data: session } = useSession() || {}
  const [showProfile, setShowProfile] = useState(false)

  const expToNext = gameLevel * 100 // Experience needed for next level
  const expProgress = (gameExp % 100) / 100 * 100 // Progress to next level

  // Debug logging
  console.log('UserBoard render - Session:', session?.user ? 'User found' : 'No user')

  if (!session?.user) {
    console.log('UserBoard: No session user, returning null')
    return null
  }

  console.log('UserBoard: Rendering with user:', session.user.username)

  return (
    <>
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="relative">
                <div className="border-2 border-purple-500/30 rounded-full p-0.5">
                  <ProfileImage 
                    user={session.user} 
                    size="lg" 
                    className="h-11 w-11"
                  />
                </div>
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
                {session.user.xHandle && (
                  <p className="text-xs text-blue-400">𝕏 @{session.user.xHandle}</p>
                )}
              </div>
            </CardTitle>
            
            <Dialog open={showProfile} onOpenChange={setShowProfile}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-500/50 hover:bg-purple-600 hover:border-purple-400 transition-colors bg-slate-800/80 shadow-lg"
                  title="Profile Settings"
                  data-testid="settings-button"
                >
                  <Settings className="h-4 w-4 text-purple-300 hover:text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-0 p-0 max-w-2xl">
                <BlockWarsProfileSettings 
                  onClose={() => setShowProfile(false)}
                  onProfileUpdate={(updatedProfile) => {
                    // Handle profile updates if needed
                    console.log('Profile updated:', updatedProfile)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <Coins className="h-4 w-4" />
                <span className="font-bold text-sm">${gameMoney.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">Money</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="font-bold text-sm">{gameLevel}</span>
              </div>
              <p className="text-xs text-slate-400">Level</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <Star className="h-4 w-4" />
                <span className="font-bold text-sm">${gameExp.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">Money</p>
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
