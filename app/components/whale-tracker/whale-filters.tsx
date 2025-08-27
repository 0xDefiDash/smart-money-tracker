
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Filter, Search, Calendar, DollarSign } from 'lucide-react'
import { useState } from 'react'

const cryptoOptions = ['All', 'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'MATIC', 'DOT', 'LINK', 'UNI', 'LTC']
const blockchainOptions = ['All', 'Bitcoin', 'Ethereum', 'BSC', 'Solana', 'Polygon', 'Avalanche']
const timeRanges = ['1H', '6H', '24H', '7D', '30D']

export function WhaleFilters() {
  const [selectedCrypto, setSelectedCrypto] = useState('All')
  const [selectedBlockchain, setSelectedBlockchain] = useState('All')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24H')
  const [minAmount, setMinAmount] = useState('1000000')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and Amount Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Address</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter wallet address or transaction hash..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Amount (USD)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Cryptocurrency Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Cryptocurrency</label>
          <div className="flex flex-wrap gap-2">
            {cryptoOptions.map((crypto) => (
              <Badge
                key={crypto}
                variant={selectedCrypto === crypto ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCrypto === crypto 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedCrypto(crypto)}
              >
                {crypto}
              </Badge>
            ))}
          </div>
        </div>

        {/* Blockchain Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Blockchain</label>
          <div className="flex flex-wrap gap-2">
            {blockchainOptions.map((blockchain) => (
              <Badge
                key={blockchain}
                variant={selectedBlockchain === blockchain ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedBlockchain === blockchain 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedBlockchain(blockchain)}
              >
                {blockchain}
              </Badge>
            ))}
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Time Range</label>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Badge
                key={range}
                variant={selectedTimeRange === range ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedTimeRange === range 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedTimeRange(range)}
              >
                {range}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">342</p>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">$2.1B</p>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">15</p>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
