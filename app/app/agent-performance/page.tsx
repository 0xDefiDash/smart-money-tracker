'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, DollarSign,
  Target, Shield, Zap, BarChart3, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  XCircle, AlertTriangle, Bot, Brain, Cpu
} from 'lucide-react';

// Types
interface AgentStats {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'paused';
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  avgTradeReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  activeTrades: number;
  avgHoldTime: string;
  lastTradeTime: string;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  totalTrades: number;
  activeTrades: number;
  winRate: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  avgTradeSize: number;
  profitFactor: number;
  calmarRatio: number;
  riskAdjustedReturn: number;
}

interface TradeRecord {
  id: string;
  agent: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  pnl?: number;
  pnlPercent?: number;
  status: 'open' | 'closed' | 'pending';
  openTime: string;
  closeTime?: string;
  duration?: string;
}

// Mock data generators
const generateEquityCurve = () => {
  const data = [];
  let value = 100000;
  const now = new Date();
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.45) * 3000;
    value = Math.max(80000, value + change);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
      benchmark: 100000 + (90 - i) * 150 + Math.random() * 2000
    });
  }
  return data;
};

const generateDailyReturns = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      return: (Math.random() - 0.45) * 8,
      cumulative: 0
    });
  }
  let cum = 0;
  data.forEach(d => {
    cum += d.return;
    d.cumulative = cum;
  });
  return data;
};

const generateTradeDistribution = () => [
  { range: '-10%+', count: 3, color: '#ef4444' },
  { range: '-5% to -10%', count: 8, color: '#f97316' },
  { range: '-2% to -5%', count: 15, color: '#eab308' },
  { range: '-2% to 0%', count: 22, color: '#84cc16' },
  { range: '0% to 2%', count: 28, color: '#22c55e' },
  { range: '2% to 5%', count: 18, color: '#10b981' },
  { range: '5% to 10%', count: 12, color: '#14b8a6' },
  { range: '10%+', count: 6, color: '#06b6d4' },
];

const generateAgentAllocation = () => [
  { name: 'Market Analyst', value: 28, color: '#3b82f6' },
  { name: 'Risk Manager', value: 22, color: '#8b5cf6' },
  { name: 'Alpha Hunter', value: 20, color: '#06b6d4' },
  { name: 'Technical Analyst', value: 18, color: '#10b981' },
  { name: 'OnChain Analyst', value: 12, color: '#f59e0b' },
];

const mockAgents: AgentStats[] = [
  {
    id: 'agent-1',
    name: 'Defidash Director',
    type: 'CEO Agent',
    status: 'active',
    totalTrades: 156,
    winningTrades: 98,
    losingTrades: 58,
    winRate: 62.8,
    totalPnL: 47850,
    avgTradeReturn: 2.4,
    sharpeRatio: 1.82,
    maxDrawdown: -8.2,
    activeTrades: 4,
    avgHoldTime: '4h 23m',
    lastTradeTime: '12 min ago'
  },
  {
    id: 'agent-2',
    name: 'Market Analyst',
    type: 'Analysis Agent',
    status: 'active',
    totalTrades: 89,
    winningTrades: 52,
    losingTrades: 37,
    winRate: 58.4,
    totalPnL: 23420,
    avgTradeReturn: 1.8,
    sharpeRatio: 1.45,
    maxDrawdown: -11.5,
    activeTrades: 2,
    avgHoldTime: '6h 12m',
    lastTradeTime: '45 min ago'
  },
  {
    id: 'agent-3',
    name: 'Risk Manager',
    type: 'Risk Agent',
    status: 'active',
    totalTrades: 124,
    winningTrades: 85,
    losingTrades: 39,
    winRate: 68.5,
    totalPnL: 31200,
    avgTradeReturn: 1.6,
    sharpeRatio: 2.12,
    maxDrawdown: -5.8,
    activeTrades: 3,
    avgHoldTime: '2h 45m',
    lastTradeTime: '8 min ago'
  },
  {
    id: 'agent-4',
    name: 'Alpha Hunter',
    type: 'Opportunity Agent',
    status: 'active',
    totalTrades: 67,
    winningTrades: 38,
    losingTrades: 29,
    winRate: 56.7,
    totalPnL: 18950,
    avgTradeReturn: 3.2,
    sharpeRatio: 1.28,
    maxDrawdown: -14.2,
    activeTrades: 5,
    avgHoldTime: '8h 34m',
    lastTradeTime: '2 hours ago'
  },
  {
    id: 'agent-5',
    name: 'Technical Analyst',
    type: 'Technical Agent',
    status: 'idle',
    totalTrades: 203,
    winningTrades: 122,
    losingTrades: 81,
    winRate: 60.1,
    totalPnL: 28700,
    avgTradeReturn: 1.4,
    sharpeRatio: 1.56,
    maxDrawdown: -9.7,
    activeTrades: 0,
    avgHoldTime: '3h 18m',
    lastTradeTime: '3 hours ago'
  },
  {
    id: 'agent-6',
    name: 'OnChain Analyst',
    type: 'Blockchain Agent',
    status: 'active',
    totalTrades: 45,
    winningTrades: 29,
    losingTrades: 16,
    winRate: 64.4,
    totalPnL: 15680,
    avgTradeReturn: 2.8,
    sharpeRatio: 1.71,
    maxDrawdown: -7.3,
    activeTrades: 2,
    avgHoldTime: '12h 45m',
    lastTradeTime: '1 hour ago'
  }
];

const mockTrades: TradeRecord[] = [
  { id: 't1', agent: 'Defidash Director', symbol: 'BTC/USDT', side: 'LONG', entryPrice: 97250, size: 0.5, status: 'open', openTime: '2026-02-15 10:23', pnlPercent: 1.8 },
  { id: 't2', agent: 'Risk Manager', symbol: 'ETH/USDT', side: 'LONG', entryPrice: 2680, size: 5.2, status: 'open', openTime: '2026-02-15 09:45', pnlPercent: 2.4 },
  { id: 't3', agent: 'Alpha Hunter', symbol: 'SOL/USDT', side: 'LONG', entryPrice: 178.5, size: 42, status: 'open', openTime: '2026-02-15 08:12', pnlPercent: -0.8 },
  { id: 't4', agent: 'Market Analyst', symbol: 'BTC/USDT', side: 'SHORT', entryPrice: 98100, exitPrice: 97450, size: 0.25, pnl: 162.5, pnlPercent: 0.66, status: 'closed', openTime: '2026-02-15 06:30', closeTime: '2026-02-15 08:45', duration: '2h 15m' },
  { id: 't5', agent: 'Technical Analyst', symbol: 'LINK/USDT', side: 'LONG', entryPrice: 18.92, exitPrice: 19.85, size: 450, pnl: 418.5, pnlPercent: 4.9, status: 'closed', openTime: '2026-02-14 22:10', closeTime: '2026-02-15 04:20', duration: '6h 10m' },
  { id: 't6', agent: 'OnChain Analyst', symbol: 'ARB/USDT', side: 'LONG', entryPrice: 1.24, size: 2500, status: 'open', openTime: '2026-02-15 07:00', pnlPercent: 3.2 },
  { id: 't7', agent: 'Defidash Director', symbol: 'ETH/USDT', side: 'LONG', entryPrice: 2645, exitPrice: 2712, size: 3.8, pnl: 254.6, pnlPercent: 2.5, status: 'closed', openTime: '2026-02-14 18:00', closeTime: '2026-02-15 02:30', duration: '8h 30m' },
  { id: 't8', agent: 'Risk Manager', symbol: 'BNB/USDT', side: 'SHORT', entryPrice: 652, exitPrice: 645, size: 12, pnl: 84, pnlPercent: 1.07, status: 'closed', openTime: '2026-02-14 14:20', closeTime: '2026-02-14 19:45', duration: '5h 25m' },
];

const mockPortfolio: PortfolioMetrics = {
  totalValue: 1247850,
  totalPnL: 165800,
  dailyPnL: 8420,
  weeklyPnL: 32150,
  monthlyPnL: 78900,
  totalTrades: 684,
  activeTrades: 16,
  winRate: 61.4,
  sharpeRatio: 1.76,
  sortinoRatio: 2.34,
  maxDrawdown: -12.8,
  volatility: 18.4,
  avgTradeSize: 8250,
  profitFactor: 1.92,
  calmarRatio: 1.45,
  riskAdjustedReturn: 24.6
};

export default function AgentPerformancePage() {
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [dailyReturns, setDailyReturns] = useState<any[]>([]);
  const [tradeDistribution] = useState(generateTradeDistribution());
  const [agentAllocation] = useState(generateAgentAllocation());
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('1M');

  useEffect(() => {
    setEquityCurve(generateEquityCurve());
    setDailyReturns(generateDailyReturns());
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

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
              <p className="text-gray-400 text-sm">Institutional-grade trading analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">6 Agents Active</span>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-[#111] border border-[#222] rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="1D">1 Day</option>
              <option value="1W">1 Week</option>
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="YTD">YTD</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Portfolio Value
            </div>
            <div className="text-xl font-bold">{formatCurrency(mockPortfolio.totalValue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Total PnL
            </div>
            <div className="text-xl font-bold text-green-400">{formatCurrency(mockPortfolio.totalPnL)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Activity className="w-3.5 h-3.5" />
              Daily PnL
            </div>
            <div className={`text-xl font-bold ${mockPortfolio.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(mockPortfolio.dailyPnL)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Target className="w-3.5 h-3.5" />
              Win Rate
            </div>
            <div className="text-xl font-bold text-blue-400">{mockPortfolio.winRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Total Trades
            </div>
            <div className="text-xl font-bold">{mockPortfolio.totalTrades}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5" />
              Active Trades
            </div>
            <div className="text-xl font-bold text-cyan-400">{mockPortfolio.activeTrades}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Shield className="w-3.5 h-3.5" />
              Sharpe Ratio
            </div>
            <div className="text-xl font-bold text-purple-400">{mockPortfolio.sharpeRatio}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Max Drawdown
            </div>
            <div className="text-xl font-bold text-red-400">{mockPortfolio.maxDrawdown}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Equity Curve */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Portfolio']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorValue)" />
                  <Line type="monotone" dataKey="benchmark" stroke="#666" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500" />
                <span className="text-gray-400">Portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-gray-500 border-dashed" />
                <span className="text-gray-400">Benchmark</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Allocation */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
              Trade Allocation by Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agentAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {agentAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Allocation']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Returns & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Returns */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Daily Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`]}
                  />
                  <Bar dataKey="return" fill="#3b82f6">
                    {dailyReturns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trade Distribution */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Return Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis type="number" stroke="#666" fontSize={10} />
                  <YAxis dataKey="range" type="category" stroke="#666" fontSize={10} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value} trades`]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {tradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card className="bg-[#0a0a0a] border-[#1a1a1a] mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Risk-Adjusted Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
              <div className="text-gray-400 text-xs mb-1">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-blue-400">{mockPortfolio.sharpeRatio}</div>
              <div className="text-xs text-gray-500 mt-1">Risk-adjusted return</div>
            </div>
            <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
              <div className="text-gray-400 text-xs mb-1">Sortino Ratio</div>
              <div className="text-2xl font-bold text-purple-400">{mockPortfolio.sortinoRatio}</div>
              <div className="text-xs text-gray-500 mt-1">Downside deviation</div>
            </div>
            <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
              <div className="text-gray-400 text-xs mb-1">Calmar Ratio</div>
              <div className="text-2xl font-bold text-cyan-400">{mockPortfolio.calmarRatio}</div>
              <div className="text-xs text-gray-500 mt-1">Return/drawdown</div>
            </div>
            <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
              <div className="text-gray-400 text-xs mb-1">Profit Factor</div>
              <div className="text-2xl font-bold text-green-400">{mockPortfolio.profitFactor}</div>
              <div className="text-xs text-gray-500 mt-1">Gross profit/loss</div>
            </div>
            <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
              <div className="text-gray-400 text-xs mb-1">Volatility</div>
              <div className="text-2xl font-bold text-orange-400">{mockPortfolio.volatility}%</div>
              <div className="text-xs text-gray-500 mt-1">Annualized</div>
            </div>
            <div className="bg-[#111] rounded-lg p-4 border border-[#222]">
              <div className="text-gray-400 text-xs mb-1">Risk-Adj Return</div>
              <div className="text-2xl font-bold text-emerald-400">{mockPortfolio.riskAdjustedReturn}%</div>
              <div className="text-xs text-gray-500 mt-1">Annualized</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <Card className="bg-[#0a0a0a] border-[#1a1a1a] mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            Individual Agent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAgents.map((agent) => (
              <div key={agent.id} className="bg-[#111] rounded-lg p-4 border border-[#222] hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      agent.type === 'CEO Agent' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      agent.type === 'Risk Agent' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      agent.type === 'Analysis Agent' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      'bg-gradient-to-br from-orange-500 to-yellow-500'
                    }`}>
                      <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.type}</div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    agent.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    agent.status === 'idle' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {agent.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Total PnL</div>
                    <div className={`font-semibold ${agent.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(agent.totalPnL)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Win Rate</div>
                    <div className="font-semibold text-blue-400">{agent.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Total Trades</div>
                    <div className="font-semibold">{agent.totalTrades}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Active</div>
                    <div className="font-semibold text-cyan-400">{agent.activeTrades}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Sharpe</div>
                    <div className="font-semibold text-purple-400">{agent.sharpeRatio}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Max DD</div>
                    <div className="font-semibold text-red-400">{agent.maxDrawdown}%</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between text-xs">
                  <div className="text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Avg hold: {agent.avgHoldTime}
                  </div>
                  <div className="text-gray-400">Last: {agent.lastTradeTime}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades Table */}
      <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Recent Trade Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#222]">
                  <th className="text-left py-3 px-2 font-medium">Agent</th>
                  <th className="text-left py-3 px-2 font-medium">Symbol</th>
                  <th className="text-left py-3 px-2 font-medium">Side</th>
                  <th className="text-right py-3 px-2 font-medium">Entry</th>
                  <th className="text-right py-3 px-2 font-medium">Exit</th>
                  <th className="text-right py-3 px-2 font-medium">Size</th>
                  <th className="text-right py-3 px-2 font-medium">PnL</th>
                  <th className="text-center py-3 px-2 font-medium">Status</th>
                  <th className="text-right py-3 px-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {mockTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                    <td className="py-3 px-2">
                      <span className="font-medium">{trade.agent}</span>
                    </td>
                    <td className="py-3 px-2 font-mono">{trade.symbol}</td>
                    <td className="py-3 px-2">
                      <Badge className={`text-xs ${
                        trade.side === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {trade.side}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right font-mono">${trade.entryPrice.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono">
                      {trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">{trade.size}</td>
                    <td className="py-3 px-2 text-right">
                      {trade.pnlPercent !== undefined && (
                        <span className={`font-semibold ${trade.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                          {trade.pnl && (
                            <span className="text-xs text-gray-500 ml-1">({formatCurrency(trade.pnl)})</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {trade.status === 'open' && (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          <Zap className="w-3 h-3 mr-1" /> Open
                        </Badge>
                      )}
                      {trade.status === 'closed' && (
                        <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Closed
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400">
                      {trade.duration || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
