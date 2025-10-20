

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowUpIcon, ArrowDownIcon, RefreshCw } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Badge } from '@/components/ui/badge'

// Enhanced exchange flow data for October 20, 2025
const generateExchangeFlows = () => [
  { 
    exchange: 'Binance', 
    inflow: 512000000, 
    outflow: 378000000, 
    net: 134000000,
    volume_24h: 1980000000,
    dominant_asset: 'BTC',
    trend: 'increasing'
  },
  { 
    exchange: 'Coinbase', 
    inflow: 356000000, 
    outflow: 298000000, 
    net: 58000000,
    volume_24h: 1120000000,
    dominant_asset: 'ETH',
    trend: 'stable'
  },
  { 
    exchange: 'Bybit', 
    inflow: 298000000, 
    outflow: 342000000, 
    net: -44000000,
    volume_24h: 1680000000,
    dominant_asset: 'SOL',
    trend: 'decreasing'
  },
  { 
    exchange: 'OKX', 
    inflow: 234000000, 
    outflow: 189000000, 
    net: 45000000,
    volume_24h: 945000000,
    dominant_asset: 'BTC',
    trend: 'increasing'
  },
  { 
    exchange: 'Kraken', 
    inflow: 187000000, 
    outflow: 145000000, 
    net: 42000000,
    volume_24h: 578000000,
    dominant_asset: 'ETH',
    trend: 'increasing'
  },
  { 
    exchange: 'Gate.io', 
    inflow: 124000000, 
    outflow: 167000000, 
    net: -43000000,
    volume_24h: 678000000,
    dominant_asset: 'USDT',
    trend: 'decreasing'
  },
  { 
    exchange: 'KuCoin', 
    inflow: 112000000, 
    outflow: 134000000, 
    net: -22000000,
    volume_24h: 456000000,
    dominant_asset: 'BNB',
    trend: 'decreasing'
  },
  { 
    exchange: 'HTX', 
    inflow: 98000000, 
    outflow: 78000000, 
    net: 20000000,
    volume_24h: 367000000,
    dominant_asset: 'TRX',
    trend: 'stable'
  },
  { 
    exchange: 'Bitget', 
    inflow: 84000000, 
    outflow: 56000000, 
    net: 28000000,
    volume_24h: 298000000,
    dominant_asset: 'TON',
    trend: 'increasing'
  },
  { 
    exchange: 'MEXC', 
    inflow: 67000000, 
    outflow: 82000000, 
    net: -15000000,
    volume_24h: 234000000,
    dominant_asset: 'SUI',
    trend: 'stable'
  }
];

const colors = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280'
}

export function ExchangeFlows() {
  const [exchangeFlows, setExchangeFlows] = useState(generateExchangeFlows());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial lastUpdate on client
    setLastUpdate(new Date());
    
    // Update flows every 90 seconds to simulate real-time data
    const interval = setInterval(() => {
      setExchangeFlows(generateExchangeFlows());
      setLastUpdate(new Date());
    }, 90000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setExchangeFlows(generateExchangeFlows());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const chartData = exchangeFlows.map(flow => ({
    ...flow,
    absNet: Math.abs(flow.net),
    color: flow.net > 0 ? colors.positive : flow.net < 0 ? colors.negative : colors.neutral
  }));

  const totalNetInflow = exchangeFlows.reduce((sum, flow) => sum + Math.max(0, flow.net), 0);
  const totalNetOutflow = exchangeFlows.reduce((sum, flow) => sum + Math.abs(Math.min(0, flow.net)), 0);
  const netBalance = totalNetInflow - totalNetOutflow;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span>Exchange Flows</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">24h Net Flow</div>
            <div className={`text-sm font-medium ${
              netBalance > 0 ? 'text-green-500' : netBalance < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formatCurrency(Math.abs(netBalance))}
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-muted-foreground">Total Inflows</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(totalNetInflow)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-xs text-muted-foreground">Total Outflows</p>
            <p className="text-sm font-semibold text-red-600">
              {formatCurrency(totalNetOutflow)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Net Balance</p>
            <p className={`text-sm font-semibold ${
              netBalance > 0 ? 'text-green-600' : netBalance < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40">
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
                          Volume: {formatCurrency(data?.volume_24h || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Top Asset: {data?.dominant_asset}
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

        {/* Exchange Details */}
        <div className="space-y-3">
          {exchangeFlows.map((flow, index) => {
            const isPositive = flow.net > 0
            const trendColor = flow.trend === 'increasing' ? 'text-green-500' : 
                              flow.trend === 'decreasing' ? 'text-red-500' : 'text-gray-500';
            
            return (
              <div key={flow.exchange} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {flow.exchange.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm text-foreground">{flow.exchange}</p>
                      <Badge variant="outline" className="text-xs">
                        {flow.dominant_asset}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vol: {formatNumber(flow.volume_24h)} • {flow.trend} trend
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    isPositive ? 'text-green-500' : flow.net < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {isPositive ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : flow.net < 0 ? (
                      <ArrowDownIcon className="w-3 h-3" />
                    ) : null}
                    <span className="font-medium text-sm">
                      {formatCurrency(Math.abs(flow.net))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPositive ? 'Net Inflow' : flow.net < 0 ? 'Net Outflow' : 'Neutral'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Last Updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}</span>
            <span>Auto-refresh every 90s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
