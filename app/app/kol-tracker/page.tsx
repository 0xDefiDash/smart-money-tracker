
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown,
  MessageCircle, 
  Heart, 
  Repeat2, 
  ExternalLink, 
  Target, 
  Activity, 
  Flame, 
  Users, 
  Zap, 
  RefreshCw, 
  Database, 
  Wallet, 
  DollarSign,
  Search,
  Crown,
  Medal,
  Award,
  Star,
  BarChart3
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import UnifiedTweetCard from '@/components/shot-callers/UnifiedTweetCard';

interface KOL {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  category: string;
  influence: number;
  winRate: number;
  totalCalls: number;
  avgROI: number;
  isTracked: boolean;
  isVerified: boolean;
}

export default function KOLTrackerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [kols, setKols] = useState<KOL[]>([]);
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [tweets, setTweets] = useState<any[]>([]);
  const [tokenCalls, setTokenCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [feedStatus, setFeedStatus] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'influence' | 'winRate' | 'calls' | 'roi'>('influence');

  // Fetch KOL profiles
  const fetchKOLs = async () => {
    try {
      const response = await fetch('/api/shot-callers/kols');
      if (response.ok) {
        const data = await response.json();
        setKols(data.kols || []);
      }
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      toast.error('Failed to load KOL profiles');
    }
  };

  // Fetch live tweets from tracked KOLs
  const fetchLiveTweets = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh 
        ? `/api/shot-callers/feed?limit=50&refresh=true`
        : `/api/shot-callers/feed?limit=50`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (data.status) {
          setFeedStatus(data.status);
        }
        
        if (data.tweets && data.tweets.length > 0) {
          setTweets(data.tweets);
          setLastUpdate(new Date());
          
          const statusMsg = data.status?.fromCache 
            ? `📦 Loaded ${data.tweets.length} cached tweets`
            : `✅ Loaded ${data.tweets.length} fresh tweets from X API`;
          
          toast.success(statusMsg);
        }
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Error connecting to X API');
    } finally {
      setLoading(false);
    }
  };

  // Fetch token calls
  const fetchTokenCalls = async () => {
    try {
      const response = await fetch('/api/shot-callers/token-calls?limit=100');
      if (response.ok) {
        const data = await response.json();
        setTokenCalls(data.calls || []);
      }
    } catch (error) {
      console.error('Error fetching token calls:', error);
    }
  };

  useEffect(() => {
    fetchKOLs();
    fetchLiveTweets();
    fetchTokenCalls();
    
    const interval = setInterval(() => {
      fetchLiveTweets();
      fetchTokenCalls();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const sortedKOLs = [...kols].sort((a, b) => {
    switch (sortBy) {
      case 'influence':
        return b.influence - a.influence;
      case 'winRate':
        return b.winRate - a.winRate;
      case 'calls':
        return b.totalCalls - a.totalCalls;
      case 'roi':
        return b.avgROI - a.avgROI;
      default:
        return b.influence - a.influence;
    }
  });

  const filteredKOLs = searchQuery
    ? sortedKOLs.filter(
        kol =>
          kol.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kol.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedKOLs;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-orange-600" />;
    return <Star className="h-4 w-4 text-gray-500" />;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
    if (index === 2) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30';
    return 'bg-slate-900/50 border-slate-800';
  };

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
              KOL Tracker
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">Track Top Crypto Influencers & Their Token Calls</p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs whitespace-nowrap">
                <Activity className="h-2 w-2 mr-1 animate-pulse" />
                {kols.filter(k => k.isTracked).length} KOLs Tracked
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Total KOLs</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{kols.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Total Calls</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-400">{tokenCalls.length}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Avg Win Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {kols.length > 0 ? ((kols.reduce((sum, k) => sum + k.winRate, 0) / kols.length) || 0).toFixed(0) : 0}%
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">Recent Tweets</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-400">{tweets.length}</p>
                </div>
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full bg-slate-800/50 h-auto gap-1 p-1">
          <TabsTrigger value="leaderboard" className="text-xs sm:text-sm py-2">
            <Crown className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="token-calls" className="text-xs sm:text-sm py-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Token Calls
          </TabsTrigger>
          <TabsTrigger value="feed" className="text-xs sm:text-sm py-2">
            <Activity className="h-4 w-4 mr-2" />
            Live Feed
          </TabsTrigger>
        </TabsList>

        {/* KOL Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  KOL Leaderboard
                </CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search KOLs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full bg-slate-800 border-slate-700"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchKOLs()}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  variant={sortBy === 'influence' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('influence')}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Influence
                </Button>
                <Button
                  variant={sortBy === 'winRate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('winRate')}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Win Rate
                </Button>
                <Button
                  variant={sortBy === 'calls' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('calls')}
                >
                  <Target className="h-3 w-3 mr-1" />
                  Calls
                </Button>
                <Button
                  variant={sortBy === 'roi' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('roi')}
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  Avg ROI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredKOLs.map((kol, index) => (
                    <Card key={kol.id} className={getRankColor(index)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            {getRankIcon(index)}
                            <span className="text-xs text-gray-400">#{index + 1}</span>
                          </div>
                          
                          <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-purple-500/30">
                            <AvatarImage src={kol.avatar} alt={kol.displayName} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {kol.displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white truncate">{kol.displayName}</h3>
                              {kol.isVerified && (
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-[10px]">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <a 
                              href={`https://x.com/${kol.username}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                            >
                              @{kol.username}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                              <div className="bg-black/30 rounded p-2">
                                <p className="text-[10px] text-gray-400">Influence</p>
                                <p className="text-sm font-bold text-purple-400">{kol.influence}/100</p>
                              </div>
                              <div className="bg-black/30 rounded p-2">
                                <p className="text-[10px] text-gray-400">Win Rate</p>
                                <p className="text-sm font-bold text-green-400">{kol.winRate}%</p>
                              </div>
                              <div className="bg-black/30 rounded p-2">
                                <p className="text-[10px] text-gray-400">Calls</p>
                                <p className="text-sm font-bold text-pink-400">{kol.totalCalls}</p>
                              </div>
                              <div className="bg-black/30 rounded p-2">
                                <p className="text-[10px] text-gray-400">Avg ROI</p>
                                <p className={`text-sm font-bold ${kol.avgROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {kol.avgROI > 0 ? '+' : ''}{kol.avgROI}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                              {(kol.followers / 1000).toFixed(0)}K followers
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedKOL(kol.username)}
                              className="text-xs"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Calls Tab */}
        <TabsContent value="token-calls" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                Token Calls Leaderboard
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                Ranked by ROI performance from top KOLs
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {tokenCalls
                    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
                    .slice(0, 50)
                    .map((call, index) => (
                      <Card key={call.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center flex-shrink-0">
                              <span className="text-xs text-gray-400">#{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">${call.tokenSymbol}</span>
                                {call.tokenName && (
                                  <span className="text-xs text-gray-400 truncate">{call.tokenName}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>Called by @{call.kolUsername}</span>
                                <span>•</span>
                                <span>{new Date(call.calledAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 items-center flex-shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-gray-400">ROI</p>
                                <p className={`text-lg font-bold ${(call.roi || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {(call.roi || 0) > 0 ? '+' : ''}{(call.roi || 0).toFixed(1)}%
                                </p>
                              </div>
                              {call.isWin !== null && (
                                <Badge className={call.isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {call.isWin ? 'WIN' : 'LOSS'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Live Feed from KOLs
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLiveTweets(false)}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => fetchLiveTweets(true)}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Force Update
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {tweets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No tweets found</h3>
                    <p className="text-sm text-gray-500">Check back soon for fresh alpha</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tweets.map((tweet) => (
                      <UnifiedTweetCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
        size="icon"
        onClick={() => {
          fetchKOLs();
          fetchLiveTweets(true);
          fetchTokenCalls();
        }}
        title="Refresh all data"
      >
        <RefreshCw className={`h-5 w-5 sm:h-6 sm:w-6 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
