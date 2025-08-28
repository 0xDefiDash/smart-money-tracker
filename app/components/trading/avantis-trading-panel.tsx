
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'

interface TradingPair {
  pair: string
  feed_id: string
}

interface PriceData {
  pair: string
  data: any
}

interface TradeRequest {
  pair: string
  side: 'buy' | 'sell'
  size: number
  leverage?: number
  take_profit?: number
  stop_loss?: number
}

export function AvantisTradingPanel() {
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([])
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [serviceHealth, setServiceHealth] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [tradeLoading, setTradeLoading] = useState(false)

  // Form state
  const [selectedPair, setSelectedPair] = useState<string>('')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [size, setSize] = useState<string>('0.1')
  const [leverage, setLeverage] = useState<string>('1')
  const [takeProfit, setTakeProfit] = useState<string>('')
  const [stopLoss, setStopLoss] = useState<string>('')

  // Check service health
  const checkServiceHealth = async () => {
    try {
      const response = await fetch('/api/avantis/health')
      if (response.ok) {
        const data = await response.json()
        setServiceHealth(data.status === 'healthy')
      } else {
        setServiceHealth(false)
      }
    } catch (error) {
      console.error('Service health check failed:', error)
      setServiceHealth(false)
    }
  }

  // Fetch trading pairs
  const fetchTradingPairs = async () => {
    try {
      const response = await fetch('/api/avantis/pairs')
      if (response.ok) {
        const data = await response.json()
        setTradingPairs(data.pairs || [])
        if (data.pairs?.length > 0 && !selectedPair) {
          setSelectedPair(data.pairs[0].pair)
        }
      }
    } catch (error) {
      console.error('Failed to fetch trading pairs:', error)
      toast.error('Failed to load trading pairs')
    }
  }

  // Fetch current prices
  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/avantis/prices')
      if (response.ok) {
        const data = await response.json()
        setPrices(data.prices || {})
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    }
  }

  // Submit trade
  const handleTrade = async () => {
    if (!selectedPair || !size) {
      toast.error('Please fill in all required fields')
      return
    }

    setTradeLoading(true)
    try {
      const tradeRequest: TradeRequest = {
        pair: selectedPair,
        side,
        size: parseFloat(size),
        leverage: leverage ? parseFloat(leverage) : undefined,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
      }

      const response = await fetch('/api/avantis/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeRequest),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Trade ${data.trade?.status || 'submitted'} successfully!`)
        
        // Reset form
        setSize('0.1')
        setLeverage('1')
        setTakeProfit('')
        setStopLoss('')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to submit trade')
      }
    } catch (error) {
      console.error('Trade submission failed:', error)
      toast.error('Failed to submit trade')
    } finally {
      setTradeLoading(false)
    }
  }

  // Subscribe to price feed
  const subscribeToPriceFeed = async (pair: string) => {
    try {
      const response = await fetch('/api/avantis/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pair }),
      })

      if (response.ok) {
        toast.success(`Subscribed to ${pair} price feed`)
      }
    } catch (error) {
      console.error('Failed to subscribe to price feed:', error)
    }
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await checkServiceHealth()
      await fetchTradingPairs()
      await fetchPrices()
      setLoading(false)
    }

    initializeData()

    // Set up price refresh interval
    const interval = setInterval(() => {
      if (serviceHealth) {
        fetchPrices()
      }
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [serviceHealth])

  // Subscribe to price feed when pair changes
  useEffect(() => {
    if (selectedPair && serviceHealth) {
      subscribeToPriceFeed(selectedPair)
    }
  }, [selectedPair, serviceHealth])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 animate-spin" />
            <span>Loading Avantis Trading...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Initializing trading interface...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Avantis Trading Service</span>
            </span>
            <Badge variant={serviceHealth ? "default" : "destructive"} className="flex items-center space-x-1">
              {serviceHealth ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>{serviceHealth ? 'Online' : 'Offline'}</span>
            </Badge>
          </CardTitle>
          {!serviceHealth && (
            <CardDescription className="text-amber-600">
              Avantis service is not available. Please ensure the Python service is running on port 8001.
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {serviceHealth && (
        <>
          {/* Price Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Live Prices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tradingPairs.map((pair) => (
                  <div key={pair.pair} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{pair.pair}</h3>
                      <Badge variant="outline" className="text-xs">Live</Badge>
                    </div>
                    {prices[pair.pair] ? (
                      <div className="space-y-1">
                        <div className="text-lg font-mono">
                          {typeof prices[pair.pair].data === 'object' && prices[pair.pair].data !== null 
                            ? JSON.stringify(prices[pair.pair].data).substring(0, 50) + '...'
                            : String(prices[pair.pair].data)}
                        </div>
                        <div className="text-xs text-muted-foreground">Updated</div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">No price data</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trading Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Place Trade</CardTitle>
              <CardDescription>
                Create a new trading position (Currently in simulation mode)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pair">Trading Pair</Label>
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradingPairs.map((pair) => (
                        <SelectItem key={pair.pair} value={pair.pair}>
                          {pair.pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="side">Side</Label>
                  <Select value={side} onValueChange={(value: 'buy' | 'sell') => setSide(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>Buy</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sell">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span>Sell</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.01"
                    placeholder="0.1"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leverage">Leverage</Label>
                  <Input
                    id="leverage"
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="take-profit">Take Profit (Optional)</Label>
                  <Input
                    id="take-profit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop-loss">Stop Loss (Optional)</Label>
                  <Input
                    id="stop-loss"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleTrade} 
                disabled={tradeLoading || !selectedPair || !size}
                className="w-full"
                size="lg"
              >
                {tradeLoading ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Trade...
                  </>
                ) : (
                  <>
                    {side === 'buy' ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                    Place {side.toUpperCase()} Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
