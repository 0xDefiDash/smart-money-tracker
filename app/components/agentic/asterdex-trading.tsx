'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Wallet,
  Clock,
  Target,
  Shield
} from 'lucide-react';

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  leverage: number;
  unrealizedPnl: number;
  marginType: string;
}

interface Ticker {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
}

interface Balance {
  asset: string;
  balance: number;
  available: number;
  unrealizedPnl: number;
}

interface TradeHistory {
  id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  commission: number;
  time: number;
  realizedPnl: number;
}

const TRADING_PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'];

export function AsterDexTrading() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccountData = useCallback(async () => {
    try {
      const response = await fetch('/api/asterdex/account');
      const data = await response.json();
      
      if (data.success) {
        setIsConfigured(data.isConfigured);
        setPositions(data.positions || []);
        setBalances(data.balances || []);
      }
    } catch (error) {
      console.error('Failed to fetch account:', error);
    }
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch('/api/asterdex/market?action=tickers');
      const data = await response.json();
      
      if (data.success) {
        setTickers(data.data.filter((t: Ticker) => TRADING_PAIRS.includes(t.symbol)));
      }
    } catch (error) {
      console.error('Failed to fetch market:', error);
    }
  }, []);

  const fetchTradeHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/asterdex/trade?action=tradeHistory&limit=20');
      const data = await response.json();
      
      if (data.success) {
        setTradeHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchAccountData(), fetchMarketData(), fetchTradeHistory()]);
    setIsLoading(false);
  }, [fetchAccountData, fetchMarketData, fetchTradeHistory]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [refreshAll]);

  const handleClosePosition = async (symbol: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/asterdex/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'closePosition', symbol })
      });

      const data = await response.json();
      if (data.success) {
        await fetchAccountData();
      }
    } catch (error) {
      console.error('Failed to close position:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTicker = tickers.find(t => t.symbol === selectedSymbol);
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  const formatPrice = (price: number, decimals: number = 2) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${vol.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-surface-300 border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-mono">Balance</span>
            </div>
            <p className="text-lg font-mono text-white">${formatPrice(totalBalance)}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-300 border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground font-mono">Unrealized PnL</span>
            </div>
            <p className={`text-lg font-mono ${totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}${formatPrice(totalUnrealizedPnl)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-300 border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground font-mono">Positions</span>
            </div>
            <p className="text-lg font-mono text-white">{positions.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-300 border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground font-mono">Status</span>
            </div>
            <Badge className={isConfigured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
              {isConfigured ? 'Live' : 'Demo'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Market Prices */}
        <Card className="bg-surface-300 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary font-mono text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Markets
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAll}
                disabled={isLoading}
                className="h-6 text-muted-foreground"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {tickers.map(ticker => (
                  <button
                    key={ticker.symbol}
                    onClick={() => setSelectedSymbol(ticker.symbol)}
                    className={`w-full p-2 rounded border transition-all text-left ${
                      selectedSymbol === ticker.symbol
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-white">{ticker.symbol.replace('USDT', '')}</span>
                      <span className="font-mono text-sm text-white">${formatPrice(ticker.lastPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-primary/50 font-mono">
                        Vol: {formatVolume(ticker.quoteVolume)}
                      </span>
                      <span className={`text-xs font-mono flex items-center gap-1 ${
                        ticker.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {ticker.priceChangePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(ticker.priceChangePercent).toFixed(2)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Positions & History */}
        <Card className="bg-surface-300 border-white/10">
          <CardHeader className="pb-0">
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="bg-surface-300 border border-white/10 w-full">
                <TabsTrigger value="positions" className="flex-1 font-mono text-xs data-[state=active]:bg-primary/20">
                  Positions ({positions.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 font-mono text-xs data-[state=active]:bg-primary/20">
                  History
                </TabsTrigger>
              </TabsList>

              <CardContent className="px-0 pt-3">
                <TabsContent value="positions" className="mt-0">
                  <ScrollArea className="h-[280px]">
                    {positions.length === 0 ? (
                      <div className="text-center py-8 text-primary/40 font-mono text-sm">
                        No open positions
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {positions.map((pos, i) => (
                          <div key={i} className="p-3 rounded border border-primary/20 bg-background/30">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-white">{pos.symbol.replace('USDT', '')}</span>
                                <Badge className={pos.side === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {pos.side} {pos.leverage}x
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClosePosition(pos.symbol)}
                                disabled={isSubmitting}
                                className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                Close
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div>
                                <span className="text-primary/50">Size: </span>
                                <span className="text-white">{pos.size}</span>
                              </div>
                              <div>
                                <span className="text-primary/50">Entry: </span>
                                <span className="text-white">${formatPrice(pos.entryPrice)}</span>
                              </div>
                              <div>
                                <span className="text-primary/50">Mark: </span>
                                <span className="text-white">${formatPrice(pos.markPrice)}</span>
                              </div>
                              <div>
                                <span className="text-primary/50">PnL: </span>
                                <span className={pos.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {pos.unrealizedPnl >= 0 ? '+' : ''}${formatPrice(pos.unrealizedPnl)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs font-mono text-primary/40">
                              Liq: ${formatPrice(pos.liquidationPrice)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <ScrollArea className="h-[280px]">
                    {tradeHistory.length === 0 ? (
                      <div className="text-center py-8 text-primary/40 font-mono text-sm">
                        No trade history
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tradeHistory.map((trade) => (
                          <div key={trade.id} className="p-2 rounded border border-primary/10 bg-background/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-white">{trade.symbol.replace('USDT', '')}</span>
                                <Badge variant="outline" className={trade.side === 'BUY' ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}>
                                  {trade.side}
                                </Badge>
                              </div>
                              <span className={`font-mono text-xs ${trade.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.realizedPnl !== 0 ? `${trade.realizedPnl >= 0 ? '+' : ''}$${formatPrice(trade.realizedPnl)}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-primary/50">
                              <span>{trade.qty} @ ${formatPrice(trade.price)}</span>
                              <span>{new Date(trade.time).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </CardContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
