

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react'

// Updated whale activity data for September 14, 2025
const volumeData = [
  { time: '00:00', volume: 78, count: 22 },
  { time: '04:00', volume: 64, count: 18 },
  { time: '08:00', volume: 156, count: 38 },
  { time: '12:00', volume: 234, count: 52 },
  { time: '16:00', volume: 189, count: 45 },
  { time: '20:00', volume: 123, count: 31 },
  { time: '24:00', volume: 145, count: 36 },
]

const blockchainData = [
  { name: 'Bitcoin', value: 44, color: '#F7931A' },
  { name: 'Ethereum', value: 33, color: '#627EEA' },
  { name: 'Solana', value: 16, color: '#9945FF' },
  { name: 'Base', value: 4, color: '#0052FF' },
  { name: 'TON', value: 2, color: '#0088CC' },
  { name: 'Other', value: 1, color: '#6B7280' },
]

const transactionSizeData = [
  { range: '$1M-5M', count: 216 },
  { range: '$5M-10M', count: 145 },
  { range: '$10M-50M', count: 102 },
  { range: '$50M-100M', count: 41 },
  { range: '$100M+', count: 34 },
]

export function WhaleCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Volume Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>24h Whale Activity Volume</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                          <p className="text-sm text-blue-500">
                            Volume: ${payload[0]?.value}M
                          </p>
                          <p className="text-sm text-green-500">
                            Transactions: {payload[1]?.value || 0}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#60B5FF"
                  strokeWidth={3}
                  dot={{ fill: '#60B5FF', r: 4 }}
                  activeDot={{ r: 6, fill: '#60B5FF' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF9149"
                  strokeWidth={2}
                  dot={{ fill: '#FF9149', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4" />
            <span>Blockchain Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={blockchainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {blockchainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{data?.name}</p>
                          <p className="text-sm">{data?.value}% of transactions</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {blockchainData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Size Distribution */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Transaction Size Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionSizeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="range" 
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
                          <p className="text-sm text-primary">
                            {payload[0]?.value} transactions
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#60B5FF" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
