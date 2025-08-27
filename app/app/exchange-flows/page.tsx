
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { useState, useEffect } from 'react'

// Updated exchange flow data with current August 2025 values
const mockExchangeFlows = [
  { 
    exchange: 'Binance', 
    inflow: 2850000000, 
    outflow: 2120000000, 
    net: 730000000,
    volume24h: 15800000000,
    marketShare: 32.5,
    assets: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'],
    status: 'normal'
  },
  { 
    exchange: 'Coinbase', 
    inflow: 1890000000, 
    outflow: 2340000000, 
    net: -450000000,
    volume24h: 8900000000,
    marketShare: 18.3,
    assets: ['BTC', 'ETH', 'USDC', 'SOL', 'ADA'],
    status: 'outflow'
  },
  { 
    exchange: 'Kraken', 
    inflow: 890000000, 
    outflow: 650000000, 
    net: 240000000,
    volume24h: 3200000000,
    marketShare: 6.8,
    assets: ['BTC', 'ETH', 'XRP', 'DOT', 'ADA'],
    status: 'normal'
  },
  { 
    exchange: 'Bitfinex', 
    inflow: 567000000, 
    outflow: 720000000, 
    net: -153000000,
    volume24h: 2100000000,
    marketShare: 4.2,
    assets: ['BTC', 'ETH', 'USDT', 'LTC'],
    status: 'outflow'
  },
  { 
    exchange: 'Huobi', 
    inflow: 432000000, 
    outflow: 380000000, 
    net: 52000000,
    volume24h: 1800000000,
    marketShare: 3.7,
    assets: ['BTC', 'ETH', 'USDT', 'TRX'],
    status: 'normal'
  },
  { 
    exchange: 'KuCoin', 
    inflow: 654000000, 
    outflow: 890000000, 
    net: -236000000,
    volume24h: 2800000000,
    marketShare: 5.9,
    assets: ['BTC', 'ETH', 'KCS', 'USDT'],
    status: 'alert'
  }
]

// Historical flow data for trends
const historicalFlowData = [
  { time: '00:00', totalInflow: 6.2, totalOutflow: 5.8 },
  { time: '04:00', totalInflow: 5.9, totalOutflow: 6.1 },
  { time: '08:00', totalInflow: 6.8, totalOutflow: 6.3 },
  { time: '12:00', totalInflow: 7.2, totalOutflow: 6.9 },
  { time: '16:00', totalInflow: 6.9, totalOutflow: 7.1 },
  { time: '20:00', totalInflow: 7.5, totalOutflow: 6.7 },
  { time: '24:00', totalInflow: 7.3, totalOutflow: 7.0 },
]

const colors = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  alert: '#f59e0b'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'text-green-500'
    case 'outflow': return 'text-yellow-500'
    case 'alert': return 'text-red-500'
    default: return 'text-gray-500'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'normal': return Activity
    case 'outflow': return TrendingDown
    case 'alert': return AlertTriangle
    default: return Activity
  }
}

export default function ExchangeFlowsPage() {
  const [lastUpdated, setLastUpdated] = useState('--:--:--')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24H')

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    
    updateTime() // Initial update
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  const chartData = mockExchangeFlows.map(flow => ({
    ...flow,
    absNet: Math.abs(flow.net),
    color: flow.status === 'alert' ? colors.alert : 
           flow.net > 0 ? colors.positive : 
           flow.net < 0 ? colors.negative : colors.neutral
  }))

  const totalInflow = mockExchangeFlows.reduce((sum, flow) => sum + flow.inflow, 0)
  const totalOutflow = mockExchangeFlows.reduce((sum, flow) => sum + flow.outflow, 0)
  const netFlow = totalInflow - totalOutflow

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-primary" />
            <span>Exchange Flows</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor cryptocurrency inflows and outflows across major exchanges
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Total Inflows</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalInflow)}</p>
            <p className="text-xs text-green-500 mt-1">+12.5% vs yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowDownIcon className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Total Outflows</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalOutflow)}</p>
            <p className="text-xs text-red-500 mt-1">+8.2% vs yesterday</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netFlow > 0 ? 'from-green-500/10 to-green-600/5 border-green-500/20' : 'from-red-500/10 to-red-600/5 border-red-500/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`w-4 h-4 ${netFlow > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-medium text-muted-foreground">Net Flow</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(Math.abs(netFlow))}</p>
            <p className={`text-xs mt-1 ${netFlow > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netFlow > 0 ? 'Net Inflow' : 'Net Outflow'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Active Exchanges</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{mockExchangeFlows.length}</p>
            <p className="text-xs text-blue-500 mt-1">2 showing alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Flow Trends Chart */}
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Flow Trends - Last 24H</span>
            </CardTitle>
            <div className="flex space-x-2">
              {['24H', '7D', '30D'].map((range) => (
                <Badge
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalFlowData}>
                <defs>
                  <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-sm text-green-500">
                            Inflow: ${payload[0]?.value}B
                          </p>
                          <p className="text-sm text-red-500">
                            Outflow: ${payload[1]?.value}B
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalInflow"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#inflowGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="totalOutflow"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#outflowGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Flow Details */}
      <Card className="bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Exchange Flow Details</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">24h Net Flow</div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="exchange" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium mb-2">{data?.exchange}</p>
                          <p className="text-xs text-green-500">
                            Inflow: {formatCurrency(data?.inflow || 0)}
                          </p>
                          <p className="text-xs text-red-500">
                            Outflow: {formatCurrency(data?.outflow || 0)}
                          </p>
                          <p className="text-xs font-medium">
                            Net: {formatCurrency(data?.net || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Market Share: {data?.marketShare}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="absNet" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Exchange Details List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockExchangeFlows.map((flow) => {
              const isPositive = flow.net > 0
              const StatusIcon = getStatusIcon(flow.status)
              
              return (
                <Card key={flow.exchange} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {flow.exchange.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{flow.exchange}</p>
                        <p className="text-xs text-muted-foreground">
                          {flow.marketShare}% market share
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(flow.status)}`} />
                      <Badge 
                        variant={flow.status === 'alert' ? 'destructive' : 
                                flow.status === 'outflow' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {flow.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Inflow:</span>
                      <span className="text-green-500 font-medium">{formatCurrency(flow.inflow)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Outflow:</span>
                      <span className="text-red-500 font-medium">{formatCurrency(flow.outflow)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-muted-foreground">Net Flow:</span>
                      <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(Math.abs(flow.net))} {isPositive ? '↑' : '↓'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">24h Volume:</span>
                      <span className="font-medium">{formatCurrency(flow.volume24h)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Top Assets:</p>
                    <div className="flex flex-wrap gap-1">
                      {flow.assets.map((asset) => (
                        <Badge key={asset} variant="outline" className="text-xs">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
