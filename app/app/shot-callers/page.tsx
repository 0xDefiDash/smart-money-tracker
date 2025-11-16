
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Repeat2, 
  ExternalLink, 
  RefreshCw, 
  Sparkles,
  Radio,
  ArrowUpRight
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
}

export default function ShotCallersPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch live tweets from X API
  const fetchLiveTweets = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh 
        ? `/api/shot-callers/feed?limit=30&refresh=true`
        : `/api/shot-callers/feed?limit=30`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (data.tweets && data.tweets.length > 0) {
          setTweets(data.tweets);
          setLastUpdate(new Date());
          
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
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
                  Live Feed
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

      {/* Main Content - Single Column Feed */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
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
          tweets.map((tweet) => (
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
          ))
        )}
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
