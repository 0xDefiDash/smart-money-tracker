

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  Users,
  Crown,
  Star,
  Zap,
  Trophy,
  Shield,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Viewer {
  id: string
  username: string
  avatar: string
  level: number
  rank?: number
  isVerified?: boolean
  isModerator?: boolean
  isVip?: boolean
  isSubscriber?: boolean
  joinTime: number
}

interface ViewersListProps {
  streamerId: string
}

export function ViewersList({ streamerId }: ViewersListProps) {
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [totalViewers, setTotalViewers] = useState(0)

  useEffect(() => {
    // Mock viewers data
    const mockViewers: Viewer[] = [
      {
        id: 'viewer_1',
        username: 'CryptoKing_Pro',
        avatar: '👑',
        level: 67,
        rank: 2,
        isVerified: true,
        isModerator: false,
        isVip: true,
        isSubscriber: true,
        joinTime: Date.now() - (45 * 60 * 1000)
      },
      {
        id: 'viewer_2',
        username: 'ModeratorX',
        avatar: '🛡️',
        level: 45,
        rank: 15,
        isVerified: false,
        isModerator: true,
        isVip: false,
        isSubscriber: true,
        joinTime: Date.now() - (120 * 60 * 1000)
      },
      {
        id: 'viewer_3',
        username: 'BlockHunter92',
        avatar: '🎯',
        level: 23,
        rank: 156,
        isVerified: false,
        isModerator: false,
        isVip: false,
        isSubscriber: false,
        joinTime: Date.now() - (15 * 60 * 1000)
      },
      {
        id: 'viewer_4',
        username: 'DefidashFan',
        avatar: '💎',
        level: 34,
        rank: 78,
        isVerified: true,
        isModerator: false,
        isVip: false,
        isSubscriber: true,
        joinTime: Date.now() - (30 * 60 * 1000)
      },
      {
        id: 'viewer_5',
        username: 'NewbieLearner',
        avatar: '🌱',
        level: 8,
        isVerified: false,
        isModerator: false,
        isVip: false,
        isSubscriber: false,
        joinTime: Date.now() - (5 * 60 * 1000)
      },
      {
        id: 'viewer_6',
        username: 'WhaleWatcher',
        avatar: '🐋',
        level: 52,
        rank: 25,
        isVerified: false,
        isModerator: false,
        isVip: true,
        isSubscriber: true,
        joinTime: Date.now() - (75 * 60 * 1000)
      }
    ]

    setViewers(mockViewers)
    setTotalViewers(Math.floor(Math.random() * 500) + 200) // Mock total including anonymous

    // Simulate viewers joining/leaving
    const interval = setInterval(() => {
      setTotalViewers(prev => Math.max(50, prev + Math.floor(Math.random() * 20) - 10))
      
      // Occasionally add/remove viewers from the list
      if (Math.random() > 0.8) {
        const newViewer: Viewer = {
          id: `viewer_${Date.now()}`,
          username: `Viewer${Math.floor(Math.random() * 1000)}`,
          avatar: ['🚀', '⚡', '🎮', '🔥', '💫'][Math.floor(Math.random() * 5)],
          level: Math.floor(Math.random() * 50) + 1,
          rank: Math.floor(Math.random() * 1000) + 1,
          isVerified: Math.random() > 0.8,
          joinTime: Date.now()
        }
        
        setViewers(prev => [...prev.slice(0, 8), newViewer]) // Keep list manageable
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [streamerId])

  const getUserBadges = (viewer: Viewer) => {
    const badges = []
    
    if (viewer.isModerator) {
      badges.push(
        <Badge key="mod" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          MOD
        </Badge>
      )
    }
    
    if (viewer.isVip) {
      badges.push(
        <Badge key="vip" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      )
    }
    
    if (viewer.isVerified) {
      badges.push(
        <Star key="verified" className="w-3 h-3 text-green-400" />
      )
    }
    
    if (viewer.isSubscriber) {
      badges.push(
        <Zap key="sub" className="w-3 h-3 text-yellow-400" />
      )
    }
    
    if (viewer.rank && viewer.rank <= 10) {
      badges.push(
        <Trophy key="top" className="w-3 h-3 text-orange-400" />
      )
    }
    
    return badges
  }

  const getViewTime = (joinTime: number) => {
    const duration = Date.now() - joinTime
    const minutes = Math.floor(duration / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const sortedViewers = viewers.sort((a, b) => {
    // Sort by: Moderators first, then VIPs, then by level (desc)
    if (a.isModerator && !b.isModerator) return -1
    if (!a.isModerator && b.isModerator) return 1
    if (a.isVip && !b.isVip) return -1
    if (!a.isVip && b.isVip) return 1
    return b.level - a.level
  })

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Viewers</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Eye className="w-4 h-4" />
            <span className="font-bold">{totalViewers.toLocaleString()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {sortedViewers.map((viewer) => (
              <div
                key={viewer.id}
                className={cn(
                  "p-3 rounded-lg transition-all duration-200 border",
                  "bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-sm">
                      {viewer.avatar}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1 mb-1">
                        <h4 className="font-medium text-sm truncate">{viewer.username}</h4>
                        <div className="flex items-center space-x-1">
                          {getUserBadges(viewer).slice(0, 2)} {/* Limit badges to avoid overflow */}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>L{viewer.level}</span>
                        </div>
                        
                        {viewer.rank && (
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>#{viewer.rank}</span>
                          </div>
                        )}
                        
                        <div className="text-gray-500">
                          {getViewTime(viewer.joinTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Anonymous viewers indicator */}
            {totalViewers > viewers.length && (
              <div className="p-3 rounded-lg bg-slate-800/20 border border-slate-700/20 text-center">
                <div className="text-sm text-muted-foreground">
                  +{(totalViewers - viewers.length).toLocaleString()} anonymous viewers
                </div>
              </div>
            )}

            {/* Empty state */}
            {viewers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No viewers yet</p>
                <p className="text-xs text-muted-foreground">Share your stream to get viewers!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Viewer stats summary */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-bold text-blue-400">{viewers.filter(v => v.isSubscriber).length}</div>
              <div className="text-muted-foreground">Subscribers</div>
            </div>
            <div>
              <div className="font-bold text-purple-400">{viewers.filter(v => v.isVip).length}</div>
              <div className="text-muted-foreground">VIPs</div>
            </div>
            <div>
              <div className="font-bold text-green-400">{viewers.filter(v => v.isVerified).length}</div>
              <div className="text-muted-foreground">Verified</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

