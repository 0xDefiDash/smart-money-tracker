
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Repeat2, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TweetEngagementBar from './TweetEngagementBar';

interface TweetCardProps {
  tweet: {
    id: string;
    tweetId: string;
    content: string;
    createdAt: string;
    likeCount: number;
    retweetCount: number;
    category?: string;
    coins?: string[];
    sentiment?: string;
  };
  kol: {
    username: string;
    displayName: string;
    avatar: string;
    isVerified?: boolean;
  };
  walletAddresses?: {
    ethAddress?: string;
    bnbAddress?: string;
    solAddress?: string;
    usdcEthAddress?: string;
    usdcBnbAddress?: string;
    usdcSolAddress?: string;
  };
}

const categoryColors: Record<string, string> = {
  'market_analysis': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'trade_signal': 'bg-green-500/10 text-green-500 border-green-500/20',
  'news': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'degen': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'alpha': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'general': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

const sentimentColors: Record<string, string> = {
  'bullish': 'text-green-500',
  'bearish': 'text-red-500',
  'neutral': 'text-gray-500'
};

export default function EnhancedTweetCard({ tweet, kol, walletAddresses }: TweetCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={kol.avatar} alt={kol.displayName} />
            <AvatarFallback>{kol.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold truncate">{kol.displayName}</h4>
              {kol.isVerified && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  ✓
                </Badge>
              )}
              <a
                href={`https://x.com/${kol.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              @{kol.username} · {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
            </p>
          </div>

          {/* Category Badge */}
          {tweet.category && (
            <Badge 
              variant="outline" 
              className={categoryColors[tweet.category] || categoryColors['general']}
            >
              {tweet.category.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {tweet.content}
        </p>

        {/* Coins Mentioned */}
        {tweet.coins && tweet.coins.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tweet.coins.map((coin, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-mono bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                ${coin}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats & Sentiment */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Repeat2 className="h-3.5 w-3.5" />
            {tweet.retweetCount}
          </span>
          {tweet.sentiment && (
            <span className={`flex items-center gap-1 font-semibold ${sentimentColors[tweet.sentiment]}`}>
              {tweet.sentiment === 'bullish' && '📈'}
              {tweet.sentiment === 'bearish' && '📉'}
              {tweet.sentiment === 'neutral' && '➡️'}
              {tweet.sentiment.toUpperCase()}
            </span>
          )}
        </div>

        {/* Engagement Bar */}
        <TweetEngagementBar
          tweetId={tweet.tweetId}
          kolUsername={kol.username}
          kolDisplayName={kol.displayName}
          initialLikes={tweet.likeCount}
          initialComments={0}
          walletAddresses={walletAddresses}
        />
      </CardContent>
    </Card>
  );
}
