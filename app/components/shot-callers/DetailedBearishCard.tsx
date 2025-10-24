
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Repeat2, MessageCircle, ExternalLink, TrendingDown, AlertTriangle, Shield } from 'lucide-react';

interface DetailedBearishCardProps {
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
      sentiment?: {
        sentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
        confidence: number;
        keywords: string[];
      };
      tradingSignals?: {
        action?: 'buy' | 'sell' | 'hold';
        riskLevel?: 'high' | 'medium' | 'low';
      };
    };
  };
}

export default function DetailedBearishCard({ tweet }: DetailedBearishCardProps) {
  const { metadata } = tweet;
  const sentiment = metadata?.sentiment;
  const isVeryBearish = sentiment?.sentiment === 'very_bearish';
  const signals = metadata?.tradingSignals;

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30 hover:border-red-500/50 transition-all ${isVeryBearish ? 'ring-2 ring-red-500/30' : ''}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-red-500 ring-2 ring-red-500/30">
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
              <Badge className={`text-xs ${isVeryBearish ? 'bg-red-500/30 text-red-300 border-red-500/40' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                <TrendingDown className="h-3 w-3 mr-1" />
                {isVeryBearish ? 'VERY BEARISH' : 'BEARISH'}
              </Badge>
              {sentiment && (
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-300 border-red-500/20">
                  {sentiment.confidence}% Confidence
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{tweet.content}</p>

        {/* Risk Warning Panel */}
        {(sentiment || signals) && (
          <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Risk Signals</span>
              </div>
              {isVeryBearish && <Shield className="h-4 w-4 text-orange-500 animate-pulse" />}
            </div>
            
            {signals?.action === 'sell' && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Suggested Action:</span>
                <Badge variant="outline" className="text-xs text-red-400 border-red-500/30">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  SELL
                </Badge>
              </div>
            )}
            
            {signals?.riskLevel && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${getRiskColor(signals.riskLevel)}`}>
                  Risk Level: {signals.riskLevel.toUpperCase()}
                </Badge>
              </div>
            )}

            {sentiment?.keywords && sentiment.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sentiment.keywords.slice(0, 6).map((keyword, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-red-500/10 text-red-300 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Coin Tags */}
        {tweet.coins.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tweet.coins.map((coin) => (
              <Badge key={coin} variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30 font-mono font-bold">
                ${coin}
              </Badge>
            ))}
          </div>
        )}

        {/* Tweet Actions */}
        <div className="flex items-center gap-6 text-gray-400 text-sm pt-3 border-t border-red-500/20">
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
            className="ml-auto flex items-center gap-1.5 hover:text-red-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-xs font-medium">View</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
