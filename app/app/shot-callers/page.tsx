
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, MessageCircle, Heart, Repeat2, ExternalLink, Target, Activity, Flame, Users, Zap, RefreshCw, Database, Wallet, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TokenCallsSection from '@/components/shot-callers/TokenCallsSection';
import EnhancedTweetCard from '@/components/shot-callers/EnhancedTweetCard';
import DetailedAlphaCard from '@/components/shot-callers/DetailedAlphaCard';
import DetailedAlertCard from '@/components/shot-callers/DetailedAlertCard';
import DetailedAnalysisCard from '@/components/shot-callers/DetailedAnalysisCard';
import DetailedBullishCard from '@/components/shot-callers/DetailedBullishCard';
import DetailedBearishCard from '@/components/shot-callers/DetailedBearishCard';
import UnifiedTweetCard from '@/components/shot-callers/UnifiedTweetCard';
import { useWeb3 } from '@/lib/web3-provider';

// DeFiDash Agent account info
const defidashAgent = {
  id: '1',
  username: 'Defidash_Agent',
  displayName: 'DeFiDash Agent',
  avatar: '/images/defidash-agent-avatar.jpg',
  followers: 'Growing',
  category: 'DeFi Intelligence',
  influence: 100,
  recentAlpha: '🔴 LIVE: Real-time whale tracking, token calls & DeFi insights',
  isTracked: true,
  description: 'Your AI-powered DeFi intelligence hub tracking whale movements, market trends, and token opportunities in real-time.'
};

// No more mock data - all tweets are fetched live from X API

export default function ShotCallersPage() {
  const router = useRouter();
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [kolWallets, setKolWallets] = useState<Record<string, any>>({});
  const [feedStatus, setFeedStatus] = useState<{
    success: number;
    errors: number;
    fromCache: boolean;
    timestamp?: string;
  } | null>(null);

  // Seed KOL wallets on mount
  useEffect(() => {
    const seedWallets = async () => {
      try {
        const response = await fetch('/api/shot-callers/kols/wallets/seed', {
          method: 'POST'
        });
        if (response.ok) {
          const data = await response.json();
          const walletsMap: Record<string, any> = {};
          data.wallets.forEach((wallet: any) => {
            walletsMap[wallet.kolUsername] = wallet;
          });
          setKolWallets(walletsMap);
        }
      } catch (error) {
        console.error('Error seeding wallets:', error);
      }
    };
    seedWallets();
  }, []);

  // Fetch live tweets from tracked accounts
  const fetchLiveTweets = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh 
        ? `/api/shot-callers/feed?limit=20&refresh=true`
        : `/api/shot-callers/feed?limit=20`;
      
      console.log('📱 Fetching tweets...', forceRefresh ? '(Force refresh)' : '');
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Update status
        if (data.status) {
          setFeedStatus(data.status);
        }
        
        if (data.tweets && data.tweets.length > 0) {
          setTweets(data.tweets);
          setLastUpdate(new Date());
          
          const statusMsg = data.status?.fromCache 
            ? `📦 Loaded ${data.tweets.length} cached tweets`
            : `✅ Loaded ${data.tweets.length} fresh tweets from X API (${data.status?.success || 0}/${data.tracked_accounts?.length || 0} sources)`;
          
          toast.success(statusMsg);
          
          console.log('📊 Feed status:', data.status);
        } else {
          toast.info('No tweets available at this time.');
        }
      } else {
        console.error('Failed to fetch tweets', response.status);
        toast.error('Failed to load tweets. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Error connecting to X API. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh tweets every 5 minutes
  useEffect(() => {
    fetchLiveTweets();
    const interval = setInterval(fetchLiveTweets, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'bullish': 'bg-green-500/10 text-green-500 border-green-500/20',
      'bearish': 'bg-red-500/10 text-red-500 border-red-500/20',
      'alpha': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'alert': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'analysis': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getInfluenceColor = (influence: number) => {
    if (influence >= 95) return 'text-yellow-500';
    if (influence >= 90) return 'text-orange-500';
    if (influence >= 85) return 'text-blue-500';
    return 'text-gray-500';
  };

  const filteredTweets = activeTab === 'all' 
    ? tweets 
    : tweets.filter(tweet => tweet.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <Target className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text truncate">
              DeFiDash Feed
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">Real-Time Whale Tracking, Token Calls & DeFi Intelligence from @Defidash_Agent</p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs whitespace-nowrap">
                <Activity className="h-2 w-2 mr-1 animate-pulse" />
                Live Updates
              </Badge>
            </div>
          </div>
          {/* Wallet Connection */}
          <div className="w-full sm:w-auto flex-shrink-0">
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
                size="sm"
              >
                <Wallet className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Connect Wallet</span>
                <span className="xs:hidden">Connect</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 px-2 sm:px-3 py-1 sm:py-2 text-xs flex-1 sm:flex-initial justify-center">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {account?.slice(0, 4)}...{account?.slice(-3)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-xs"
                >
                  <span className="hidden sm:inline">Disconnect</span>
                  <span className="sm:hidden">✕</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Total Posts</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{tweets.length}</p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Token Calls</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-400">{tweets.filter(t => t.coins?.length > 0).length}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Whale Alerts</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">{tweets.filter(t => t.category === 'alert').length}</p>
                </div>
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Analysis</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-400">{tweets.filter(t => t.category === 'analysis').length}</p>
                </div>
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* DeFiDash Agent Profile */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              Live Intelligence Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 border-purple-500 ring-2 ring-purple-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 border-2 border-purple-500 ring-2 ring-purple-500/50">
                    <AvatarImage src={defidashAgent.avatar} alt={defidashAgent.displayName} />
                    <AvatarFallback className="bg-purple-600 text-white text-xl">DA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-lg sm:text-xl">{defidashAgent.displayName}</h3>
                      <div className="flex items-center gap-1 text-purple-400">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-bold">{defidashAgent.influence}</span>
                      </div>
                    </div>
                    <a 
                      href={`https://x.com/${defidashAgent.username}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 mb-3"
                    >
                      @{defidashAgent.username}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-3">
                      <Activity className="h-3 w-3 mr-1 animate-pulse" />
                      LIVE NOW
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {defidashAgent.category}
                  </Badge>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {defidashAgent.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-black/30 rounded-lg border border-purple-500/20">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Posts Today</p>
                    <p className="text-lg font-bold text-purple-400">{tweets.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Token Calls</p>
                    <p className="text-lg font-bold text-pink-400">{tweets.filter(t => t.coins?.length > 0).length}</p>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => window.open(`https://x.com/${defidashAgent.username}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Follow on X
                </Button>
              </CardContent>
            </Card>

            {/* Feed Status */}
            {feedStatus && (
              <Card className="mt-4 bg-slate-800/50 border-slate-700">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-gray-300 mb-2">Feed Status</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source:</span>
                      <span className={feedStatus.fromCache ? 'text-yellow-400' : 'text-green-400'}>
                        {feedStatus.fromCache ? '📦 Cached' : '🔴 Live X API'}
                      </span>
                    </div>
                    {!feedStatus.fromCache && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">API Status:</span>
                        <span className="text-green-400">✓ Connected</span>
                      </div>
                    )}
                    {lastUpdate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Update:</span>
                        <span className="text-gray-300">{lastUpdate.toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Tweets Feed */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 mb-1 text-base sm:text-lg flex-wrap">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  <span className="truncate">Live Alpha Feed</span>
                  {feedStatus && (
                    <Badge 
                      className={`text-[10px] sm:text-xs ${
                        feedStatus.fromCache 
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}
                    >
                      {feedStatus.fromCache ? '📦 Cached' : '🔴 Live'}
                    </Badge>
                  )}
                </CardTitle>
                {lastUpdate && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-gray-400">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                    {feedStatus && !feedStatus.fromCache && (
                      <p className="text-xs text-green-400">
                        • {feedStatus.success}/{feedStatus.success + feedStatus.errors} sources active
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1 sm:flex-initial"
                  onClick={() => fetchLiveTweets(false)}
                  disabled={loading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-1 sm:flex-initial"
                  onClick={() => fetchLiveTweets(true)}
                  disabled={loading}
                >
                  <Activity className={`h-3 w-3 mr-1 ${loading ? 'animate-pulse' : ''}`} />
                  Force Update
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-slate-800/50 h-auto gap-1 p-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm py-2">All</TabsTrigger>
                <TabsTrigger value="bullish" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Bullish</span>
                  <span className="sm:hidden">📈</span>
                </TabsTrigger>
                <TabsTrigger value="alpha" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Alpha</span>
                  <span className="sm:hidden">⚡</span>
                </TabsTrigger>
                <TabsTrigger value="alert" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Alerts</span>
                  <span className="sm:hidden">🚨</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Analysis</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger value="bearish" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Bearish</span>
                  <span className="sm:hidden">📉</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-400px)]">
                  {filteredTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No tweets found</h3>
                      <p className="text-sm text-gray-500">Check back soon for fresh alpha from top Shot Callers</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTweets.map((tweet) => (
                        <UnifiedTweetCard key={tweet.id} tweet={tweet} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bullish" className="mt-4">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-400px)]">
                  {filteredTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <TrendingUp className="h-12 w-12 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No bullish signals</h3>
                      <p className="text-sm text-gray-500">Waiting for bullish alpha from Shot Callers</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTweets.map((tweet) => (
                        <DetailedBullishCard key={tweet.id} tweet={tweet} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="alpha" className="mt-4">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-400px)]">
                  {filteredTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Target className="h-12 w-12 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No alpha signals</h3>
                      <p className="text-sm text-gray-500">Stay tuned for exclusive alpha opportunities</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTweets.map((tweet) => (
                        <DetailedAlphaCard key={tweet.id} tweet={tweet} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="alert" className="mt-4">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-400px)]">
                  {filteredTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Activity className="h-12 w-12 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No active alerts</h3>
                      <p className="text-sm text-gray-500">All quiet on the crypto front</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTweets.map((tweet) => (
                        <DetailedAlertCard key={tweet.id} tweet={tweet} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-400px)]">
                  {filteredTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Activity className="h-12 w-12 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No analysis available</h3>
                      <p className="text-sm text-gray-500">Waiting for technical analysis from experts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTweets.map((tweet) => (
                        <DetailedAnalysisCard key={tweet.id} tweet={tweet} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bearish" className="mt-4">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-400px)]">
                  {filteredTweets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <TrendingUp className="h-12 w-12 text-gray-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No bearish signals</h3>
                      <p className="text-sm text-gray-500">All systems are go! 🚀</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTweets.map((tweet) => (
                        <DetailedBearishCard key={tweet.id} tweet={tweet} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Compact Token Calls Section */}
      <div className="mt-4 sm:mt-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <span className="truncate">Token Calls Tracker</span>
              <Badge variant="outline" className="ml-2 text-xs border-green-500/50 text-green-400">
                Live
              </Badge>
            </CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              Real-time token calls from top crypto influencers with performance tracking
            </p>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <TokenCallsSection />
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50 touch-manipulation"
        size="icon"
        onClick={() => fetchLiveTweets(true)}
        title="Force refresh from X API"
      >
        <RefreshCw className={`h-5 w-5 sm:h-6 sm:w-6 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
