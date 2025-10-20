
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TrendingUp, MessageCircle, Heart, Repeat2, ExternalLink, Target, Activity, 
  Flame, Users, Zap, RefreshCw, ArrowLeft, Calendar, BarChart3, TrendingDown,
  AlertTriangle, Sparkles, Award, Clock, Eye
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface KOLData {
  profile: {
    username: string;
    displayName: string;
    avatar: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    isVerified: boolean;
    category?: string;
    influenceScore: number;
  };
  tweets: Array<{
    id: string;
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
    replies: number;
    category: string;
    coins: string[];
    isAlert: boolean;
  }>;
  stats: {
    totalTweets: number;
    totalEngagement: number;
    avgLikes: number;
    avgRetweets: number;
    topCoins: Array<{ coin: string; mentions: number }>;
    categories: Array<{ category: string; count: number }>;
  };
}

export default function KOLProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kolData, setKolData] = useState<KOLData | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchKOLData = async (showToast = true) => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/shot-callers/profile/${username}`);
      if (response.ok) {
        const data = await response.json();
        setKolData(data);
        if (showToast) {
          toast.success(`Loaded latest data for @${username}`);
        }
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching KOL data:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchKOLData(false);
      // Auto-refresh every 5 minutes
      const interval = setInterval(() => fetchKOLData(false), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [username]);

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bullish': return <TrendingUp className="h-3 w-3" />;
      case 'bearish': return <TrendingDown className="h-3 w-3" />;
      case 'alpha': return <Sparkles className="h-3 w-3" />;
      case 'alert': return <AlertTriangle className="h-3 w-3" />;
      case 'analysis': return <BarChart3 className="h-3 w-3" />;
      default: return <MessageCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!kolData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900/50 border-slate-800 p-8">
          <div className="text-center">
            <Target className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 mb-4">Could not load data for @{username}</p>
            <Button onClick={() => router.push('/shot-callers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shot Callers
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const filteredTweets = activeTab === 'all' 
    ? kolData.tweets 
    : kolData.tweets.filter(tweet => tweet.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/shot-callers')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shot Callers
        </Button>
      </div>

      {/* Profile Hero Section */}
      <Card className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-red-900/20 border-purple-500/30 mb-6 overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          <CardContent className="p-6 md:p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-purple-500 ring-4 ring-purple-500/30">
                  <AvatarImage src={kolData.profile.avatar} alt={kolData.profile.displayName} />
                  <AvatarFallback className="text-2xl">{kolData.profile.displayName[0]}</AvatarFallback>
                </Avatar>
                {kolData.profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                )}
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-green-600 animate-pulse">
                  <Activity className="h-2 w-2 mr-1" />
                  LIVE
                </Badge>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {kolData.profile.displayName}
                  </h1>
                  <Badge className={`${kolData.profile.category === 'Trader' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                    {kolData.profile.category || 'KOL'}
                  </Badge>
                </div>
                <a 
                  href={`https://x.com/${kolData.profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-blue-400 hover:text-blue-300 hover:underline mb-3 inline-block"
                >
                  @{kolData.profile.username}
                </a>
                {kolData.profile.bio && (
                  <p className="text-gray-300 mb-4 max-w-2xl">{kolData.profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{(kolData.profile.followersCount / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-pink-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{kolData.profile.tweetCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Tweets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">{kolData.profile.influenceScore}</p>
                      <p className="text-xs text-gray-400">Influence</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={() => fetchKOLData(true)}
                disabled={refreshing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="h-8 w-8 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Total
              </Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">{kolData.stats.totalTweets}</p>
            <p className="text-xs text-gray-400">Tracked Tweets</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-pink-400" />
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                Avg
              </Badge>
            </div>
            <p className="text-3xl font-bold text-pink-400">{kolData.stats.avgLikes.toFixed(0)}</p>
            <p className="text-xs text-gray-400">Likes per Tweet</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Repeat2 className="h-8 w-8 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Avg
              </Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{kolData.stats.avgRetweets.toFixed(0)}</p>
            <p className="text-xs text-gray-400">Retweets per Tweet</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-8 w-8 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Total
              </Badge>
            </div>
            <p className="text-3xl font-bold text-orange-400">{kolData.stats.totalEngagement.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Total Engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Coins & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Mentioned Coins */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Top Mentioned Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kolData.stats.topCoins.slice(0, 5).map((coin, idx) => (
                <div key={coin.coin} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                      idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-white font-medium">${coin.coin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(coin.mentions / kolData.stats.topCoins[0].mentions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">{coin.mentions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tweet Categories */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Tweet Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kolData.stats.categories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(cat.category)}`}>
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="text-white font-medium capitalize">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(cat.count / kolData.stats.totalTweets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tweets Feed */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Latest Tweets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid grid-cols-6 w-full bg-slate-800/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bullish">Bullish</TabsTrigger>
              <TabsTrigger value="alpha">Alpha</TabsTrigger>
              <TabsTrigger value="alert">Alerts</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="bearish">Bearish</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredTweets.map((tweet, idx) => (
                <Card 
                  key={tweet.id} 
                  className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all ${
                    tweet.isAlert ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Tweet Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getCategoryColor(tweet.category)}`}>
                          {getCategoryIcon(tweet.category)}
                          <span className="ml-1 capitalize">{tweet.category}</span>
                        </Badge>
                        {tweet.isAlert && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">
                            <AlertTriangle className="h-2 w-2 mr-1" />
                            ALERT
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {tweet.timestamp}
                      </div>
                    </div>

                    {/* Tweet Content */}
                    <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap leading-relaxed">
                      {tweet.content}
                    </p>

                    {/* Coin Tags */}
                    {tweet.coins.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tweet.coins.map((coin) => (
                          <Badge 
                            key={coin} 
                            variant="outline" 
                            className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 cursor-pointer"
                          >
                            ${coin}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Tweet Actions */}
                    <div className="flex items-center gap-6 text-gray-400 pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="text-xs font-medium">{tweet.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Repeat2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium">{tweet.retweets.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">{tweet.replies}</span>
                      </div>
                      <a 
                        href={`https://x.com/${kolData.profile.username}/status/${tweet.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1.5 hover:text-purple-500 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-xs">View on X</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTweets.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No tweets found in this category</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
