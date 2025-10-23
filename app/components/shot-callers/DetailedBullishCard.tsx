
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Repeat2, MessageCircle, ExternalLink, TrendingUp, Rocket, Flame } from 'lucide-react';

interface DetailedBullishCardProps {
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
        priceTarget?: string;
      };
    };
  };
}

export default function DetailedBullishCard({ tweet }: DetailedBullishCardProps) {
  const { metadata } = tweet;
  const sentiment = metadata?.sentiment;
  const isVeryBullish = sentiment?.sentiment === 'very_bullish';

  return (
    <Card className={`bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-500/50 transition-all ${isVeryBullish ? 'ring-2 ring-green-500/30' : ''}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-green-500 ring-2 ring-green-500/30">
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
              <Badge className={`text-xs ${isVeryBullish ? 'bg-green-500/30 text-green-300 border-green-500/40' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {isVeryBullish ? 'VERY BULLISH' : 'BULLISH'}
              </Badge>
              {sentiment && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/20">
                  {sentiment.confidence}% Confidence
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{tweet.content}</p>

        {/* Sentiment Panel */}
        {sentiment && (
          <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400">Bullish Signals</span>
              </div>
              {isVeryBullish && <Flame className="h-4 w-4 text-orange-500 animate-pulse" />}
            </div>
            {metadata?.tradingSignals?.priceTarget && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Price Target:</span>
                <span className="text-sm font-bold text-green-400">{metadata.tradingSignals.priceTarget}</span>
              </div>
            )}
            {sentiment.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sentiment.keywords.slice(0, 6).map((keyword, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-green-500/10 text-green-300 rounded-full">
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
              <Badge key={coin} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30 font-mono font-bold">
                ${coin}
              </Badge>
            ))}
          </div>
        )}

        {/* Tweet Actions */}
        <div className="flex items-center gap-6 text-gray-400 text-sm pt-3 border-t border-green-500/20">
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
            className="ml-auto flex items-center gap-1.5 hover:text-green-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-xs font-medium">View</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
