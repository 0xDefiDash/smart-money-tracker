
import { Suspense } from 'react'
import { LiveMarketData } from '@/components/market/live-market-data'
import { MarketCharts } from '@/components/market/market-charts'
import { TopMovers } from '@/components/market/top-movers'
import { MarketInsights } from '@/components/market/market-insights'
import { LoadingCard } from '@/components/ui/loading-card'
import { TrendingUp } from 'lucide-react'

export const dynamic = "force-dynamic"

export default function MarketPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>Live Market</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time cryptocurrency market data and analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Updates every 5 minutes
          </span>
        </div>
      </div>

      {/* Live Market Data */}
      <Suspense fallback={<LoadingCard />}>
        <LiveMarketData />
      </Suspense>

      {/* Charts and Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingCard />}>
            <MarketCharts />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingCard />}>
          <TopMovers />
        </Suspense>
      </div>

      {/* Market Insights */}
      <Suspense fallback={<LoadingCard />}>
        <MarketInsights />
      </Suspense>
    </div>
  )
}
