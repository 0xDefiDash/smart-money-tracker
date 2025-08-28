
'use client'

import { AvantisTradingPanel } from '@/components/trading/avantis-trading-panel'

export default function TradingPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Avantis Trading</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            Trade with leverage using the Avantis protocol on Base network
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Avantis SDK</span>
        </div>
      </div>

      {/* Trading Panel */}
      <AvantisTradingPanel />
    </div>
  )
}
