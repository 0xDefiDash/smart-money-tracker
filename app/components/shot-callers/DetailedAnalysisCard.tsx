
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Repeat2, MessageCircle, ExternalLink, BarChart3, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface DetailedAnalysisCardProps {
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
      technicalData?: {
        indicators: string[];
        levels: { type: string; value: string }[];
      };
      sentiment?: {
        sentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
        confidence: number;
        keywords: string[];
      };
    };
  };
}

export default function DetailedAnalysisCard({ tweet }: DetailedAnalysisCardProps) {
  const { metadata } = tweet;
  const technical = metadata?.technicalData;
  const sentiment = metadata?.sentiment;

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'very_bullish': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'bullish': return 'bg-green-500/15 text-green-300 border-green-500/20';
      case 'neutral': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'bearish': return 'bg-red-500/15 text-red-300 border-red-500/20';
      case 'very_bearish': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment?.includes('bullish')) return <TrendingUp className="h-3 w-3" />;
    if (sentiment?.includes('bearish')) return <TrendingDown className="h-3 w-3" />;
    return <Activity className="h-3 w-3" />;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 hover:border-blue-500/50 transition-all">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-blue-500 ring-2 ring-blue-500/30">
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
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Technical Analysis
              </Badge>
              {sentiment && (
                <Badge variant="outline" className={`text-xs ${getSentimentColor(sentiment.sentiment)}`}>
                  {getSentimentIcon(sentiment.sentiment)}
                  <span className="ml-1">{sentiment.sentiment.replace('_', ' ').toUpperCase()}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{tweet.content}</p>

        {/* Technical Analysis Panel */}
        {technical && (technical.indicators.length > 0 || technical.levels.length > 0) && (
          <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">Technical Indicators</span>
            </div>
            
            {/* Indicators */}
            {technical.indicators.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {technical.indicators.map((indicator, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/30">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Support/Resistance Levels */}
            {technical.levels.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {technical.levels.map((level, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Target className={`h-3 w-3 ${level.type === 'support' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-xs text-gray-400 capitalize">{level.type}:</span>
                    <span className={`text-xs font-bold ${level.type === 'support' ? 'text-green-400' : 'text-red-400'}`}>
                      ${level.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sentiment Analysis */}
        {sentiment && sentiment.confidence > 0 && (
          <div className="mb-4 p-3 bg-slate-500/10 rounded-lg border border-slate-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Sentiment Analysis</span>
              <Badge variant="outline" className="text-xs bg-slate-500/10 text-slate-300 border-slate-500/30">
                {sentiment.confidence}% Confidence
              </Badge>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  sentiment.sentiment.includes('bullish') ? 'bg-green-500' : 
                  sentiment.sentiment.includes('bearish') ? 'bg-red-500' : 'bg-gray-500'
                }`}
                style={{ width: `${sentiment.confidence}%` }}
              />
            </div>
          </div>
        )}

        {/* Coin Tags */}
        {tweet.coins.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tweet.coins.map((coin) => (
              <Badge key={coin} variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono">
                ${coin}
              </Badge>
            ))}
          </div>
        )}

        {/* Tweet Actions */}
        <div className="flex items-center gap-6 text-gray-400 text-sm pt-3 border-t border-blue-500/20">
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
            className="ml-auto flex items-center gap-1.5 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-xs font-medium">View</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
