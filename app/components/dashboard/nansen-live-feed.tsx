
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Activity,
  Radio,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { formatCurrency, truncateAddress, getTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';

interface NansenFeedItem {
  type: 'trade' | 'netflow' | 'whale_move';
  timestamp: string;
  data: any;
  id: string;
}

const CHAINS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'bnb', label: 'BNB Chain' },
];

export function NansenLiveFeed() {
  const [chain, setChain] = useState('ethereum');
  const [feedItems, setFeedItems] = useState<NansenFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNansenData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);

      // Fetch multiple data types in parallel
      const [tradesRes, netflowsRes] = await Promise.all([
        fetch(`/api/nansen/smart-money?action=dex-trades&chain=${chain}&timeframe=1h&limit=10`),
        fetch(`/api/nansen/smart-money?action=netflows&chain=${chain}&timeframe=1h&limit=5`)
      ]);

      const [tradesData, netflowsData] = await Promise.all([
        tradesRes.json(),
        netflowsRes.json()
      ]);

      const newItems: NansenFeedItem[] = [];

      // Add trades
      if (tradesData.success && tradesData.data) {
        tradesData.data.forEach((trade: any) => {
          newItems.push({
            type: 'trade',
            timestamp: trade.timestamp,
            data: trade,
            id: `trade-${trade.txHash}`
          });
        });
      }

      // Add netflows
      if (netflowsData.success && netflowsData.data) {
        netflowsData.data.forEach((netflow: any) => {
          newItems.push({
            type: 'netflow',
            timestamp: new Date().toISOString(),
            data: netflow,
            id: `netflow-${netflow.tokenAddress}`
          });
        });
      }

      // Sort by timestamp
      newItems.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Detect new items
      if (feedItems.length > 0 && showToast) {
        const existingIds = new Set(feedItems.map(item => item.id));
        const newIds = newItems
          .filter(item => !existingIds.has(item.id))
          .map(item => item.id);

        if (newIds.length > 0) {
          setNewItemIds(new Set(newIds));
          setTimeout(() => setNewItemIds(new Set()), 3000);
          toast.success(`${newIds.length} new update${newIds.length > 1 ? 's' : ''}!`, {
            icon: '⚡',
          });
        }
      }

      setFeedItems(newItems);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error: any) {
      console.error('[Nansen Feed] Error:', error);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNansenData();
  }, [chain]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Update every 20 seconds
    intervalRef.current = setInterval(() => {
      fetchNansenData(true);
    }, 20000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chain, feedItems]);

  const renderFeedItem = (item: NansenFeedItem) => {
    const isNew = newItemIds.has(item.id);

    if (item.type === 'trade') {
      const trade = item.data;
      return (
        <div
          key={item.id}
          className={`p-3 rounded-lg border transition-all duration-500 ${
            isNew
              ? 'bg-yellow-500/20 border-yellow-500/50 animate-pulse'
              : trade.type === 'BUY'
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge
                className={`text-xs ${
                  trade.type === 'BUY'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {trade.type}
              </Badge>
              <span className="font-bold text-sm">{trade.tokenSymbol}</span>
              {trade.walletLabel && (
                <Badge variant="outline" className="text-xs border-purple-500/30 bg-purple-500/10">
                  {trade.walletLabel}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(new Date(trade.timestamp))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {truncateAddress(trade.walletAddress)}
            </div>
            <div className="text-sm font-bold">{formatCurrency(trade.amountUsd)}</div>
          </div>
        </div>
      );
    }

    if (item.type === 'netflow') {
      const netflow = item.data;
      const isAccumulation = netflow.netflow > 0;
      return (
        <div
          key={item.id}
          className={`p-3 rounded-lg border transition-all duration-500 ${
            isNew
              ? 'bg-yellow-500/20 border-yellow-500/50 animate-pulse'
              : isAccumulation
              ? 'bg-blue-500/5 border-blue-500/20'
              : 'bg-orange-500/5 border-orange-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className={`w-3 h-3 ${isAccumulation ? 'text-blue-400' : 'text-orange-400'}`} />
              <span className="font-bold text-sm">{netflow.tokenSymbol}</span>
              <Badge
                variant="outline"
                className={`text-xs ${
                  netflow.signal === 'STRONG_BUY'
                    ? 'border-green-500/30 bg-green-500/10 text-green-400'
                    : netflow.signal === 'STRONG_SELL'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                }`}
              >
                {netflow.signal.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {netflow.smartMoneyCount} wallets
            </div>
            <div className={`text-sm font-bold ${isAccumulation ? 'text-blue-400' : 'text-orange-400'}`}>
              {isAccumulation ? '+' : ''}{formatCurrency(netflow.netflow)}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20">
      <CardHeader className="border-b border-primary/10 pb-3">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Smart Money Activity</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 text-xs">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Nansen
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger className="flex-1 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAINS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => fetchNansenData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-3 space-y-2">
              {feedItems.map(renderFeedItem)}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
