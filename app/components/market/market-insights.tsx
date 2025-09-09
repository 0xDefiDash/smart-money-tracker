

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, AlertCircle, Target } from 'lucide-react'

// Mock market insights with deterministic timestamps for September 9, 2025
const baseTimestamp = new Date('2025-09-09T15:45:00Z').getTime();
const insights = [
  {
    id: 1,
    type: 'bullish',
    title: 'Institutional Bitcoin Accumulation Surge',
    description: 'Major institutional wallets have accumulated over 89,000 BTC today, creating massive buying pressure across all exchanges.',
    impact: 'high',
    timestamp: new Date(baseTimestamp - 420000),
    timeAgo: '7m ago',
    metrics: { volume: '$26.8B', wallets: 112, confidence: 98 }
  },
  {
    id: 2,
    type: 'bullish',
    title: 'Solana Ecosystem Institutional Adoption',
    description: 'SOL network sees record institutional activity with $24.89M in strategic protocol deployments and liquidity provisions.',
    impact: 'high',
    timestamp: new Date(baseTimestamp - 840000),
    timeAgo: '14m ago',
    metrics: { volume: '$24.9B', tps: '6,234', confidence: 95 }
  },
  {
    id: 3,
    type: 'bullish',
    title: 'Ethereum Corporate Treasury Inflows',
    description: 'BlackRock and Grayscale lead massive ETH accumulation with over $22.7M in institutional inflows within 24 hours.',
    impact: 'high',
    timestamp: new Date(baseTimestamp - 1320000),
    timeAgo: '22m ago',
    metrics: { inflow: '$22.7B', exchanges: 18, confidence: 97 }
  },
  {
    id: 4,
    type: 'bullish',
    title: 'DeFi TVL Reaches New Peak $234B',
    description: 'Total Value Locked in DeFi protocols surges 67% this week, with institutional-grade protocols driving unprecedented growth.',
    impact: 'high',
    timestamp: new Date(baseTimestamp - 2100000),
    timeAgo: '35m ago',
    metrics: { tvl: '$234.2B', change: '+67.8%', confidence: 93 }
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

