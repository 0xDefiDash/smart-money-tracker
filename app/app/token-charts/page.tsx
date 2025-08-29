
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, ExternalLink, Copy } from 'lucide-react'

interface Token {
  symbol: string
  name: string
  address: string
  chain: string
  price: number
  change: number
}

const popularTokens: Token[] = [
  {
    symbol: 'PEPE',
    name: 'Pepe',
    address: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    chain: 'eth',
    price: 0.00000891,
    change: 12.4
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    chain: 'sol',
    price: 0.0000234,
    change: -5.2
  }
]

const chains = [
  { value: 'eth', label: 'Ethereum' },
  { value: 'sol', label: 'Solana' },
  { value: 'blast', label: 'Blast' }
]

export default function TokenChartsPage() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [selectedChain, setSelectedChain] = useState('eth')
  const [manualAddress, setManualAddress] = useState('')
  const [theme, setTheme] = useState('dark')
  const [interval, setInterval] = useState('15')

  const handleManualSearch = () => {
    if (!manualAddress.trim()) return
    
    const token: Token = {
      symbol: 'TOKEN',
      name: 'Custom Token',
      address: manualAddress,
      chain: selectedChain,
      price: 0,
      change: 0
    }
    
    setSelectedToken(token)
  }

  const getChartUrl = () => {
    if (!selectedToken) return ''
    return `https://www.gmgn.cc/kline/${selectedToken.chain}/${selectedToken.address}?theme=${theme}&interval=${interval}`
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Token Charts
          </h1>
          <p className="text-muted-foreground">Search and analyze token price charts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Tokens</CardTitle>
          <CardDescription>Enter a contract address to view its chart</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chains.map((chain) => (
                  <SelectItem key={chain.value} value={chain.value}>
                    {chain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter token contract address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleManualSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularTokens.map((token) => (
              <div
                key={token.address}
                onClick={() => setSelectedToken(token)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                  </div>
                  <Badge variant={token.change >= 0 ? "default" : "destructive"}>
                    {token.change >= 0 ? '+' : ''}{token.change.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedToken && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedToken.symbol}</CardTitle>
                <CardDescription>{selectedToken.name}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1m</SelectItem>
                    <SelectItem value="5">5m</SelectItem>
                    <SelectItem value="15">15m</SelectItem>
                    <SelectItem value="60">1h</SelectItem>
                    <SelectItem value="1D">1D</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getChartUrl(), '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px] border rounded-lg overflow-hidden">
              <iframe
                src={getChartUrl()}
                className="w-full h-full"
                frameBorder="0"
                title={`${selectedToken.symbol} Chart`}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
