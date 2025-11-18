
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, Loader2Icon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TokenSearchProps {
  onSearch: (tokenAddress: string, chain: string, timeframe: string) => void;
  isLoading?: boolean;
}

export function TokenSearch({ onSearch, isLoading = false }: TokenSearchProps) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [timeframe, setTimeframe] = useState('24h');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenAddress.trim()) {
      onSearch(tokenAddress.trim(), chain, timeframe);
    }
  };

  const popularTokens = [
    { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', chain: 'ethereum' },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'ethereum' },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', chain: 'ethereum' },
    { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', chain: 'ethereum' },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>🔍 Token Flow Intelligence Search</CardTitle>
        <CardDescription>
          Analyze token flows across Smart Money, Exchanges, Whales, and Fresh Wallets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Contract Address</Label>
            <Input
              id="tokenAddress"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chain">Blockchain</Label>
              <Select value={chain} onValueChange={setChain}>
                <SelectTrigger id="chain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="bnb">BNB Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Flow Intelligence...
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Analyze Token Flows
              </>
            )}
          </Button>
        </form>

        {/* Popular Tokens */}
        <div className="mt-6">
          <Label className="mb-2 block">Popular Tokens</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {popularTokens.map((token) => (
              <Button
                key={token.address}
                variant="outline"
                size="sm"
                onClick={() => {
                  setTokenAddress(token.address);
                  setChain(token.chain);
                }}
                className="justify-start"
              >
                {token.symbol}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
