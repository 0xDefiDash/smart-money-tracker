'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { WhaleActivity } from '@/components/dashboard/whale-activity'
import { ExchangeFlows } from '@/components/dashboard/exchange-flows'
import { RecentAlerts } from '@/components/dashboard/recent-alerts'
import { MarketStats } from '@/components/dashboard/market-stats'
import { DeFiOverview } from '@/components/dashboard/defi-overview'
import { LoadingCard } from '@/components/ui/loading-card'
import { LivePriceTicker } from '@/components/mobile/LivePriceTicker'
import { MobileQuickStats } from '@/components/mobile/MobileQuickStats'
import { MobileTrendingTokens } from '@/components/mobile/MobileTrendingTokens'
import { MobileQuickActions } from '@/components/mobile/MobileQuickActions'
import { MobileWhaleAlerts } from '@/components/mobile/MobileWhaleAlerts'
import { RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Pull-to-refresh functionality
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY > 0 && window.scrollY === 0) {
      const currentY = e.touches[0].clientY
      const distance = currentY - startY
      
      if (distance > 0 && distance < 150) {
        setPullDistance(distance)
      }
    }
  }, [startY])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 80) {
      setIsRefreshing(true)
      
      // Trigger refresh
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
        setStartY(0)
        setLastUpdate(new Date())
        toast.success('Data refreshed!', {
          icon: '✨',
          style: {
            background: '#10b981',
            color: '#fff',
          }
        })
      }, 1500)
    } else {
      setPullDistance(0)
      setStartY(0)
    }
  }, [pullDistance])

  // Initialize time only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-gradient-to-b from-primary/20 to-transparent transition-all duration-200"
          style={{
            height: `${pullDistance}px`,
            opacity: pullDistance / 100
          }}
        >
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw 
              className={`w-8 h-8 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${pullDistance * 2}deg)`
              }}
            />
            <span className="text-sm font-medium text-primary">
              {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Enhanced Mobile Header */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center space-x-2">
                <span>DeFiDash</span>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                Real-time crypto intelligence
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-500">LIVE</span>
            </div>
          </div>
          
          {/* Last update time - Only shown after client-side hydration */}
          {isMounted && lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Mobile Quick Stats - Shows first on mobile */}
        <div className="lg:hidden">
          <Suspense fallback={<LoadingCard />}>
            <MobileQuickStats key={lastUpdate?.getTime() || 0} />
          </Suspense>
        </div>

        {/* Mobile Quick Actions */}
        <div className="lg:hidden">
          <MobileQuickActions />
        </div>

        {/* Desktop Market Stats Row */}
        <div className="hidden lg:block">
          <Suspense fallback={<LoadingCard />}>
            <MarketStats />
          </Suspense>
        </div>

        {/* Trending Tokens - Mobile optimized */}
        <div className="lg:hidden">
          <Suspense fallback={<LoadingCard />}>
            <MobileTrendingTokens key={lastUpdate?.getTime() || 0} />
          </Suspense>
        </div>

        {/* Whale Alerts - Mobile optimized */}
        <div className="lg:hidden">
          <Suspense fallback={<LoadingCard />}>
            <MobileWhaleAlerts />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Market Overview */}
          <Suspense fallback={<LoadingCard />}>
            <MarketOverview />
          </Suspense>

          {/* Whale Activity */}
          <Suspense fallback={<LoadingCard />}>
            <WhaleActivity />
          </Suspense>
        </div>

        {/* DeFi Overview Section */}
        <Suspense fallback={<LoadingCard />}>
          <DeFiOverview />
        </Suspense>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Exchange Flows */}
          <Suspense fallback={<LoadingCard />}>
            <ExchangeFlows />
          </Suspense>

          {/* Recent Alerts */}
          <Suspense fallback={<LoadingCard />}>
            <RecentAlerts />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
