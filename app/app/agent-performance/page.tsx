'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, DollarSign,
  Target, Shield, Zap, BarChart3, RefreshCw,
  Clock, Bot, Brain, Cpu, AlertCircle, Loader2,
  Wallet, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface AgentStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalVolume: number;
  avgTradeSize: number;
  totalCommissions: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
}

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  pnlPercent: number;
  leverage: number;
  liquidationPrice: number;
}

interface Trade {
  id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  value: number;
  pnl: number;
  commission: number;
  time: string;
}

interface PerformanceData {
  success: boolean;
  isConfigured: boolean;
  hasTradingData: boolean;
  account: {
    totalBalance: number;
    availableBalance: number;
    totalUnrealizedPnl: number;
    totalMarginUsed: number;
  };
  stats: AgentStats;
  positions: {
    activePositions: number;
    totalUnrealizedPnL: number;
    totalMarginUsed: number;
    positions: Position[];
  };
  recentTrades: Trade[];
  lastUpdated: string;
}

export default function AgentPerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/agents/stats');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to connect to trading API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading trading data...</p>
        </div>
      </div>
    );
  }

  // Not configured state
  if (data && !data.isConfigured) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">AsterDex API Not Configured</h2>
              <p className="text-gray-400 mb-6">
                To track agent trading performance, please configure your AsterDex API credentials in the environment variables.
              </p>
              <div className="bg-[#111] rounded-lg p-4 text-left text-sm font-mono text-gray-300">
                <p>ASTERDEX_API_KEY=your_api_key</p>
                <p>ASTERDEX_SECRET_KEY=your_secret_key</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No trading data yet - waiting state
  if (data && !data.hasTradingData) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Agent Performance Dashboard</h1>
                <p className="text-gray-400 text-sm">Powered by AsterDex</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="border-[#333] hover:bg-[#111]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Account Balance Card */}
        {data.account && (
          <Card className="bg-[#0a0a0a] border-[#1a1a1a] mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Balance</div>
                  <div className="text-2xl font-bold">{formatCurrency(data.account.totalBalance)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Available</div>
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(data.account.availableBalance)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Margin Used</div>
                  <div className="text-2xl font-bold text-orange-400">{formatCurrency(data.account.totalMarginUsed)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Unrealized PnL</div>
                  <div className={`text-2xl font-bold ${data.account.totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(data.account.totalUnrealizedPnl)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waiting for trades */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 relative">
              <Bot className="w-12 h-12 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-300 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Agents Ready & Standing By</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Your Defidash trading agents are connected to AsterDex and ready to execute trades. 
              Performance metrics will appear here once trading begins.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-5 h-5 text-green-500" />
                </div>
                <div className="font-medium mb-1">Account Connected</div>
                <div className="text-sm text-gray-500">AsterDex API verified</div>
              </div>
              <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-5 h-5 text-blue-500" />
                </div>
                <div className="font-medium mb-1">Agents Online</div>
                <div className="text-sm text-gray-500">6 agents active</div>
              </div>
              <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="font-medium mb-1">Awaiting Trades</div>
                <div className="text-sm text-gray-500">No trades yet</div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Go to <a href="/agentic-trading" className="text-blue-400 hover:underline">Agentic Trading</a> to start trading with AI agents
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has trading data - show full dashboard
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Agent Performance Dashboard</h1>
              <p className="text-gray-400 text-sm">Live AsterDex trading analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="border-[#333] hover:bg-[#111]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        {data?.lastUpdated && (
          <p className="text-xs text-gray-500">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
        )}
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Total Balance
            </div>
            <div className="text-xl font-bold">{formatCurrency(data?.account?.totalBalance || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Total PnL
            </div>
            <div className={`text-xl font-bold ${(data?.stats?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data?.stats?.totalPnL || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Activity className="w-3.5 h-3.5" />
              Unrealized PnL
            </div>
            <div className={`text-xl font-bold ${(data?.account?.totalUnrealizedPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data?.account?.totalUnrealizedPnl || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Target className="w-3.5 h-3.5" />
              Win Rate
            </div>
            <div className="text-xl font-bold text-blue-400">{(data?.stats?.winRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Total Trades
            </div>
            <div className="text-xl font-bold">{data?.stats?.totalTrades || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5" />
              Active Positions
            </div>
            <div className="text-xl font-bold text-cyan-400">{data?.positions?.activePositions || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Shield className="w-3.5 h-3.5" />
              Profit Factor
            </div>
            <div className="text-xl font-bold text-purple-400">{(data?.stats?.profitFactor || 0).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Avg Trade Size
            </div>
            <div className="text-xl font-bold">{formatCurrency(data?.stats?.avgTradeSize || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Win/Loss Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Winning Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400 mb-2">{data?.stats?.winningTrades || 0}</div>
            <div className="text-sm text-gray-400">Best: {formatCurrency(data?.stats?.bestTrade || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Losing Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-400 mb-2">{data?.stats?.losingTrades || 0}</div>
            <div className="text-sm text-gray-400">Worst: {formatCurrency(data?.stats?.worstTrade || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{formatCurrency(data?.stats?.totalVolume || 0)}</div>
            <div className="text-sm text-gray-400">Commissions: {formatCurrency(data?.stats?.totalCommissions || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      {data?.positions?.positions && data.positions.positions.length > 0 && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Active Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-[#222]">
                    <th className="text-left py-3 px-2 font-medium">Symbol</th>
                    <th className="text-left py-3 px-2 font-medium">Side</th>
                    <th className="text-right py-3 px-2 font-medium">Size</th>
                    <th className="text-right py-3 px-2 font-medium">Entry</th>
                    <th className="text-right py-3 px-2 font-medium">Mark</th>
                    <th className="text-right py-3 px-2 font-medium">PnL</th>
                    <th className="text-right py-3 px-2 font-medium">PnL %</th>
                    <th className="text-right py-3 px-2 font-medium">Leverage</th>
                    <th className="text-right py-3 px-2 font-medium">Liq. Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.positions.positions.map((pos, idx) => (
                    <tr key={idx} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                      <td className="py-3 px-2 font-mono font-medium">{pos.symbol}</td>
                      <td className="py-3 px-2">
                        <Badge className={`text-xs ${pos.side === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {pos.side}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono">{pos.size}</td>
                      <td className="py-3 px-2 text-right font-mono">${pos.entryPrice.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-mono">${pos.markPrice.toLocaleString()}</td>
                      <td className={`py-3 px-2 text-right font-mono font-semibold ${pos.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(pos.unrealizedPnl)}
                      </td>
                      <td className={`py-3 px-2 text-right font-mono ${pos.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(pos.pnlPercent)}
                      </td>
                      <td className="py-3 px-2 text-right">{pos.leverage}x</td>
                      <td className="py-3 px-2 text-right font-mono text-orange-400">${pos.liquidationPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trades Table */}
      <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Recent Trade History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentTrades && data.recentTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-[#222]">
                    <th className="text-left py-3 px-2 font-medium">Time</th>
                    <th className="text-left py-3 px-2 font-medium">Symbol</th>
                    <th className="text-left py-3 px-2 font-medium">Side</th>
                    <th className="text-right py-3 px-2 font-medium">Price</th>
                    <th className="text-right py-3 px-2 font-medium">Qty</th>
                    <th className="text-right py-3 px-2 font-medium">Value</th>
                    <th className="text-right py-3 px-2 font-medium">PnL</th>
                    <th className="text-right py-3 px-2 font-medium">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                      <td className="py-3 px-2 text-gray-400 text-xs">
                        {new Date(trade.time).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-mono font-medium">{trade.symbol}</td>
                      <td className="py-3 px-2">
                        <Badge className={`text-xs ${trade.side === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {trade.side}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono">${trade.price.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-mono">{trade.quantity}</td>
                      <td className="py-3 px-2 text-right font-mono">{formatCurrency(trade.value)}</td>
                      <td className={`py-3 px-2 text-right font-mono font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trade.pnl)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-500">
                        {formatCurrency(trade.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No trade history available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
