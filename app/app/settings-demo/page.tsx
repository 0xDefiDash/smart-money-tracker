
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BlockWarsProfileSettings } from '@/components/game/block-wars-profile-settings'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Settings, Crown, Star } from 'lucide-react'

// Mock user data for demonstration
const mockUser = {
  id: 'demo-user-123',
  username: 'blockwarrior',
  name: 'Block Warrior Pro',
  email: 'warrior@blockwars.com',
  profileImage: null as string | null,
  xHandle: 'blockwarrior_eth',
  gameMoney: 15750,
  gameLevel: 12,
  gameExp: 875,
  isAdmin: false
}

const mockAdminUser = {
  id: 'demo-admin-456',
  username: 'admin',
  name: 'Game Master',
  email: 'admin@blockwars.com',
  profileImage: null as string | null,
  xHandle: 'blockwars_official',
  gameMoney: 99999,
  gameLevel: 50,
  gameExp: 5000,
  isAdmin: true
}

export default function SettingsDemoPage() {
  const [showSettings, setShowSettings] = useState(false)
  const [currentUser, setCurrentUser] = useState(mockUser)
  const [selectedDemo, setSelectedDemo] = useState<'player' | 'admin'>('player')

  const handleUserSwitch = (type: 'player' | 'admin') => {
    setSelectedDemo(type)
    setCurrentUser(type === 'player' ? mockUser : mockAdminUser)
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Dash Wars Profile Settings Demo
          </h1>
          <p className="text-slate-400">
            Experience the enhanced profile settings system for Dash Wars
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="mb-6 bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => handleUserSwitch('player')}
                variant={selectedDemo === 'player' ? 'default' : 'outline'}
                className={selectedDemo === 'player' ? 'bg-purple-600' : ''}
              >
                Regular Player
              </Button>
              <Button
                onClick={() => handleUserSwitch('admin')}
                variant={selectedDemo === 'admin' ? 'default' : 'outline'}
                className={selectedDemo === 'admin' ? 'bg-yellow-600' : ''}
              >
                <Crown className="h-4 w-4 mr-2" />
                Admin User
              </Button>
            </div>
            <p className="text-sm text-slate-400">
              Switch between different user types to see how the profile settings adapt
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Board Simulation */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="relative">
                    <div className="border-2 border-purple-500/30 rounded-full p-0.5">
                      <div className="h-11 w-11 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {currentUser.name?.charAt(0) || currentUser.username.charAt(0)}
                      </div>
                    </div>
                    {currentUser.isAdmin && (
                      <div className="absolute -top-1 -right-1 p-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                        <Crown className="h-3 w-3 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {currentUser.name || currentUser.username}
                      </span>
                      {currentUser.isAdmin && (
                        <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">@{currentUser.username}</p>
                    {currentUser.xHandle && (
                      <p className="text-xs text-blue-400">𝕏 @{currentUser.xHandle}</p>
                    )}
                  </div>
                </CardTitle>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-600 hover:bg-slate-700 hover:border-purple-400 transition-colors"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                    <span className="font-bold text-sm">${currentUser.gameMoney.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400">Money</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                    <span className="font-bold text-sm">{currentUser.gameLevel}</span>
                  </div>
                  <p className="text-xs text-slate-400">Level</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                    <span className="font-bold text-sm">{currentUser.gameExp}</span>
                  </div>
                  <p className="text-xs text-slate-400">Experience</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Level Progress</span>
                  <span className="text-slate-300">{currentUser.gameExp % 100}/100 XP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentUser.gameExp % 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                New Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <h4 className="text-white font-medium mb-2">🖼️ Profile Management</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Upload custom profile images</li>
                    <li>• Edit display name and X handle</li>
                    <li>• View comprehensive game stats</li>
                    <li>• Player rank system</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <h4 className="text-white font-medium mb-2">🎮 Game Settings</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Sound effects toggle</li>
                    <li>• Notification preferences</li>
                    <li>• Auto-spawn alerts</li>
                    <li>• Whale transaction alerts</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <h4 className="text-white font-medium mb-2">🛡️ Privacy Controls</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Private profile option</li>
                    <li>• Leaderboard visibility</li>
                    <li>• Data management</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => setShowSettings(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Open Settings Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Modal Demo */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl">
              <BlockWarsProfileSettings 
                onClose={() => setShowSettings(false)}
                onProfileUpdate={(profile) => {
                  console.log('Profile updated in demo:', profile)
                  setCurrentUser(prev => ({ ...prev, ...profile }))
                }}
              />
            </div>
          </div>
        )}

        {/* Additional Info */}
        <Card className="mt-6 bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">Settings Button Fixed!</h3>
              <p className="text-slate-400 text-sm mb-4">
                The settings feature next to the user name now works perfectly. Click the settings icon (⚙️) 
                in the user board above to experience the new Dash Wars profile management system.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-white font-medium">Fixed Layout Issues</p>
                  <p className="text-xs text-slate-400">Settings button now properly positioned</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🎨</div>
                  <p className="text-white font-medium">Beautiful UI</p>
                  <p className="text-xs text-slate-400">Game-themed design with tabs</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🚀</div>
                  <p className="text-white font-medium">Full Functionality</p>
                  <p className="text-xs text-slate-400">Profile images, settings, and more</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
