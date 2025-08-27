
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { useState } from 'react'

// Mock chart data
const marketCapData = [
  { time: '00:00', value: 2.40, volume: 85 },
  { time: '04:00', value: 2.42, volume: 78 },
  { time: '08:00', value: 2.38, volume: 92 },
  { time: '12:00', value: 2.45, volume: 105 },
  { time: '16:00', value: 2.48, volume: 98 },
  { time: '20:00', value: 2.47, volume: 89 },
  { time: '24:00', value: 2.49, volume: 112 },
]

const priceData = {
  btc: [
    { time: '00:00', price: 42000 },
    { time: '04:00', price: 42150 },
    { time: '08:00', price: 41900 },
    { time: '12:00', price: 42300 },
    { time: '16:00', price: 42500 },
    { time: '20:00', price: 42450 },
    { time: '24:00', price: 42650 },
  ],
  eth: [
    { time: '00:00', price: 2500 },
    { time: '04:00', price: 2520 },
    { time: '08:00', price: 2480 },
    { time: '12:00', price: 2540 },
    { time: '16:00', price: 2580 },
    { time: '20:00', price: 2560 },
    { time: '24:00', price: 2590 },
  ]
}

const timeRanges = ['24H', '7D', '30D', '90D', '1Y']

export function MarketCharts() {
  const [selectedChart, setSelectedChart] = useState('market-cap')
  const [selectedCrypto, setSelectedCrypto] = useState('btc')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24H')

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span>Market Charts</span>
        </CardTitle>
        
        {/* Chart Type Selector */}
        <div className="flex space-x-2">
          <Badge
            variant={selectedChart === 'market-cap' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedChart('market-cap')}
          >
            Total Market Cap
          </Badge>
          <Badge
            variant={selectedChart === 'prices' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedChart('prices')}
          >
            Price Charts
          </Badge>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
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
      </CardHeader>

      <CardContent>
        {selectedChart === 'market-cap' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Total Cryptocurrency Market Cap</h3>
              <div className="text-sm text-muted-foreground">$2.49T (+3.75%)</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketCapData}>
                  <defs>
                    <linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60B5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60B5FF" stopOpacity={0.05}/>
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
                            <p className="text-sm text-primary">
                              Market Cap: ${payload[0]?.value}T
                            </p>
                            <p className="text-sm text-green-500">
                              Volume: ${payload[1]?.value || 0}B
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#60B5FF"
                    strokeWidth={2}
                    fill="url(#marketCapGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge
                variant={selectedCrypto === 'btc' ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCrypto('btc')}
              >
                BTC
              </Badge>
              <Badge
                variant={selectedCrypto === 'eth' ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCrypto('eth')}
              >
                ETH
              </Badge>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData[selectedCrypto as keyof typeof priceData]}>
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
                            <p className="text-sm text-primary">
                              Price: ${payload[0]?.value?.toLocaleString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={selectedCrypto === 'btc' ? '#F7931A' : '#627EEA'}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: selectedCrypto === 'btc' ? '#F7931A' : '#627EEA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {selectedCrypto === 'btc' ? 'Bitcoin' : 'Ethereum'} Price - Last 24 Hours
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
