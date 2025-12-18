'use client';

import { MarketData } from '@/lib/ai-agents/agent-types';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketOverviewProps {
  marketData: MarketData[];
}

export function MarketOverview({ marketData }: MarketOverviewProps) {
  if (!marketData || marketData.length === 0) {
    return (
      <Card className="border-2 border-terminal-green/30 bg-black/95 p-6">
        <div className="text-center text-terminal-gray py-8">
          <Activity className="h-12 w-12 mx-auto mb-3 animate-pulse" />
          <p>Loading market data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-terminal-green/30 bg-black/95 p-6">
      <h2 className="text-terminal-green font-bold text-lg uppercase tracking-wider mb-4">
        Live Market Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketData.map((market) => (
          <div
            key={market.symbol}
            className="bg-black/50 border border-terminal-green/30 rounded-lg p-4 hover:border-terminal-green/60 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-terminal-green font-mono font-bold text-lg">
                {market.symbol}
              </div>
              {market.sentiment === 'bullish' ? (
                <TrendingUp className="h-5 w-5 text-terminal-green" />
              ) : market.sentiment === 'bearish' ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <Activity className="h-5 w-5 text-yellow-500" />
              )}
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-terminal-gray text-xs">Price</div>
                <div className="text-terminal-green text-xl font-mono font-bold">
                  ${market.price.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-terminal-gray text-xs">24h Change</div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      market.priceChange24h >= 0 ? 'text-terminal-green' : 'text-red-500'
                    }`}
                  >
                    {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-terminal-gray text-xs">Volume</div>
                  <div className="text-terminal-green text-sm font-mono">
                    ${(market.volume24h / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>

              {market.funding_rate !== undefined && (
                <div>
                  <div className="text-terminal-gray text-xs">Funding Rate</div>
                  <div className="text-terminal-green text-sm font-mono">
                    {(market.funding_rate * 100).toFixed(4)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
