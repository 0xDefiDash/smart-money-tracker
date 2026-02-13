'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { WhaleActivity } from '@/components/dashboard/whale-activity'
import { SmartMoneyInsights } from '@/components/dashboard/smart-money-insights'
import { ExchangeFlows } from '@/components/dashboard/exchange-flows'
import { RecentAlerts } from '@/components/dashboard/recent-alerts'
import { MarketStats } from '@/components/dashboard/market-stats'
import { DeFiOverview } from '@/components/dashboard/defi-overview'
import { LivePriceFeed } from '@/components/dashboard/live-price-feed'
import { NansenLiveFeed } from '@/components/dashboard/nansen-live-feed'
import { LoadingCard } from '@/components/ui/loading-card'
import { LivePriceTicker } from '@/components/mobile/LivePriceTicker'
import { MobileQuickStats } from '@/components/mobile/MobileQuickStats'
import { MobileTrendingTokens } from '@/components/mobile/MobileTrendingTokens'
import { MobileQuickActions } from '@/components/mobile/MobileQuickActions'
import { MobileWhaleAlerts } from '@/components/mobile/MobileWhaleAlerts'
import { RefreshCw, Activity, TrendingUp } from 'lucide-react'
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
      
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
        setStartY(0)
        setLastUpdate(new Date())
        toast.success('Data refreshed!', {
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid #1a1a1a',
          }
        })
      }, 1500)
    } else {
      setPullDistance(0)
      setStartY(0)
    }
  }, [pullDistance])

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
    <div className="min-h-screen bg-black">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-primary/10 transition-all duration-200"
          style={{
            height: `${pullDistance}px`,
            opacity: pullDistance / 100
          }}
        >
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw 
              className={`w-6 h-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${pullDistance * 2}deg)`
              }}
            />
            <span className="text-sm text-white">
              {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                <span>Smart Money Tracker</span>
              </h1>
              <p className="text-gray-400 mt-2">
                Discover and track smart money movements across chains
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-400">LIVE</span>
              </div>
            </div>
          </div>
          
          {/* Last update time */}
          {isMounted && lastUpdate && (
            <div className="text-sm text-gray-500">
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Search Bar - Swarms Style */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Search by wallet, token, or transaction..."
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Mobile Quick Stats */}
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

        {/* Trending Tokens - Mobile */}
        <div className="lg:hidden">
          <Suspense fallback={<LoadingCard />}>
            <MobileTrendingTokens key={lastUpdate?.getTime() || 0} />
          </Suspense>
        </div>

        {/* Whale Alerts - Mobile */}
        <div className="lg:hidden">
          <Suspense fallback={<LoadingCard />}>
            <MobileWhaleAlerts />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingCard />}>
            <MarketOverview />
          </Suspense>

          <Suspense fallback={<LoadingCard />}>
            <WhaleActivity />
          </Suspense>
        </div>

        {/* DeFi Overview */}
        <Suspense fallback={<LoadingCard />}>
          <DeFiOverview />
        </Suspense>

        {/* Smart Money Insights */}
        <Suspense fallback={<LoadingCard />}>
          <SmartMoneyInsights />
        </Suspense>

        {/* Real-Time Data Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingCard />}>
            <LivePriceFeed />
          </Suspense>

          <Suspense fallback={<LoadingCard />}>
            <NansenLiveFeed />
          </Suspense>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingCard />}>
            <ExchangeFlows />
          </Suspense>

          <Suspense fallback={<LoadingCard />}>
            <RecentAlerts />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
