
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Repeat2, MessageCircle, ExternalLink, Sparkles, TrendingUp, AlertCircle, Clock, Target, Zap } from 'lucide-react';

interface DetailedAlphaCardProps {
  tweet: {
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
    coins: string[];
    metadata?: {
      tradingSignals?: {
        action?: 'buy' | 'sell' | 'hold';
        priceTarget?: string;
        timeframe?: string;
        conviction?: 'high' | 'medium' | 'low';
        riskLevel?: 'high' | 'medium' | 'low';
      };
      sentiment?: {
        sentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
        confidence: number;
        keywords: string[];
      };
    };
  };
}

export default function DetailedAlphaCard({ tweet }: DetailedAlphaCardProps) {
  const { metadata } = tweet;
  const signals = metadata?.tradingSignals;
  const sentiment = metadata?.sentiment;

  const getConvictionColor = (conviction?: string) => {
    switch (conviction) {
      case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="h-3 w-3" />;
      case 'sell': return <Target className="h-3 w-3" />;
      case 'hold': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-500/50 transition-all">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-purple-500 ring-2 ring-purple-500/30">
            <AvatarImage src={tweet.avatar} alt={tweet.author} />
            <AvatarFallback>{tweet.author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-white">{tweet.author}</span>
              <span className="text-xs text-gray-400">@{tweet.username}</span>
              <span className="text-xs text-gray-500">• {tweet.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Alpha Signal
              </Badge>
              {sentiment && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {sentiment.confidence}% Confidence
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{tweet.content}</p>

        {/* Trading Signals Panel */}
        {signals && Object.keys(signals).length > 0 && (
          <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">Trading Signals</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {signals.action && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Action:</span>
                  <Badge variant="outline" className={`text-xs ${signals.action === 'buy' ? 'text-green-400 border-green-500/30' : signals.action === 'sell' ? 'text-red-400 border-red-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                    {getActionIcon(signals.action)}
                    <span className="ml-1 uppercase">{signals.action}</span>
                  </Badge>
                </div>
              )}
              {signals.priceTarget && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Target:</span>
                  <span className="text-xs font-bold text-green-400">{signals.priceTarget}</span>
                </div>
              )}
              {signals.timeframe && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300">{signals.timeframe} term</span>
                </div>
              )}
              {signals.conviction && (
                <Badge variant="outline" className={`text-xs ${getConvictionColor(signals.conviction)}`}>
                  Conviction: {signals.conviction}
                </Badge>
              )}
              {signals.riskLevel && (
                <Badge variant="outline" className={`text-xs ${getRiskColor(signals.riskLevel)}`}>
                  Risk: {signals.riskLevel}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Coin Tags */}
        {tweet.coins.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tweet.coins.map((coin) => (
              <Badge key={coin} variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono">
                ${coin}
              </Badge>
            ))}
          </div>
        )}

        {/* Sentiment Keywords */}
        {sentiment?.keywords && sentiment.keywords.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {sentiment.keywords.slice(0, 5).map((keyword, idx) => (
              <span key={idx} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        )}

        {/* Tweet Actions */}
        <div className="flex items-center gap-6 text-gray-400 text-sm pt-3 border-t border-purple-500/20">
          <div className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-pointer">
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{tweet.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors cursor-pointer">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs font-medium">{tweet.retweets.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{tweet.replies}</span>
          </div>
          <a 
            href={`https://x.com/${tweet.username}/status/${tweet.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 hover:text-purple-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-xs font-medium">View</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
