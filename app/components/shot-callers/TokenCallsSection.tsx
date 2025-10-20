
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Trophy, 
  Flame,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenCall {
  id: string;
  tokenSymbol: string;
  tokenName: string | null;
  callPrice: number | null;
  currentPrice: number | null;
  priceChange: number | null;
  roi: number | null;
  sentiment: string;
  calledAt: string;
  isWin: boolean | null;
  kol: {
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
  tweet: {
    content: string;
    createdAt: string;
    likeCount: number;
    retweetCount: number;
  };
}

interface KOLStat {
  id: string;
  winRate: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  pendingCalls: number;
  averageROI: number;
  bestCall: number | null;
  kol: {
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

export default function TokenCallsSection() {
  const [tokenCalls, setTokenCalls] = useState<TokenCall[]>([]);
  const [kolStats, setKolStats] = useState<KOLStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');

  const fetchTokenCalls = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/shot-callers/token-calls?limit=50'
        : `/api/shot-callers/token-calls?limit=50&sentiment=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTokenCalls(data.tokenCalls || []);
        setKolStats(data.kolStats || []);
        setLastUpdate(new Date());
        toast.success('Token calls updated');
      } else {
        toast.error('Failed to fetch token calls');
      }
    } catch (error) {
      console.error('Error fetching token calls:', error);
      toast.error('Error loading token calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenCalls();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchTokenCalls, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [filter]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'bearish':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getROIColor = (roi: number | null) => {
    if (roi === null) return 'text-gray-400';
    if (roi > 0) return 'text-green-400';
    if (roi < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatROI = (roi: number | null) => {
    if (roi === null) return 'Pending';
    return `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const callTime = new Date(date);
    const diffMs = now.getTime() - callTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Win Rate Leaderboard */}
      {kolStats.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-slate-900/50 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                  Shot Caller Leaderboard
                </span>
              </CardTitle>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Flame className="h-3 w-3 mr-1 animate-pulse" />
                Live Rankings
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kolStats.slice(0, 3).map((stat, index) => (
                <Card 
                  key={stat.id}
                  className={`relative overflow-hidden ${
                    index === 0 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/40' 
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/40'
                      : 'bg-gradient-to-br from-orange-600/20 to-red-500/10 border-orange-500/40'
                  }`}
                >
                  {/* Ranking Badge */}
                  <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 
                      ? 'bg-yellow-500 text-yellow-950' 
                      : index === 1
                      ? 'bg-gray-400 text-gray-950'
                      : 'bg-orange-600 text-orange-950'
                  }`}>
                    #{index + 1}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12 border-2 border-purple-500/50">
                        <AvatarImage src={stat.kol.profileImageUrl || ''} alt={stat.kol.displayName} />
                        <AvatarFallback>{stat.kol.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-white">{stat.kol.displayName}</h3>
                        <a 
                          href={`https://x.com/${stat.kol.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          @{stat.kol.username}
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Win Rate</span>
                        <span className={`text-lg font-bold ${stat.winRate >= 70 ? 'text-green-400' : stat.winRate >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {stat.winRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Avg ROI</span>
                        <span className={getROIColor(stat.averageROI)}>
                          {formatROI(stat.averageROI)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total Calls</span>
                        <span className="text-sm text-gray-300">{stat.totalCalls}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400">✓ {stat.successfulCalls}</span>
                        <span className="text-red-400">✗ {stat.failedCalls}</span>
                        <span className="text-gray-400">⧗ {stat.pendingCalls}</span>
                      </div>
                      {stat.bestCall !== null && (
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Best Call</span>
                            <span className="text-xs font-bold text-green-400">
                              +{stat.bestCall.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Calls Section */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                  Token Calls Tracker
                </span>
              </CardTitle>
              {lastUpdate && (
                <p className="text-xs text-gray-400">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'bullish' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('bullish')}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Bullish
                </Button>
                <Button
                  variant={filter === 'bearish' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('bearish')}
                  className="text-xs"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Bearish
                </Button>
                <Button
                  variant={filter === 'neutral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('neutral')}
                  className="text-xs"
                >
                  Neutral
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTokenCalls}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {tokenCalls.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No token calls found</p>
                <p className="text-xs text-gray-500 mt-2">Token calls will appear here as KOLs mention tokens</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tokenCalls.map((call) => (
                  <Card 
                    key={call.id} 
                    className={`transition-all hover:scale-[1.01] ${
                      call.isWin === true 
                        ? 'bg-green-900/10 border-green-500/30 hover:border-green-500/50'
                        : call.isWin === false
                        ? 'bg-red-900/10 border-red-500/30 hover:border-red-500/50'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                            <AvatarImage src={call.kol.profileImageUrl || ''} alt={call.kol.displayName} />
                            <AvatarFallback>{call.kol.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-white">{call.kol.displayName}</h3>
                            <a 
                              href={`https://x.com/${call.kol.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              @{call.kol.username}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSentimentColor(call.sentiment)}>
                            {call.sentiment}
                          </Badge>
                          {call.isWin !== null && (
                            <Badge className={call.isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {call.isWin ? '✓ Win' : '✗ Loss'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Token Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {/* Token Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-purple-500" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white">${call.tokenSymbol}</span>
                                {call.tokenName && (
                                  <span className="text-xs text-gray-400">{call.tokenName}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            Called {getTimeAgo(call.calledAt)}
                          </div>
                        </div>

                        {/* Price & Performance */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Entry Price</span>
                            <span className="text-sm font-mono text-white">{formatPrice(call.callPrice)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Current Price</span>
                            <span className="text-sm font-mono text-white">{formatPrice(call.currentPrice)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">ROI</span>
                            <div className="flex items-center gap-1">
                              {call.roi !== null && call.roi > 0 && <ArrowUpRight className="h-4 w-4 text-green-400" />}
                              {call.roi !== null && call.roi < 0 && <ArrowDownRight className="h-4 w-4 text-red-400" />}
                              <span className={`text-sm font-bold ${getROIColor(call.roi)}`}>
                                {formatROI(call.roi)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tweet Preview */}
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-xs text-gray-300 line-clamp-2">
                          {call.tweet.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
