
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Repeat2, 
  ExternalLink, 
  RefreshCw, 
  Sparkles,
  Radio,
  ArrowUpRight,
  Users,
  DollarSign,
  Flame,
  AlertTriangle,
  BarChart3,
  Trophy,
  Crown,
  Star,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Tweet {
  id: string;
  author: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  category: string;
  coins?: string[];
  metadata?: any;
}

interface KOL {
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  tweets: number;
  verified: boolean;
  lastTweetTime: string;
  totalEngagement: number;
  coinsMentioned: number;
}

interface TokenMention {
  symbol: string;
  mentions: number;
  uniqueKOLs: number;
  totalEngagement: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  recentMentions: Array<{
    kol: string;
    timestamp: string;
    excerpt: string;
  }>;
}

export default function ShotCallersPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('feed');

  // Computed data
  const [kolList, setKolList] = useState<KOL[]>([]);
  const [tokenMentions, setTokenMentions] = useState<TokenMention[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Tweet[]>([]);
  const [alertPosts, setAlertPosts] = useState<Tweet[]>([]);

  // Fetch live tweets from X API
  const fetchLiveTweets = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh 
        ? `/api/shot-callers/feed?limit=50&refresh=true`
        : `/api/shot-callers/feed?limit=50`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (data.tweets && data.tweets.length > 0) {
          setTweets(data.tweets);
          setLastUpdate(new Date());
          processData(data.tweets);
          
          const statusMsg = data.status?.fromCache 
            ? `📦 Loaded ${data.tweets.length} cached posts`
            : `✅ Loaded ${data.tweets.length} fresh posts from X`;
          
          toast.success(statusMsg);
        } else {
          toast.info('No posts available yet. Check back soon!');
        }
      } else {
        toast.error('Failed to load posts. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Error connecting to X API');
    } finally {
      setLoading(false);
    }
  };

  // Process data for various sections
  const processData = (tweetsData: Tweet[]) => {
    // Process KOL list
    const kolMap = new Map<string, KOL>();
    tweetsData.forEach(tweet => {
      const existing = kolMap.get(tweet.username);
      const engagement = tweet.likes + tweet.retweets + tweet.replies;
      const coinCount = tweet.coins?.length || 0;
      
      if (existing) {
        existing.tweets += 1;
        existing.totalEngagement += engagement;
        existing.coinsMentioned += coinCount;
        existing.lastTweetTime = tweet.timestamp;
      } else {
        kolMap.set(tweet.username, {
          username: tweet.username,
          displayName: tweet.author,
          avatar: tweet.avatar,
          followers: 0, // Would need to fetch from API
          tweets: 1,
          verified: false,
          lastTweetTime: tweet.timestamp,
          totalEngagement: engagement,
          coinsMentioned: coinCount
        });
      }
    });
    
    const kols = Array.from(kolMap.values()).sort((a, b) => b.totalEngagement - a.totalEngagement);
    setKolList(kols);

    // Process token mentions
    const tokenMap = new Map<string, TokenMention>();
    tweetsData.forEach(tweet => {
      tweet.coins?.forEach(coin => {
        const existing = tokenMap.get(coin);
        const engagement = tweet.likes + tweet.retweets + tweet.replies;
        const sentiment = determineSentiment(tweet.category);
        
        if (existing) {
          existing.mentions += 1;
          existing.totalEngagement += engagement;
          if (!existing.recentMentions.some(m => m.kol === tweet.username)) {
            existing.uniqueKOLs += 1;
          }
          existing.recentMentions.push({
            kol: tweet.author,
            timestamp: tweet.timestamp,
            excerpt: tweet.content.substring(0, 100) + '...'
          });
        } else {
          tokenMap.set(coin, {
            symbol: coin,
            mentions: 1,
            uniqueKOLs: 1,
            totalEngagement: engagement,
            sentiment,
            recentMentions: [{
              kol: tweet.author,
              timestamp: tweet.timestamp,
              excerpt: tweet.content.substring(0, 100) + '...'
            }]
          });
        }
      });
    });
    
    const tokens = Array.from(tokenMap.values())
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 20);
    setTokenMentions(tokens);

    // Process trending posts (by engagement)
    const trending = [...tweetsData]
      .sort((a, b) => {
        const engagementA = a.likes + a.retweets * 2 + a.replies;
        const engagementB = b.likes + b.retweets * 2 + b.replies;
        return engagementB - engagementA;
      })
      .slice(0, 10);
    setTrendingPosts(trending);

    // Process alert posts
    const alerts = tweetsData.filter(t => t.category === 'alert').slice(0, 10);
    setAlertPosts(alerts);
  };

  const determineSentiment = (category: string): 'bullish' | 'bearish' | 'neutral' => {
    if (category === 'bullish') return 'bullish';
    if (category === 'bearish') return 'bearish';
    return 'neutral';
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchLiveTweets();
    const interval = setInterval(fetchLiveTweets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      'bullish': 'bg-green-500/20 text-green-300 border-green-500/50',
      'bearish': 'bg-red-500/20 text-red-300 border-red-500/50',
      'alpha': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'alert': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'analysis': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'general': 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    };
    return styles[category] || styles.general;
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      'bullish': 'text-green-400',
      'bearish': 'text-red-400',
      'neutral': 'text-gray-400'
    };
    return colors[sentiment] || colors.neutral;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTweetCard = (tweet: Tweet) => (
    <Card 
      key={tweet.id} 
      className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <CardContent className="p-4 sm:p-5">
        {/* Author Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-slate-700">
            <AvatarImage src={tweet.avatar} alt={tweet.author} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              {tweet.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-sm sm:text-base">{tweet.author}</h3>
              <a 
                href={`https://x.com/${tweet.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                @{tweet.username}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-[10px] sm:text-xs px-2 py-0.5 ${getCategoryBadge(tweet.category)}`}
              >
                {tweet.category.toUpperCase()}
              </Badge>
              <span className="text-xs text-gray-500">{tweet.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Tweet Content */}
        <div className="mb-4 pl-0 sm:pl-15">
          <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {tweet.content}
          </p>
          
          {/* Coin Tags */}
          {tweet.coins && tweet.coins.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tweet.coins.map((coin) => (
                <Badge 
                  key={coin} 
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 hover:border-purple-400/50 transition-colors cursor-pointer"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ${coin}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-gray-400 text-sm pl-0 sm:pl-15 pt-3 border-t border-slate-800">
          <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors group">
            <Heart className="h-4 w-4 group-hover:fill-pink-400" />
            <span className="text-xs sm:text-sm">{formatNumber(tweet.likes)}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors group">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs sm:text-sm">{formatNumber(tweet.retweets)}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">{formatNumber(tweet.replies)}</span>
          </button>
          <a 
            href={`https://x.com/${tweet.username}/status/${tweet.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
          >
            View on X
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse blur-md"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2">
                  <Radio className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
                  KOL Tracker
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 px-2 py-0.5">
                    <span className="animate-pulse mr-1">●</span> LIVE
                  </Badge>
                  {lastUpdate && (
                    <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLiveTweets(true)}
              disabled={loading}
              className="bg-slate-800/50 hover:bg-slate-700/50 border-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="feed" className="data-[state=active]:bg-purple-600">
              <Radio className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Live Feed</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="kols" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">KOLs</span>
              <span className="sm:hidden">KOLs</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-purple-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tokens</span>
              <span className="sm:hidden">Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              <Flame className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Hot</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Top</span>
            </TabsTrigger>
          </TabsList>

          {/* Live Feed Tab */}
          <TabsContent value="feed" className="space-y-3">
            {loading && tweets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-12 w-12 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400">Loading fresh posts from X...</p>
              </div>
            ) : tweets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No posts yet</h3>
                <p className="text-sm text-gray-500">Check back soon for fresh alpha!</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-3">
                {tweets.map(renderTweetCard)}
              </div>
            )}
          </TabsContent>

          {/* KOLs Tab */}
          <TabsContent value="kols" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kolList.map((kol) => (
                <Card key={kol.username} className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-purple-500/30">
                        <AvatarImage src={kol.avatar} alt={kol.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-lg">
                          {kol.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white truncate">{kol.displayName}</h3>
                          {kol.verified && <Star className="h-4 w-4 text-blue-400 fill-blue-400" />}
                        </div>
                        <a 
                          href={`https://x.com/${kol.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                        >
                          @{kol.username}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Posts</span>
                            <span className="text-white font-semibold">{kol.tweets}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Engagement</span>
                            <span className="text-purple-400 font-semibold">{formatNumber(kol.totalEngagement)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Coins Mentioned</span>
                            <span className="text-green-400 font-semibold">{kol.coinsMentioned}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Last post: {kol.lastTweetTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tokenMentions.map((token) => (
                <Card key={token.symbol} className="bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        {token.symbol}
                      </CardTitle>
                      <Badge className={`${getSentimentColor(token.sentiment)} border-current`} variant="outline">
                        {token.sentiment}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{token.mentions}</div>
                        <div className="text-xs text-gray-400">Mentions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{token.uniqueKOLs}</div>
                        <div className="text-xs text-gray-400">KOLs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">{formatNumber(token.totalEngagement)}</div>
                        <div className="text-xs text-gray-400">Engagement</div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-3">
                      <h4 className="text-xs font-semibold text-gray-400 mb-2">Recent Mentions</h4>
                      <div className="space-y-2">
                        {token.recentMentions.slice(0, 2).map((mention, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-purple-400 font-medium">{mention.kol}</span>
                              <span className="text-gray-500">{mention.timestamp}</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">{mention.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-3">
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 text-orange-400" />
                  <div>
                    <h3 className="font-bold text-white">🔥 Top Performing Posts</h3>
                    <p className="text-sm text-gray-400">Ranked by engagement (likes + retweets + replies)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="max-w-3xl mx-auto space-y-3">
              {trendingPosts.map((tweet, index) => (
                <div key={tweet.id} className="relative">
                  <div className="absolute -left-4 top-4 z-10">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full h-8 w-8 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  {renderTweetCard(tweet)}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-3">
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  <div>
                    <h3 className="font-bold text-white">⚠️ Critical Alerts</h3>
                    <p className="text-sm text-gray-400">Important market updates and warnings from KOLs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="max-w-3xl mx-auto space-y-3">
              {alertPosts.length > 0 ? (
                alertPosts.map(renderTweetCard)
              ) : (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No alerts at this time</h3>
                    <p className="text-sm text-gray-500">All quiet on the western front!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <div>
                    <h3 className="font-bold text-white">🏆 Top Influencers</h3>
                    <p className="text-sm text-gray-400">Ranked by total engagement and activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {kolList.slice(0, 10).map((kol, index) => (
                <Card key={kol.username} className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-slate-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <Avatar className="h-14 w-14 border-2 border-purple-500/30">
                        <AvatarImage src={kol.avatar} alt={kol.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                          {kol.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{kol.displayName}</h3>
                          {index < 3 && <Crown className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                        </div>
                        <a 
                          href={`https://x.com/${kol.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          @{kol.username}
                        </a>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-lg font-bold text-purple-400">{formatNumber(kol.totalEngagement)}</span>
                        </div>
                        <div className="text-xs text-gray-400">{kol.tweets} posts</div>
                        <div className="text-xs text-green-400">{kol.coinsMentioned} tokens</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Refresh Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/30 z-50"
        size="icon"
        onClick={() => fetchLiveTweets(true)}
        disabled={loading}
      >
        <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
