
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, AlertCircle, Target } from 'lucide-react'

// Mock market insights with deterministic timestamps
const baseTimestamp = new Date('2025-08-27T15:30:00Z').getTime();
const insights = [
  {
    id: 1,
    type: 'bullish',
    title: 'Bitcoin Whale Accumulation Detected',
    description: 'Large institutional wallets have accumulated over 15,000 BTC in the last 24 hours, indicating strong buying pressure.',
    impact: 'high',
    timestamp: new Date(baseTimestamp - 900000),
    timeAgo: '15m ago',
    metrics: { volume: '$2.1B', wallets: 47, confidence: 85 }
  },
  {
    id: 2,
    type: 'neutral',
    title: 'Ethereum Network Activity Stable',
    description: 'ETH gas fees remain stable at 25 gwei with consistent transaction throughput. No major network congestion detected.',
    impact: 'medium',
    timestamp: new Date(baseTimestamp - 1800000),
    timeAgo: '30m ago',
    metrics: { gasPrice: '25 gwei', tps: '12.5', confidence: 72 }
  },
  {
    id: 3,
    type: 'bearish',
    title: 'Major Exchange Outflows Increasing',
    description: 'Significant outflows detected from major exchanges, particularly Binance and Coinbase, suggesting potential selling pressure.',
    impact: 'high',
    timestamp: new Date(baseTimestamp - 2700000),
    timeAgo: '45m ago',
    metrics: { outflow: '$890M', exchanges: 8, confidence: 91 }
  },
  {
    id: 4,
    type: 'bullish',
    title: 'DeFi TVL Shows Recovery Signs',
    description: 'Total Value Locked in DeFi protocols increased by 8.5% this week, with particular strength in lending protocols.',
    impact: 'medium',
    timestamp: new Date(baseTimestamp - 3600000),
    timeAgo: '1h ago',
    metrics: { tvl: '$89.5B', change: '+8.5%', confidence: 78 }
  }
]

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'bullish': return TrendingUp
    case 'bearish': return AlertCircle
    default: return Target
  }
}

const getInsightColor = (type: string) => {
  switch (type) {
    case 'bullish': return 'border-green-500/20 bg-green-500/5'
    case 'bearish': return 'border-red-500/20 bg-red-500/5'
    default: return 'border-blue-500/20 bg-blue-500/5'
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

export function MarketInsights() {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <span>Market Insights</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type)
            
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'bullish' ? 'bg-green-500/10' :
                    insight.type === 'bearish' ? 'bg-red-500/10' : 'bg-blue-500/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      insight.type === 'bullish' ? 'text-green-500' :
                      insight.type === 'bearish' ? 'text-red-500' : 'text-blue-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {insight.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getImpactColor(insight.impact)}`}
                        >
                          {insight.impact.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-1">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {insight.timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border text-center">
          <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All Market Analysis →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
