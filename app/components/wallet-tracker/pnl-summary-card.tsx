
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUpIcon, TrendingDownIcon, TargetIcon, TrophyIcon } from 'lucide-react';

interface PnLSummaryData {
  address: string;
  chain: string;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnl: number;
  roi: number;
  winRate: number;
  totalTrades: number;
  topTrades: {
    tokenSymbol: string;
    pnl: number;
    roi: number;
  }[];
}

interface PnLSummaryCardProps {
  data: PnLSummaryData | null;
  isLoading?: boolean;
}

export function PnLSummaryCard({ data, isLoading }: PnLSummaryCardProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-primary bg-background">
        <CardHeader>
          <CardTitle className="text-primary uppercase tracking-wider">
            💰 Profit & Loss Summary
          </CardTitle>
          <CardDescription className="text-terminal-gray">
            Loading wallet performance data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const isProfitable = data.totalPnl > 0;

  return (
    <Card className="border-2 border-primary bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary uppercase tracking-wider flex items-center gap-2">
              💰 Profit & Loss Summary
              {isProfitable ? (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  PROFITABLE
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-500">
                  LOSING
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-terminal-gray mt-1">
              Last 30 days trading performance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main PnL Display */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border-2 border-white/10 rounded-lg bg-[#0a0a0a]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-terminal-gray uppercase">Realized PnL</span>
            </div>
            <p
              className={`text-3xl font-bold font-mono ${
                data.totalRealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatCurrency(data.totalRealizedPnl)}
            </p>
          </div>

          <div className="p-4 border-2 border-white/10 rounded-lg bg-[#0a0a0a]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDownIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-terminal-gray uppercase">Unrealized PnL</span>
            </div>
            <p
              className={`text-3xl font-bold font-mono ${
                data.totalUnrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatCurrency(data.totalUnrealizedPnl)}
            </p>
          </div>
        </div>

        {/* Total PnL */}
        <div className="p-6 border-2 border-primary rounded-lg bg-background/70">
          <div className="text-center">
            <span className="text-sm text-terminal-gray uppercase tracking-wider">Total P&L</span>
            <p
              className={`text-5xl font-bold font-mono mt-2 ${
                isProfitable ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatCurrency(data.totalPnl)}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border border-white/10 rounded">
            <div className="flex items-center gap-2 mb-1">
              <TargetIcon className="h-4 w-4 text-primary" />
              <span className="text-xs text-terminal-gray uppercase">ROI</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(data.roi)}
            </p>
          </div>

          <div className="p-4 border border-white/10 rounded">
            <div className="flex items-center gap-2 mb-1">
              <TrophyIcon className="h-4 w-4 text-primary" />
              <span className="text-xs text-terminal-gray uppercase">Win Rate</span>
            </div>
            <p className="text-2xl font-bold font-mono text-primary">
              {data.winRate.toFixed(1)}%
            </p>
          </div>

          <div className="p-4 border border-white/10 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary">📊</span>
              <span className="text-xs text-terminal-gray uppercase">Total Trades</span>
            </div>
            <p className="text-2xl font-bold font-mono text-primary">
              {data.totalTrades.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Top Trades */}
        {data.topTrades && data.topTrades.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              🏆 Top 5 Profitable Tokens
            </h4>
            <div className="space-y-2">
              {data.topTrades.map((trade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-white/10 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-mono font-bold">
                      #{index + 1}
                    </span>
                    <span className="text-primary font-mono font-bold">
                      {trade.tokenSymbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono font-bold ${
                        trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {formatCurrency(trade.pnl)}
                    </p>
                    <p className="text-xs text-terminal-gray font-mono">
                      ROI: {formatPercent(trade.roi)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
