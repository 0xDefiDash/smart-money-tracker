'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle2,
  XCircle,
  BarChart3,
  Wallet,
  Clock,
  Zap,
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

interface OrderForm {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: string;
  price: string;
  leverage: string;
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
  const [orderForm, setOrderForm] = useState<OrderForm>({
    symbol: 'BTCUSDT',
    side: 'BUY',
    type: 'MARKET',
    quantity: '',
    price: '',
    leverage: '10'
  });
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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

  const handlePlaceOrder = async () => {
    if (!orderForm.quantity || parseFloat(orderForm.quantity) <= 0) {
      setOrderStatus({ type: 'error', message: 'Please enter a valid quantity' });
      return;
    }

    if (orderForm.type === 'LIMIT' && (!orderForm.price || parseFloat(orderForm.price) <= 0)) {
      setOrderStatus({ type: 'error', message: 'Please enter a valid price for limit order' });
      return;
    }

    setIsSubmitting(true);
    setOrderStatus(null);

    try {
      const response = await fetch('/api/asterdex/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'placeOrder',
          ...orderForm
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderStatus({ type: 'success', message: `Order placed: ${data.result.orderId}` });
        setOrderForm(prev => ({ ...prev, quantity: '', price: '' }));
        await fetchAccountData();
      } else {
        setOrderStatus({ type: 'error', message: data.error || 'Order failed' });
      }
    } catch (error) {
      setOrderStatus({ type: 'error', message: 'Failed to place order' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        setOrderStatus({ type: 'success', message: `Position closed for ${symbol}` });
        await fetchAccountData();
      } else {
        setOrderStatus({ type: 'error', message: data.error });
      }
    } catch (error) {
      setOrderStatus({ type: 'error', message: 'Failed to close position' });
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
        <Card className="bg-black/50 border-terminal-green/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-terminal-green" />
              <span className="text-xs text-terminal-green/60 font-mono">Balance</span>
            </div>
            <p className="text-lg font-mono text-white">${formatPrice(totalBalance)}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-terminal-green/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-terminal-green/60 font-mono">Unrealized PnL</span>
            </div>
            <p className={`text-lg font-mono ${totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}${formatPrice(totalUnrealizedPnl)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-terminal-green/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-terminal-green/60 font-mono">Positions</span>
            </div>
            <p className="text-lg font-mono text-white">{positions.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-terminal-green/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-terminal-green/60 font-mono">Status</span>
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
        <Card className="bg-black/50 border-terminal-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-terminal-green font-mono text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Markets
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAll}
                disabled={isLoading}
                className="h-6 text-terminal-green/60"
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
                    onClick={() => {
                      setSelectedSymbol(ticker.symbol);
                      setOrderForm(prev => ({ ...prev, symbol: ticker.symbol }));
                    }}
                    className={`w-full p-2 rounded border transition-all text-left ${
                      selectedSymbol === ticker.symbol
                        ? 'border-terminal-green bg-terminal-green/10'
                        : 'border-terminal-green/20 hover:border-terminal-green/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-white">{ticker.symbol.replace('USDT', '')}</span>
                      <span className="font-mono text-sm text-white">${formatPrice(ticker.lastPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-terminal-green/50 font-mono">
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

        {/* Order Form */}
        <Card className="bg-black/50 border-terminal-green/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-terminal-green font-mono text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Place Order - {selectedSymbol}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Side Selection */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderForm.side === 'BUY' ? 'default' : 'outline'}
                onClick={() => setOrderForm(prev => ({ ...prev, side: 'BUY' }))}
                className={orderForm.side === 'BUY' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                }
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Long
              </Button>
              <Button
                variant={orderForm.side === 'SELL' ? 'default' : 'outline'}
                onClick={() => setOrderForm(prev => ({ ...prev, side: 'SELL' }))}
                className={orderForm.side === 'SELL'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                }
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Short
              </Button>
            </div>

            {/* Order Type */}
            <div className="space-y-1">
              <Label className="text-terminal-green/60 font-mono text-xs">Order Type</Label>
              <Select
                value={orderForm.type}
                onValueChange={(v) => setOrderForm(prev => ({ ...prev, type: v as 'MARKET' | 'LIMIT' }))}
              >
                <SelectTrigger className="bg-black/50 border-terminal-green/30 text-terminal-green font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">Market</SelectItem>
                  <SelectItem value="LIMIT">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price (for Limit orders) */}
            {orderForm.type === 'LIMIT' && (
              <div className="space-y-1">
                <Label className="text-terminal-green/60 font-mono text-xs">Price (USDT)</Label>
                <Input
                  type="number"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder={currentTicker ? formatPrice(currentTicker.lastPrice) : '0'}
                  className="bg-black/50 border-terminal-green/30 text-terminal-green font-mono"
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1">
              <Label className="text-terminal-green/60 font-mono text-xs">Quantity</Label>
              <Input
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0.001"
                className="bg-black/50 border-terminal-green/30 text-terminal-green font-mono"
              />
            </div>

            {/* Leverage */}
            <div className="space-y-1">
              <Label className="text-terminal-green/60 font-mono text-xs">Leverage</Label>
              <Select
                value={orderForm.leverage}
                onValueChange={(v) => setOrderForm(prev => ({ ...prev, leverage: v }))}
              >
                <SelectTrigger className="bg-black/50 border-terminal-green/30 text-terminal-green font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125].map(lev => (
                    <SelectItem key={lev} value={lev.toString()}>{lev}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Preview */}
            {orderForm.quantity && currentTicker && (
              <div className="p-2 rounded bg-terminal-green/5 border border-terminal-green/20">
                <p className="text-xs text-terminal-green/60 font-mono">Order Value</p>
                <p className="font-mono text-terminal-green">
                  ~${formatPrice(parseFloat(orderForm.quantity || '0') * currentTicker.lastPrice)}
                </p>
              </div>
            )}

            {/* Status Message */}
            {orderStatus && (
              <Alert className={orderStatus.type === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}>
                {orderStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <AlertDescription className={`font-mono text-xs ${orderStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {orderStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !orderForm.quantity}
              className={`w-full font-mono font-bold ${
                orderForm.side === 'BUY'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>{orderForm.side === 'BUY' ? 'Long' : 'Short'} {selectedSymbol}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Positions & History */}
        <Card className="bg-black/50 border-terminal-green/30">
          <CardHeader className="pb-0">
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="bg-black/50 border border-terminal-green/30 w-full">
                <TabsTrigger value="positions" className="flex-1 font-mono text-xs data-[state=active]:bg-terminal-green/20">
                  Positions ({positions.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 font-mono text-xs data-[state=active]:bg-terminal-green/20">
                  History
                </TabsTrigger>
              </TabsList>

              <CardContent className="px-0 pt-3">
                <TabsContent value="positions" className="mt-0">
                  <ScrollArea className="h-[280px]">
                    {positions.length === 0 ? (
                      <div className="text-center py-8 text-terminal-green/40 font-mono text-sm">
                        No open positions
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {positions.map((pos, i) => (
                          <div key={i} className="p-3 rounded border border-terminal-green/20 bg-black/30">
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
                                <span className="text-terminal-green/50">Size: </span>
                                <span className="text-white">{pos.size}</span>
                              </div>
                              <div>
                                <span className="text-terminal-green/50">Entry: </span>
                                <span className="text-white">${formatPrice(pos.entryPrice)}</span>
                              </div>
                              <div>
                                <span className="text-terminal-green/50">Mark: </span>
                                <span className="text-white">${formatPrice(pos.markPrice)}</span>
                              </div>
                              <div>
                                <span className="text-terminal-green/50">PnL: </span>
                                <span className={pos.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {pos.unrealizedPnl >= 0 ? '+' : ''}${formatPrice(pos.unrealizedPnl)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs font-mono text-terminal-green/40">
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
                      <div className="text-center py-8 text-terminal-green/40 font-mono text-sm">
                        No trade history
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tradeHistory.map((trade) => (
                          <div key={trade.id} className="p-2 rounded border border-terminal-green/10 bg-black/20">
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
                            <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-terminal-green/50">
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
