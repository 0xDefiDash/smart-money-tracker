
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Fish as WhaleIcon,
  Trophy,
  Zap,
  Activity,
  DollarSign,
  BarChart3,
  Flame,
  Clock,
  Eye,
} from 'lucide-react';

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}

interface WhaleTransaction {
  id: string;
  blockchain: string;
  value: string;
  valueUsd: number;
  symbol: string;
  timestamp: Date;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
}

interface TrendingToken {
  symbol: string;
  name: string;
  priceChange: number;
  volume: number;
  trending: boolean;
}

export default function TelegramMiniApp() {
  const [activeTab, setActiveTab] = useState('market');
  const [whaleTransactions, setWhaleTransactions] = useState<WhaleTransaction[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Get user data
      if (tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user);
      }

      // Apply theme colors
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty(
          '--tg-theme-bg-color',
          tg.themeParams.bg_color
        );
      }
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load whale transactions
      const whaleRes = await fetch('/api/telegram/whale-feed');
      if (whaleRes.ok) {
        const whaleData = await whaleRes.json();
        setWhaleTransactions(whaleData.transactions || []);
      }

      // Load market data
      const marketRes = await fetch('/api/telegram/market-feed');
      if (marketRes.ok) {
        const marketDataRes = await marketRes.json();
        setMarketData(marketDataRes.data || []);
      }

      // Load trending tokens
      const trendingRes = await fetch('/api/telegram/trending-feed');
      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        setTrendingTokens(trendingData.tokens || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    }
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    }
    return `$${(volume / 1000).toFixed(2)}K`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">DeFiDash Tracker</h1>
            <p className="text-xs opacity-90">
              {user ? `Welcome, ${user.first_name}` : 'Real-time Crypto Intelligence'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="market" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Market
            </TabsTrigger>
            <TabsTrigger value="whales" className="text-xs">
              <WhaleIcon className="w-4 h-4 mr-1" />
              Whales
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">
              <Flame className="w-4 h-4 mr-1" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                Loading market data...
              </div>
            ) : (
              <>
                {marketData.slice(0, 15).map((crypto, idx) => (
                  <Card key={idx} className="border-none shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {crypto.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{crypto.symbol}</p>
                            <p className="text-xs text-muted-foreground">{crypto.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(crypto.price)}</p>
                          <div className="flex items-center gap-1 justify-end">
                            {crypto.priceChange24h >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                crypto.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {crypto.priceChange24h >= 0 ? '+' : ''}
                              {crypto.priceChange24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span>24h Volume</span>
                        <span className="font-medium">{formatVolume(crypto.volume24h)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Whales Tab */}
          <TabsContent value="whales" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                Loading whale activity...
              </div>
            ) : whaleTransactions.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <WhaleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No whale transactions yet</p>
                  <p className="text-xs mt-1">Check back soon for updates</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {whaleTransactions.slice(0, 20).map((tx, idx) => (
                  <Card key={idx} className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <WhaleIcon className="w-5 h-5 text-blue-600" />
                          <Badge variant="outline" className="text-xs">
                            {tx.blockchain}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            {formatVolume(tx.valueUsd)}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.symbol}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(tx.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                Loading trending tokens...
              </div>
            ) : trendingTokens.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Flame className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trending tokens yet</p>
                  <p className="text-xs mt-1">Check back soon for updates</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {trendingTokens.map((token, idx) => (
                  <Card key={idx} className="border-none shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10">
                            <Flame className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{token.symbol}</p>
                              {token.trending && (
                                <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500">
                                  Hot
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {token.priceChange >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span
                              className={`text-sm font-bold ${
                                token.priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {token.priceChange >= 0 ? '+' : ''}
                              {token.priceChange.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vol: {formatVolume(token.volume)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 space-y-2">
        <Button
          onClick={loadData}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => window.open('https://defidashtracker.com', '_blank')}
          >
            <Eye className="w-4 h-4 mr-1" />
            Full App
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => setActiveTab('market')}
          >
            <Zap className="w-4 h-4 mr-1" />
            Quick View
          </Button>
        </div>
      </div>
    </div>
  );
}
