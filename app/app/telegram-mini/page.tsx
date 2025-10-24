
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Bell,
  Settings,
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
  const router = useRouter();
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

      // Hide back button on main page
      tg.BackButton.hide();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Compact Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-md mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">DeFiDash</h1>
                <p className="text-[10px] opacity-80">
                  {user ? `Hi, ${user.first_name}` : 'Crypto Tracker'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 h-7 w-7 p-0 rounded-full"
                onClick={() => router.push('/telegram-mini/notifications')}
              >
                <Bell className="w-3.5 h-3.5" />
              </Button>
              <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container - Max Width for Mobile */}
      <div className="max-w-md mx-auto">
        {/* Compact Tabs */}
        <div className="sticky top-[52px] z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
          <div className="flex px-3 py-2 gap-1.5">
            <button
              onClick={() => setActiveTab('market')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'market'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Market</span>
            </button>
            <button
              onClick={() => setActiveTab('whales')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'whales'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <WhaleIcon className="w-3.5 h-3.5" />
              <span>Whales</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hot</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-2 py-3 pb-24 space-y-2">
          {/* Market Tab */}
          {activeTab === 'market' && (
            <>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-xs">Loading markets...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {marketData.slice(0, 15).map((crypto, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 rounded-xl p-2.5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {crypto.symbol.substring(0, 2)}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{crypto.symbol}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{crypto.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{formatPrice(crypto.price)}</p>
                          <div className="flex items-center gap-0.5 justify-end">
                            {crypto.priceChange24h >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span
                              className={`text-[10px] font-bold ${
                                crypto.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {crypto.priceChange24h >= 0 ? '+' : ''}
                              {crypto.priceChange24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Whales Tab */}
          {activeTab === 'whales' && (
            <>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-xs">Tracking whales...</p>
                </div>
              ) : whaleTransactions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800">
                  <WhaleIcon className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No whale activity</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {whaleTransactions.slice(0, 20).map((tx, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl p-2.5 shadow-sm border border-blue-100 dark:border-blue-900"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-600/10 backdrop-blur-sm flex items-center justify-center">
                            <WhaleIcon className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white/50 dark:bg-slate-900/50 rounded">
                            {tx.blockchain}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            {formatVolume(tx.valueUsd)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400">{tx.symbol}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(tx.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-xs">Finding hot tokens...</p>
                </div>
              ) : trendingTokens.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800">
                  <Flame className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No trending tokens</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trendingTokens.map((token, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 rounded-xl p-2.5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            <Flame className="w-4 h-4 text-white" />
                          </div>
                          {token.trending && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                              🔥
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{token.symbol}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{token.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-0.5 justify-end mb-0.5">
                            {token.priceChange >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            )}
                            <span
                              className={`text-xs font-bold ${
                                token.priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {token.priceChange >= 0 ? '+' : ''}
                              {token.priceChange.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {formatVolume(token.volume)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compact Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t shadow-lg">
        <div className="max-w-md mx-auto px-3 py-2 space-y-2">
          <Button
            onClick={loadData}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl h-9 shadow-md"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Refresh</span>
          </Button>
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 rounded-lg"
              onClick={() => window.open('https://defidashtracker.com', '_blank')}
            >
              <Eye className="w-3 h-3 mr-1" />
              Full
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 rounded-lg"
              onClick={() => router.push('/telegram-mini/notifications')}
            >
              <Settings className="w-3 h-3 mr-1" />
              Alerts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 rounded-lg"
              onClick={() => setActiveTab('market')}
            >
              <Trophy className="w-3 h-3 mr-1" />
              Quick
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
