
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
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [autoSync, setAutoSync] = useState(true);

  const fetchTokenCalls = async (silent = false) => {
    if (!silent) setLoading(true);
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
        if (!silent) {
          toast.success(`Loaded ${data.tokenCalls?.length || 0} token calls`);
        }
      } else {
        if (!silent) toast.error('Failed to fetch token calls');
      }
    } catch (error) {
      console.error('Error fetching token calls:', error);
      if (!silent) toast.error('Error loading token calls');
    } finally {
      setLoading(false);
    }
  };

  const syncFromTwitter = async () => {
    setSyncing(true);
    try {
      toast.loading('Syncing token calls from X API...', { id: 'sync-token-calls' });
      
      const response = await fetch('/api/shot-callers/sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastSync(new Date());
        
        toast.success(
          `✅ Synced ${data.processed || 0} tweets, created ${data.tokenCallsCreated || 0} token calls`,
          { id: 'sync-token-calls' }
        );
        
        // Refresh token calls after sync
        await fetchTokenCalls(true);
      } else {
        const error = await response.json();
        toast.error(`Sync failed: ${error.message || 'Unknown error'}`, { id: 'sync-token-calls' });
      }
    } catch (error) {
      console.error('Error syncing token calls:', error);
      toast.error('Error syncing from X API', { id: 'sync-token-calls' });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchTokenCalls();
    
    // Auto-refresh token calls every 3 minutes
    const fetchInterval = setInterval(() => fetchTokenCalls(true), 3 * 60 * 1000);
    
    // Auto-sync from Twitter every 10 minutes (if enabled)
    const syncInterval = autoSync ? setInterval(() => {
      console.log('🔄 Auto-syncing token calls from X API...');
      syncFromTwitter();
    }, 10 * 60 * 1000) : null;
    
    return () => {
      clearInterval(fetchInterval);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [filter, autoSync]);

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
    <div className="space-y-4">
      {/* Sync Status Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${syncing ? 'bg-yellow-500 animate-pulse' : autoSync ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-gray-400">
              {syncing ? 'Syncing...' : autoSync ? 'Auto-sync ON' : 'Auto-sync OFF'}
            </span>
          </div>
          {lastSync && (
            <span className="text-gray-500">
              • Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
          {lastUpdate && (
            <span className="text-gray-500">
              • Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoSync(!autoSync)}
            className="text-xs h-7 px-2"
          >
            {autoSync ? 'Disable' : 'Enable'} Auto-sync
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => syncFromTwitter()}
            disabled={syncing}
            className="text-xs h-7 px-2 bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Compact KOL Stats */}
      {kolStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kolStats.slice(0, 4).map((stat, index) => (
            <Card 
              key={stat.id}
              className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all"
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={stat.kol.profileImageUrl || ''} alt={stat.kol.displayName} />
                    <AvatarFallback className="text-xs">{stat.kol.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{stat.kol.displayName}</p>
                    <p className="text-xs text-gray-400">@{stat.kol.username}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Win Rate</span>
                    <span className={`text-sm font-bold ${stat.winRate >= 70 ? 'text-green-400' : stat.winRate >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
                      {stat.winRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">ROI</span>
                    <span className={`text-xs font-medium ${getROIColor(stat.averageROI)}`}>
                      {formatROI(stat.averageROI)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{stat.totalCalls} calls</span>
                    <span className="text-green-400">{stat.successfulCalls}W</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Token Calls Table */}
      {tokenCalls.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No token calls yet</p>
          <p className="text-xs text-gray-500 mt-1">Use Sync button to fetch latest calls</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">
              Showing {tokenCalls.length} token calls {lastUpdate && `• Updated ${lastUpdate.toLocaleTimeString()}`}
            </p>
            <div className="flex gap-1">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs h-7 px-2"
              >
                All
              </Button>
              <Button
                variant={filter === 'bullish' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('bullish')}
                className="text-xs h-7 px-2"
              >
                Bullish
              </Button>
              <Button
                variant={filter === 'bearish' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('bearish')}
                className="text-xs h-7 px-2"
              >
                Bearish
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr className="text-xs text-gray-400">
                  <th className="text-left py-2 px-2">KOL</th>
                  <th className="text-left py-2 px-2">Token</th>
                  <th className="text-right py-2 px-2">Entry</th>
                  <th className="text-right py-2 px-2">Current</th>
                  <th className="text-right py-2 px-2">ROI</th>
                  <th className="text-center py-2 px-2">Sentiment</th>
                  <th className="text-right py-2 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {tokenCalls.slice(0, 10).map((call) => (
                  <tr 
                    key={call.id}
                    className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                      call.isWin === true ? 'bg-green-900/5' : call.isWin === false ? 'bg-red-900/5' : ''
                    }`}
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={call.kol.profileImageUrl || ''} alt={call.kol.displayName} />
                          <AvatarFallback className="text-xs">{call.kol.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-white font-medium truncate max-w-[100px]">
                          {call.kol.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-bold">${call.tokenSymbol}</span>
                        {call.isWin !== null && (
                          <span className={call.isWin ? 'text-green-400' : 'text-red-400'}>
                            {call.isWin ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-xs text-gray-300">
                      {formatPrice(call.callPrice)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-xs text-gray-300">
                      {formatPrice(call.currentPrice)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className={`text-xs font-bold ${getROIColor(call.roi)}`}>
                        {formatROI(call.roi)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Badge className={`${getSentimentColor(call.sentiment)} text-xs`}>
                        {call.sentiment === 'bullish' ? '↑' : call.sentiment === 'bearish' ? '↓' : '→'}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-right text-xs text-gray-400">
                      {getTimeAgo(call.calledAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
