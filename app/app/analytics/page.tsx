
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  LineChart, 
  Activity, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Building2,
  Zap,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts'
import { useState, useEffect } from 'react'

// Analytics data
const marketAnalytics = {
  totalMarketCap: 2487650000000,
  totalVolume: 125800000000,
  marketCapChange24h: 3.24,
  volumeChange24h: -5.67,
  dominance: {
    btc: 45.2,
    eth: 18.7,
    others: 36.1
  },
  fearGreedIndex: 72,
  volatilityIndex: 28.5
}

const whaleAnalytics = {
  totalWhales: 1847,
  activeWhales24h: 342,
  whaleTransactions24h: 1256,
  whaleVolume24h: 8900000000,
  topWhaleHolding: 2850000000,
  newWhalesThisWeek: 23,
  whaleActivityScore: 8.7
}

const exchangeAnalytics = {
  totalExchanges: 156,
  majorExchanges: 8,
  exchangeVolume24h: 89500000000,
  exchangeOutflows24h: 2100000000,
  exchangeInflows24h: 1850000000,
  netFlow: -250000000,
  healthyExchanges: 134,
  alertExchanges: 22
}

// Historical data for trends
const marketTrendData = [
  { date: '2025-08-20', marketCap: 2.35, volume: 98, whaleActivity: 6.2 },
  { date: '2025-08-21', marketCap: 2.41, volume: 112, whaleActivity: 7.1 },
  { date: '2025-08-22', marketCap: 2.38, volume: 89, whaleActivity: 5.8 },
  { date: '2025-08-23', marketCap: 2.44, volume: 124, whaleActivity: 8.3 },
  { date: '2025-08-24', marketCap: 2.46, volume: 135, whaleActivity: 7.9 },
  { date: '2025-08-25', marketCap: 2.42, volume: 118, whaleActivity: 6.7 },
  { date: '2025-08-26', marketCap: 2.47, volume: 142, whaleActivity: 8.9 },
  { date: '2025-08-27', marketCap: 2.49, volume: 126, whaleActivity: 8.7 }
]

const sectorAnalysis = [
  { name: 'DeFi', value: 42, volume: 28500000000, change: 5.2 },
  { name: 'Layer 1', value: 35, volume: 45200000000, change: 3.8 },
  { name: 'Layer 2', value: 12, volume: 12800000000, change: -1.2 },
  { name: 'NFTs', value: 6, volume: 3200000000, change: -8.5 },
  { name: 'Gaming', value: 3, volume: 1800000000, change: 12.3 },
  { name: 'Others', value: 2, volume: 950000000, change: -2.1 }
]

const riskMetrics = [
  { metric: 'Market Volatility', value: 28.5, status: 'moderate', color: '#f59e0b' },
  { metric: 'Liquidity Risk', value: 15.2, status: 'low', color: '#22c55e' },
  { metric: 'Concentration Risk', value: 62.8, status: 'high', color: '#ef4444' },
  { metric: 'Correlation Risk', value: 45.3, status: 'moderate', color: '#f59e0b' },
  { metric: 'Regulatory Risk', value: 35.7, status: 'moderate', color: '#f59e0b' },
  { metric: 'Technical Risk', value: 22.1, status: 'low', color: '#22c55e' }
]

const performanceMetrics = [
  { period: '24H', returns: 2.34, sharpe: 1.85, maxDrawdown: -3.2, winRate: 68 },
  { period: '7D', returns: 8.91, sharpe: 2.12, maxDrawdown: -8.7, winRate: 72 },
  { period: '30D', returns: 18.45, sharpe: 1.94, maxDrawdown: -15.3, winRate: 65 },
  { period: '90D', returns: 34.78, sharpe: 1.67, maxDrawdown: -22.1, winRate: 61 }
]

const correlationData = [
  { asset1: 'BTC', asset2: 'ETH', correlation: 0.82 },
  { asset1: 'BTC', asset2: 'SOL', correlation: 0.67 },
  { asset1: 'BTC', asset2: 'XRP', correlation: 0.45 },
  { asset1: 'ETH', asset2: 'SOL', correlation: 0.74 },
  { asset1: 'ETH', asset2: 'XRP', correlation: 0.52 },
  { asset1: 'SOL', asset2: 'XRP', correlation: 0.38 }
]

const COLORS = ['#60B5FF', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')
  const [selectedTimeframe, setSelectedTimeframe] = useState('7D')
  const [selectedMetric, setSelectedMetric] = useState('marketCap')

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span>Advanced Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive market analysis and smart money insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {['24H', '7D', '30D', '90D'].map((timeframe) => (
              <Badge
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(marketAnalytics.totalMarketCap)}</p>
                <p className="text-xs text-green-500 mt-1">+{formatPercent(marketAnalytics.marketCapChange24h)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">24H Volume</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(marketAnalytics.totalVolume)}</p>
                <p className="text-xs text-red-500 mt-1">{formatPercent(marketAnalytics.volumeChange24h)}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Whales</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(whaleAnalytics.activeWhales24h)}</p>
                <p className="text-xs text-purple-500 mt-1">Score: {whaleAnalytics.whaleActivityScore}/10</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fear & Greed</p>
                <p className="text-2xl font-bold text-foreground">{marketAnalytics.fearGreedIndex}</p>
                <p className="text-xs text-orange-500 mt-1">Greedy</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends Chart */}
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="w-5 h-5 text-primary" />
              <span>Market Trends Analysis</span>
            </CardTitle>
            <div className="flex space-x-2">
              {['marketCap', 'volume', 'whaleActivity'].map((metric) => (
                <Badge
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedMetric(metric)}
                >
                  {metric === 'marketCap' ? 'Market Cap' : 
                   metric === 'volume' ? 'Volume' : 'Whale Activity'}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketTrendData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60B5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60B5FF" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{new Date(label).toLocaleDateString()}</p>
                          <p className="text-sm text-primary">
                            {selectedMetric === 'marketCap' ? `Market Cap: $${payload[0]?.value}T` :
                             selectedMetric === 'volume' ? `Volume: $${payload[0]?.value}B` :
                             `Whale Activity: ${payload[0]?.value}/10`}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#60B5FF"
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sector Analysis & Risk Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Analysis */}
        <Card className="bg-gradient-to-br from-background to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Sector Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sectorAnalysis}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {sectorAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {sectorAnalysis.map((sector, index) => (
                <div key={sector.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground">{sector.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-foreground">{formatCurrency(sector.volume)}</span>
                    <span className={`ml-2 ${sector.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercent(sector.change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card className="bg-gradient-to-br from-background to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span>Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((risk, index) => (
                <div key={risk.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{risk.metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{risk.value}%</span>
                      <Badge 
                        variant={risk.status === 'low' ? 'default' : 
                                risk.status === 'moderate' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {risk.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${risk.value}%`,
                        backgroundColor: risk.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Period</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Returns</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Sharpe Ratio</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Max Drawdown</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {performanceMetrics.map((metric) => (
                  <tr key={metric.period} className="border-b border-border/50">
                    <td className="py-3 px-3">
                      <Badge variant="outline">{metric.period}</Badge>
                    </td>
                    <td className="text-right py-3 px-3">
                      <span className={`font-medium ${metric.returns > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(metric.returns)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-3 text-foreground font-medium">
                      {metric.sharpe.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-3 text-red-500 font-medium">
                      {formatPercent(metric.maxDrawdown)}
                    </td>
                    <td className="text-right py-3 px-3 text-foreground font-medium">
                      {metric.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Whale Activity & Exchange Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Whale Activity Analytics */}
        <Card className="bg-gradient-to-br from-background to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Whale Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{formatNumber(whaleAnalytics.totalWhales)}</p>
                <p className="text-xs text-muted-foreground">Total Whales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{formatNumber(whaleAnalytics.activeWhales24h)}</p>
                <p className="text-xs text-muted-foreground">Active (24h)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{formatNumber(whaleAnalytics.whaleTransactions24h)}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{formatCurrency(whaleAnalytics.whaleVolume24h)}</p>
                <p className="text-xs text-muted-foreground">Volume (24h)</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Top Whale Holding</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(whaleAnalytics.topWhaleHolding)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Whales (Week)</span>
                <span className="text-sm font-bold text-green-500">+{whaleAnalytics.newWhalesThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activity Score</span>
                <Badge variant="default">{whaleAnalytics.whaleActivityScore}/10</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Health */}
        <Card className="bg-gradient-to-br from-background to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Exchange Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{exchangeAnalytics.totalExchanges}</p>
                <p className="text-xs text-muted-foreground">Total Exchanges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{exchangeAnalytics.healthyExchanges}</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{exchangeAnalytics.alertExchanges}</p>
                <p className="text-xs text-muted-foreground">Alerts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(exchangeAnalytics.exchangeVolume24h)}</p>
                <p className="text-xs text-muted-foreground">Volume (24h)</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Inflows (24h)</span>
                <span className="text-sm font-bold text-green-500">{formatCurrency(exchangeAnalytics.exchangeInflows24h)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Outflows (24h)</span>
                <span className="text-sm font-bold text-red-500">{formatCurrency(exchangeAnalytics.exchangeOutflows24h)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Flow</span>
                <span className={`text-sm font-bold ${exchangeAnalytics.netFlow > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(Math.abs(exchangeAnalytics.netFlow))} 
                  {exchangeAnalytics.netFlow > 0 ? ' ↑' : ' ↓'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Correlation Matrix */}
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Asset Correlation Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {correlationData.map((corr, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{corr.asset1}</Badge>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <Badge variant="outline">{corr.asset2}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Correlation</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${
                      corr.correlation > 0.7 ? 'text-red-500' : 
                      corr.correlation > 0.4 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {corr.correlation.toFixed(2)}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      corr.correlation > 0.7 ? 'bg-red-500' : 
                      corr.correlation > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-1">
                  <div 
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${corr.correlation * 100}%`,
                      backgroundColor: corr.correlation > 0.7 ? '#ef4444' : 
                                     corr.correlation > 0.4 ? '#f59e0b' : '#22c55e'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
