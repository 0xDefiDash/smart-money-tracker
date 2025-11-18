
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Brain,
  Zap, 
  RefreshCw, 
  Wallet, 
  DollarSign,
  Search,
  Crown,
  Target,
  Activity,
  Flame,
  BarChart3,
  ArrowUpIcon,
  ArrowDownIcon,
  Clock,
  Award,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmartMoneyNetflow {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  chain: string;
  netflow: number;
  inflow: number;
  outflow: number;
  smartMoneyCount: number;
  priceUsd?: number;
  marketCap?: number;
}

interface SmartMoneyHolding {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  chain: string;
  totalHoldings: number;
  totalHoldingsUsd: number;
  smartMoneyCount: number;
  avgHoldingPerWallet: number;
}

interface DexTrade {
  timestamp: string;
  walletAddress: string;
  walletLabel?: string;
  tokenAddress: string;
  tokenSymbol: string;
  type: 'BUY' | 'SELL';
  amountUsd: number;
  amount: number;
  priceUsd: number;
  dex: string;
  txHash: string;
}

export default function SmartMoneyTrackerPage() {
  const [activeTab, setActiveTab] = useState('netflows');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Data states
  const [netflows, setNetflows] = useState<SmartMoneyNetflow[]>([]);
  const [holdings, setHoldings] = useState<SmartMoneyHolding[]>([]);
  const [dexTrades, setDexTrades] = useState<DexTrade[]>([]);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'netflow' | 'volume' | 'count'>('netflow');

  // Fetch Smart Money Netflows
  const fetchNetflows = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/nansen/smart-money?action=netflows&chain=${selectedChain}&timeframe=${timeframe}&limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setNetflows(data.data);
          setLastUpdate(new Date());
          toast.success(`✅ Loaded ${data.data.length} Smart Money netflows`);
        }
      } else {
        toast.error('Failed to fetch netflows');
      }
    } catch (error) {
      console.error('Error fetching netflows:', error);
      toast.error('Error fetching Smart Money data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Smart Money Holdings
  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/nansen/smart-money?action=holdings&chain=${selectedChain}&limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setHoldings(data.data);
          setLastUpdate(new Date());
          toast.success(`✅ Loaded ${data.data.length} holdings`);
        }
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      toast.error('Error fetching holdings data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch DEX Trades
  const fetchDexTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/nansen/smart-money?action=dex-trades&chain=${selectedChain}&timeframe=${timeframe}&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDexTrades(data.data);
          setLastUpdate(new Date());
          toast.success(`✅ Loaded ${data.data.length} DEX trades`);
        }
      }
    } catch (error) {
      console.error('Error fetching DEX trades:', error);
      toast.error('Error fetching trades data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on tab change or filter change
  useEffect(() => {
    if (activeTab === 'netflows') {
      fetchNetflows();
    } else if (activeTab === 'holdings') {
      fetchHoldings();
    } else if (activeTab === 'dex-trades') {
      fetchDexTrades();
    }
  }, [activeTab, selectedChain, timeframe]);

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  // Filter netflows
  const filteredNetflows = searchQuery
    ? netflows.filter(
        item =>
          item.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tokenName && item.tokenName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : netflows;

  // Sort netflows
  const sortedNetflows = [...filteredNetflows].sort((a, b) => {
    switch (sortBy) {
      case 'netflow':
        return Math.abs(b.netflow) - Math.abs(a.netflow);
      case 'volume':
        return (b.inflow + b.outflow) - (a.inflow + a.outflow);
      case 'count':
        return b.smartMoneyCount - a.smartMoneyCount;
      default:
        return Math.abs(b.netflow) - Math.abs(a.netflow);
    }
  });

  // Filter holdings
  const filteredHoldings = searchQuery
    ? holdings.filter(
        item =>
          item.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tokenName && item.tokenName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : holdings;

  // Filter DEX trades
  const filteredDexTrades = searchQuery
    ? dexTrades.filter(
        item =>
          item.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.walletLabel && item.walletLabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : dexTrades;

  // Calculate stats
  const totalAccumulation = netflows.filter(n => n.netflow > 0).reduce((sum, n) => sum + n.netflow, 0);
  const totalDistribution = netflows.filter(n => n.netflow < 0).reduce((sum, n) => sum + Math.abs(n.netflow), 0);
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.totalHoldingsUsd, 0);
  const totalDexVolume = dexTrades.reduce((sum, t) => sum + t.amountUsd, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 text-transparent bg-clip-text truncate">
              Smart Money Tracker
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                Track Top 5,000 Performing Wallets
              </p>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs whitespace-nowrap">
                <Activity className="h-2 w-2 mr-1 animate-pulse" />
                Powered by Nansen
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Total Accumulation</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {formatCurrency(totalAccumulation)}
                  </p>
                </div>
                <ArrowDownIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Total Distribution</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-400">
                    {formatCurrency(totalDistribution)}
                  </p>
                </div>
                <ArrowUpIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Holdings Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">
                    {formatCurrency(totalHoldingsValue)}
                  </p>
                </div>
                <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">DEX Volume</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">
                    {formatCurrency(totalDexVolume)}
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Blockchain</label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
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

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
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

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full bg-slate-800/50 h-auto gap-1 p-1">
          <TabsTrigger value="netflows" className="text-xs sm:text-sm py-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Netflows
          </TabsTrigger>
          <TabsTrigger value="holdings" className="text-xs sm:text-sm py-2">
            <Wallet className="h-4 w-4 mr-2" />
            Holdings
          </TabsTrigger>
          <TabsTrigger value="dex-trades" className="text-xs sm:text-sm py-2">
            <Activity className="h-4 w-4 mr-2" />
            DEX Trades
          </TabsTrigger>
        </TabsList>

        {/* Netflows Tab */}
        <TabsContent value="netflows" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Smart Money Netflows
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Tokens being accumulated (🟢) or distributed (🔴) by top 5,000 wallets
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNetflows()}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  variant={sortBy === 'netflow' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('netflow')}
                >
                  <Target className="h-3 w-3 mr-1" />
                  Net Flow
                </Button>
                <Button
                  variant={sortBy === 'volume' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('volume')}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Volume
                </Button>
                <Button
                  variant={sortBy === 'count' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('count')}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Wallet Count
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-12 w-12 text-purple-500 animate-spin mb-3" />
                  <p className="text-gray-400">Loading Smart Money data...</p>
                </div>
              ) : sortedNetflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No data available</h3>
                  <p className="text-sm text-gray-500">Try selecting a different chain or timeframe</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {sortedNetflows.map((item, index) => {
                      const isAccumulation = item.netflow > 0;
                      return (
                        <Card
                          key={`${item.tokenAddress}-${index}`}
                          className={`${
                            isAccumulation
                              ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20'
                              : 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/20'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <span className="text-xs text-gray-400">#{index + 1}</span>
                                {isAccumulation ? (
                                  <ArrowDownIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <ArrowUpIcon className="h-5 w-5 text-red-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-white text-lg">${item.tokenSymbol}</h3>
                                  {item.tokenName && (
                                    <span className="text-xs text-gray-400 truncate">{item.tokenName}</span>
                                  )}
                                  <Badge variant="outline" className="text-[10px]">
                                    {item.chain.toUpperCase()}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                  <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-gray-400">Net Flow</p>
                                    <p
                                      className={`text-sm font-bold ${
                                        isAccumulation ? 'text-green-400' : 'text-red-400'
                                      }`}
                                    >
                                      {isAccumulation ? '+' : ''}
                                      {formatCurrency(item.netflow)}
                                    </p>
                                  </div>
                                  <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-gray-400">Inflow</p>
                                    <p className="text-sm font-bold text-blue-400">
                                      {formatCurrency(item.inflow)}
                                    </p>
                                  </div>
                                  <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-gray-400">Outflow</p>
                                    <p className="text-sm font-bold text-orange-400">
                                      {formatCurrency(item.outflow)}
                                    </p>
                                  </div>
                                  <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-gray-400">Wallets</p>
                                    <p className="text-sm font-bold text-purple-400">
                                      {item.smartMoneyCount}
                                    </p>
                                  </div>
                                </div>

                                {item.priceUsd && (
                                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                    <span>Price: {formatCurrency(item.priceUsd)}</span>
                                    {item.marketCap && (
                                      <span>Market Cap: {formatCurrency(item.marketCap)}</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <Badge
                                  className={`text-[10px] ${
                                    isAccumulation
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                                  }`}
                                >
                                  {isAccumulation ? '🟢 ACCUMULATION' : '🔴 DISTRIBUTION'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    Smart Money Holdings
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Current token holdings of top 5,000 wallets
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchHoldings()}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-12 w-12 text-purple-500 animate-spin mb-3" />
                  <p className="text-gray-400">Loading holdings data...</p>
                </div>
              ) : filteredHoldings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No holdings found</h3>
                  <p className="text-sm text-gray-500">Try a different chain or search query</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredHoldings.map((item, index) => (
                      <Card key={`${item.tokenAddress}-${index}`} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-gray-400">#{index + 1}</span>
                              <Wallet className="h-5 w-5 text-blue-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white text-lg">${item.tokenSymbol}</h3>
                                {item.tokenName && (
                                  <span className="text-xs text-gray-400 truncate">{item.tokenName}</span>
                                )}
                                <Badge variant="outline" className="text-[10px]">
                                  {item.chain.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                <div className="bg-black/30 rounded p-2">
                                  <p className="text-[10px] text-gray-400">Total Value</p>
                                  <p className="text-sm font-bold text-green-400">
                                    {formatCurrency(item.totalHoldingsUsd)}
                                  </p>
                                </div>
                                <div className="bg-black/30 rounded p-2">
                                  <p className="text-[10px] text-gray-400">Total Holdings</p>
                                  <p className="text-sm font-bold text-blue-400">
                                    {formatNumber(item.totalHoldings)}
                                  </p>
                                </div>
                                <div className="bg-black/30 rounded p-2">
                                  <p className="text-[10px] text-gray-400">Smart Money Wallets</p>
                                  <p className="text-sm font-bold text-purple-400">
                                    {item.smartMoneyCount}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 text-xs text-gray-400">
                                Avg per wallet: {formatNumber(item.avgHoldingPerWallet)} (
                                {formatCurrency(item.totalHoldingsUsd / item.smartMoneyCount)})
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEX Trades Tab */}
        <TabsContent value="dex-trades" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Live DEX Trades
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Real-time trading activity from Smart Money wallets
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDexTrades()}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-12 w-12 text-purple-500 animate-spin mb-3" />
                  <p className="text-gray-400">Loading DEX trades...</p>
                </div>
              ) : filteredDexTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No trades found</h3>
                  <p className="text-sm text-gray-500">Try a different timeframe or chain</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {filteredDexTrades.map((trade, index) => {
                      const isBuy = trade.type === 'BUY';
                      return (
                        <Card
                          key={`${trade.txHash}-${index}`}
                          className={`${
                            isBuy
                              ? 'bg-gradient-to-r from-green-500/5 to-transparent border-green-500/10'
                              : 'bg-gradient-to-r from-red-500/5 to-transparent border-red-500/10'
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Badge
                                className={`${
                                  isBuy
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}
                              >
                                {trade.type}
                              </Badge>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-white">${trade.tokenSymbol}</span>
                                  <span className="text-xs text-gray-400">
                                    {formatNumber(trade.amount)} tokens
                                  </span>
                                  <span className="text-xs text-gray-400">@</span>
                                  <span className="text-xs text-gray-400">
                                    {formatCurrency(trade.priceUsd)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  {trade.walletLabel && (
                                    <>
                                      <span className="truncate max-w-[200px]">{trade.walletLabel}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>{trade.dex}</span>
                                  <span>•</span>
                                  <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-xs text-gray-400">Value</p>
                                  <p className={`text-lg font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(trade.amountUsd)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Alert */}
      <Alert className="mt-6 bg-indigo-500/10 border-indigo-500/20">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <AlertDescription className="text-indigo-300">
          <strong>About Smart Money:</strong> These are the top 5,000 highest-performing wallets globally,
          ranked by realized profit, win rate, and consistent performance across market cycles. Track what
          they're buying and selling to gain institutional-grade insights.
        </AlertDescription>
      </Alert>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50"
        size="icon"
        onClick={() => {
          if (activeTab === 'netflows') fetchNetflows();
          else if (activeTab === 'holdings') fetchHoldings();
          else if (activeTab === 'dex-trades') fetchDexTrades();
        }}
        title="Refresh data"
      >
        <RefreshCw className={`h-5 w-5 sm:h-6 sm:w-6 ${loading ? 'animate-spin' : ''}`} />
      </Button>

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 text-xs text-gray-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
          <Clock className="h-3 w-3 inline mr-1" />
          Updated {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
