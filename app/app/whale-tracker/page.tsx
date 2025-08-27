
'use client'

import { Suspense, useState, useEffect } from 'react'
import { WhaleTransactionsList } from '@/components/whale-tracker/whale-transactions-list'
import { WhaleFilters } from '@/components/whale-tracker/whale-filters'
import { WhaleCharts } from '@/components/whale-tracker/whale-charts'
import { LoadingCard } from '@/components/ui/loading-card'
import { Activity } from 'lucide-react'

export default function WhaleTrackerPage() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    
    updateTime() // Initial update
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Activity className="w-6 h-6 text-primary" />
            <span>Whale Tracker</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor large cryptocurrency transactions in real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<LoadingCard />}>
        <WhaleFilters />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={<LoadingCard />}>
        <WhaleCharts />
      </Suspense>

      {/* Transactions List */}
      <Suspense fallback={<LoadingCard />}>
        <WhaleTransactionsList />
      </Suspense>
    </div>
  )
}
