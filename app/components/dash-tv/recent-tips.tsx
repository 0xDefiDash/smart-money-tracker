
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DollarSign, TrendingUp, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Tip {
  id: string
  amount: number
  amountUsd: number
  cryptocurrency: string
  message?: string
  createdAt: string
  fromUserId: string
}

interface RecentTipsProps {
  streamerId?: string
  streamId?: string
  videoId?: string
  limit?: number
  showStats?: boolean
}

export function RecentTips({ 
  streamerId, 
  streamId, 
  videoId,
  limit = 10,
  showStats = true 
}: RecentTipsProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [stats, setStats] = useState({
    totalTips: 0,
    totalAmount: 0,
    topTipper: null as string | null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTips()
  }, [streamerId, streamId, videoId])

  const fetchTips = async () => {
    try {
      const params = new URLSearchParams()
      if (streamerId) params.append('streamerId', streamerId)
      if (streamId) params.append('streamId', streamId)
      if (videoId) params.append('videoId', videoId)
      params.append('limit', limit.toString())

      const response = await fetch(`/api/dash-tv/tips?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTips(data.tips || [])
        if (showStats) {
          setStats(data.stats || stats)
        }
      }
    } catch (error) {
      console.error('Error fetching tips:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recent Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading tips...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Recent Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showStats && (
          <div className="grid grid-cols-3 gap-4 pb-4 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalTips}</div>
              <div className="text-xs text-muted-foreground">Total Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${stats.totalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {tips.length > 0 ? (stats.totalAmount / stats.totalTips).toFixed(2) : '0'}
              </div>
              <div className="text-xs text-muted-foreground">Avg. Tip</div>
            </div>
          </div>
        )}

        {tips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No tips yet. Be the first to support this creator!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {tip.fromUserId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        Anonymous Supporter
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {tip.amount} {tip.cryptocurrency}
                      </Badge>
                    </div>
                    {tip.message && (
                      <p className="text-sm text-muted-foreground">
                        {tip.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>${tip.amountUsd.toFixed(2)} USD</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(tip.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
