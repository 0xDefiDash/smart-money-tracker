
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users,
  Crown,
  Star,
  Eye,
  Zap,
  Shield
} from 'lucide-react'

interface Viewer {
  id: string
  username: string
  avatar: string
  level: number
  rank?: number
  isVerified?: boolean
  isModerator?: boolean
  isSubscriber?: boolean
  joinTime: number
}

interface ViewersListProps {
  streamerId: string
}

export function ViewersList({ streamerId }: ViewersListProps) {
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [totalViewers, setTotalViewers] = useState(1247)

  // Mock viewers data
  const mockViewers: Viewer[] = [
    {
      id: 'viewer1',
      username: 'CryptoKing92',
      avatar: '👑',
      level: 45,
      rank: 8,
      isVerified: true,
      joinTime: Date.now() - 3600000
    },
    {
      id: 'viewer2', 
      username: 'BlockHuntress',
      avatar: '🏹',
      level: 32,
      rank: 23,
      isVerified: false,
      isModerator: true,
      joinTime: Date.now() - 5400000
    },
    {
      id: 'viewer3',
      username: 'DefidashWhale',
      avatar: '🐋',
      level: 67,
      rank: 2,
      isVerified: true,
      isSubscriber: true,
      joinTime: Date.now() - 1800000
    },
    {
      id: 'viewer4',
      username: 'NewbieLearner',
      avatar: '🌱',
      level: 12,
      joinTime: Date.now() - 900000
    },
    {
      id: 'viewer5',
      username: 'EpicGamer2025',
      avatar: '⚡',
      level: 28,
      rank: 156,
      joinTime: Date.now() - 2700000
    },
    {
      id: 'viewer6',
      username: 'DiamondHands',
      avatar: '💎',
      level: 41,
      rank: 34,
      isVerified: true,
      joinTime: Date.now() - 4500000
    },
    {
      id: 'viewer7',
      username: 'BlockMaster',
      avatar: '🎯',
      level: 29,
      joinTime: Date.now() - 600000
    },
    {
      id: 'viewer8',
      username: 'CryptoNoob',
      avatar: '🤔',
      level: 6,
      joinTime: Date.now() - 300000
    }
  ]

  useEffect(() => {
    setViewers(mockViewers)

    // Simulate viewers joining/leaving
    const interval = setInterval(() => {
      const change = Math.random() > 0.6 ? 1 : -1 // 60% chance of gain, 40% chance of loss
      const amount = Math.floor(Math.random() * 5) + 1 // 1-5 viewers
      
      setTotalViewers(prev => Math.max(100, prev + (change * amount))) // Minimum 100 viewers
    }, Math.random() * 30000 + 10000) // Random interval 10-40 seconds

    return () => clearInterval(interval)
  }, [streamerId])

  const getViewerBadge = (viewer: Viewer) => {
    if (viewer.isModerator) return <Shield className="w-3 h-3 text-blue-500" />
    if (viewer.isVerified) return <Star className="w-3 h-3 text-green-500" />
    if (viewer.rank && viewer.rank <= 10) return <Crown className="w-3 h-3 text-yellow-500" />
    if (viewer.isSubscriber) return <Zap className="w-3 h-3 text-purple-500" />
    return null
  }

  const getWatchTime = (joinTime: number) => {
    const duration = Date.now() - joinTime
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Viewers</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold">{totalViewers.toLocaleString()}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {viewers.map((viewer) => (
              <div
                key={viewer.id}
                className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-sm">
                    {viewer.avatar}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-sm truncate">{viewer.username}</span>
                      {getViewerBadge(viewer)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        L{viewer.level}
                      </Badge>
                      {viewer.rank && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          #{viewer.rank}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {getWatchTime(viewer.joinTime)}
                </div>
              </div>
            ))}

            {/* Show that there are more viewers */}
            <div className="text-center py-2 text-xs text-muted-foreground">
              and {(totalViewers - viewers.length).toLocaleString()} more viewers...
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
