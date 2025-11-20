
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Brain,
  Zap, 
  RefreshCw, 
  Wallet, 
  DollarSign,
  Radio,
  Clock,
  ExternalLink,
  Sparkles,
  Activity,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils';

interface SmartMoneyTrade {
  timestamp: string;
  walletAddress: string;
  walletLabel?: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  type: 'BUY' | 'SELL';
  amountUsd: number;
  amount: number;
  priceUsd: number;
  dex: string;
  txHash: string;
  chain: string;
}

interface SmartMoneyNetflow {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  netflow: number;
  inflow: number;
  outflow: number;
  smartMoneyCount: number;
  signal: 'STRONG_BUY' | 'MODERATE_BUY' | 'NEUTRAL' | 'MODERATE_SELL' | 'STRONG_SELL';
}

const SUPPORTED_CHAINS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'bnb', label: 'BNB Chain' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'solana', label: 'Solana' },
];

const TIMEFRAMES = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
];

export default function SmartMoneyTrackerPage() {
  const [chain, setChain] = useState('ethereum');
  const [timeframe, setTimeframe] = useState('1h');
  const [trades, setTrades] = useState<SmartMoneyTrade[]>([]);
  const [netflows, setNetflows] = useState<SmartMoneyNetflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newTradeIds, setNewTradeIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Stats calculation
  const stats = {
    totalBuys: trades.filter(t => t.type === 'BUY').length,
    totalSells: trades.filter(t => t.type === 'SELL').length,
    buyVolume: trades.filter(t => t.type === 'BUY').reduce((sum, t) => sum + t.amountUsd, 0),
    sellVolume: trades.filter(t => t.type === 'SELL').reduce((sum, t) => sum + t.amountUsd, 0),
    totalAccumulation: netflows.filter(n => n.netflow > 0).reduce((sum, n) => sum + n.netflow, 0),
    totalDistribution: Math.abs(netflows.filter(n => n.netflow < 0).reduce((sum, n) => sum + n.netflow, 0)),
  };

  // Fetch live data
  const fetchLiveData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);

      // Fetch DEX trades (live feed)
      const tradesResponse = await fetch(
        `/api/nansen/smart-money?action=dex-trades&chain=${chain}&timeframe=${timeframe}&limit=50`
      );
      const tradesResult = await tradesResponse.json();

      // Fetch netflows (for signals)
      const netflowsResponse = await fetch(
        `/api/nansen/smart-money?action=netflows&chain=${chain}&timeframe=${timeframe}&limit=10`
      );
      const netflowsResult = await netflowsResponse.json();

      if (tradesResult.success && tradesResult.data) {
        const newTrades = tradesResult.data;
        
        // Identify new trades for animation
        if (trades.length > 0 && showToast) {
          const existingTxHashes = new Set(trades.map(t => t.txHash));
          const newTxHashes = newTrades
            .filter((t: SmartMoneyTrade) => !existingTxHashes.has(t.txHash))
            .map((t: SmartMoneyTrade) => t.txHash);
          
          if (newTxHashes.length > 0) {
            setNewTradeIds(new Set(newTxHashes));
            setTimeout(() => setNewTradeIds(new Set()), 3000);
            toast.success(`${newTxHashes.length} new Smart Money trade${newTxHashes.length > 1 ? 's' : ''}!`, {
              icon: '⚡',
            });
          }
        }

        setTrades(newTrades);
      }

      if (netflowsResult.success && netflowsResult.data) {
        setNetflows(netflowsResult.data);
      }

      setLastUpdate(new Date());
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error: any) {
      console.error('[Smart Money Tracker] Error:', error);
      toast.error('Failed to fetch Smart Money data');
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLiveData();
  }, [chain, timeframe]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }

    autoRefreshRef.current = setInterval(() => {
      fetchLiveData(true);
    }, 15000); // 15 seconds for real-time streaming

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [chain, timeframe, trades]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MODERATE_BUY':
        return 'bg-green-500/10 text-green-300 border-green-500/20';
      case 'MODERATE_SELL':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'STRONG_SELL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
    }
  };

  const getExplorerUrl = (txHash: string, chain: string) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io/tx/',
      base: 'https://basescan.org/tx/',
      bnb: 'https://bscscan.com/tx/',
      polygon: 'https://polygonscan.com/tx/',
      arbitrum: 'https://arbiscan.io/tx/',
      optimism: 'https://optimistic.etherscan.io/tx/',
      solana: 'https://solscan.io/tx/',
    };
    return explorers[chain] + txHash;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Smart Money Live Feed
              </h1>
              <p className="text-sm text-muted-foreground">Real-time trades from top 5,000 performing wallets</p>
            </div>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 px-3 py-1.5">
              <Radio className="w-3 h-3 mr-1.5 animate-pulse" />
              LIVE
            </Badge>
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Nansen
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select value={chain} onValueChange={setChain}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchLiveData(true)}
                disabled={isRefreshing}
                className="border-primary/30 hover:bg-primary/10"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {lastUpdate && (
              <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1.5" />
                Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh: 15s
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                {stats.totalBuys}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.buyVolume)}
            </div>
            <div className="text-xs text-green-300/70">Total Buys</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <Badge variant="outline" className="border-red-500/30 text-red-400">
                {stats.totalSells}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(stats.sellVolume)}
            </div>
            <div className="text-xs text-red-300/70">Total Sells</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {netflows.filter(n => n.netflow > 0).length}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(stats.totalAccumulation)}
            </div>
            <div className="text-xs text-blue-300/70">Accumulation</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-orange-400" />
              <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                {netflows.filter(n => n.netflow < 0).length}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(stats.totalDistribution)}
            </div>
            <div className="text-xs text-orange-300/70">Distribution</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed (left side) */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Live Smart Money Trades</span>
                <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 ml-auto">
                  {trades.length} trades
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-400px)]" ref={scrollRef}>
                  <div className="space-y-3">
                    {trades.map((trade, idx) => {
                      const isNew = newTradeIds.has(trade.txHash);
                      return (
                        <div
                          key={trade.txHash || idx}
                          className={`p-4 rounded-lg border transition-all duration-500 ${
                            isNew
                              ? 'bg-yellow-500/20 border-yellow-500/50 animate-pulse'
                              : trade.type === 'BUY'
                              ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                              : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                          }`}
                        >
                          {/* Trade Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`${
                                  trade.type === 'BUY'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                } text-white`}
                              >
                                {trade.type}
                              </Badge>
                              <Badge variant="outline" className="border-primary/30">
                                {trade.tokenSymbol}
                              </Badge>
                              {trade.walletLabel && (
                                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs">
                                  {trade.walletLabel}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(new Date(trade.timestamp))}
                            </span>
                          </div>

                          {/* Trade Details */}
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Amount</div>
                              <div className="text-lg font-bold">
                                {formatCurrency(trade.amountUsd)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {trade.amount.toLocaleString()} {trade.tokenSymbol}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Price</div>
                              <div className="text-lg font-bold">
                                {formatCurrency(trade.priceUsd)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per {trade.tokenSymbol}
                              </div>
                            </div>
                          </div>

                          {/* Trade Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Wallet className="w-3 h-3" />
                              <span>{truncateAddress(trade.walletAddress)}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>{trade.dex}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => window.open(getExplorerUrl(trade.txHash, chain), '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View TX
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Signals (right side) */}
        <div className="lg:col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Top Signals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3">
                  {netflows.map((token, idx) => (
                    <div
                      key={token.tokenAddress || idx}
                      className="p-3 rounded-lg border border-primary/10 bg-card/30 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                          <span className="font-bold">{token.tokenSymbol}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getSignalColor(token.signal)}`}
                        >
                          {token.signal.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Netflow</span>
                          <span
                            className={`font-bold ${
                              token.netflow >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {token.netflow >= 0 ? '+' : ''}
                            {formatCurrency(token.netflow)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Wallets</span>
                          <span className="font-bold text-purple-400">
                            {token.smartMoneyCount}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-1 rounded bg-green-500/10 border border-green-500/20">
                          <div className="text-green-400 font-bold">
                            {formatCurrency(token.inflow)}
                          </div>
                          <div className="text-green-300/70">Inflow</div>
                        </div>
                        <div className="text-center p-1 rounded bg-red-500/10 border border-red-500/20">
                          <div className="text-red-400 font-bold">
                            {formatCurrency(token.outflow)}
                          </div>
                          <div className="text-red-300/70">Outflow</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
