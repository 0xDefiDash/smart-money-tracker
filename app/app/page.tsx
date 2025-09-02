
import { Suspense } from 'react'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { WhaleActivity } from '@/components/dashboard/whale-activity'
import { ExchangeFlows } from '@/components/dashboard/exchange-flows'
import { RecentAlerts } from '@/components/dashboard/recent-alerts'
import { MarketStats } from '@/components/dashboard/market-stats'
import { DeFiOverview } from '@/components/dashboard/defi-overview'
import { LoadingCard } from '@/components/ui/loading-card'

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Smart Money Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            Track whale transactions and institutional flows in real-time
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Market Stats Row */}
      <Suspense fallback={<LoadingCard />}>
        <MarketStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  )
}
