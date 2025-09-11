
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

// Updated exchange flow data for September 11, 2025
const mockExchangeFlows = [
  { exchange: 'Binance', inflow: 378000000, outflow: 289000000, net: 89000000 },
  { exchange: 'Coinbase', inflow: 267000000, outflow: 234000000, net: 33000000 },
  { exchange: 'Bybit', inflow: 198000000, outflow: 245000000, net: -47000000 },
  { exchange: 'OKX', inflow: 145000000, outflow: 112000000, net: 33000000 },
  { exchange: 'Kraken', inflow: 123000000, outflow: 98000000, net: 25000000 },
  { exchange: 'Gate.io', inflow: 89000000, outflow: 106000000, net: -17000000 },
  { exchange: 'KuCoin', inflow: 78000000, outflow: 95000000, net: -17000000 },
  { exchange: 'HTX', inflow: 67000000, outflow: 54000000, net: 13000000 },
]

const colors = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280'
}

export function ExchangeFlows() {
  const chartData = mockExchangeFlows.map(flow => ({
    ...flow,
    absNet: Math.abs(flow.net),
    color: flow.net > 0 ? colors.positive : flow.net < 0 ? colors.negative : colors.neutral
  }))

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span>Exchange Flows</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">24h Net Flow</div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-32">
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
          {mockExchangeFlows.map((flow, index) => {
            const isPositive = flow.net > 0
            
            return (
              <div key={flow.exchange} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {flow.exchange.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{flow.exchange}</p>
                    <p className="text-xs text-muted-foreground">
                      In: {formatNumber(flow.inflow)} • Out: {formatNumber(flow.outflow)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${
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
                    {isPositive ? 'Inflow' : flow.net < 0 ? 'Outflow' : 'Neutral'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
