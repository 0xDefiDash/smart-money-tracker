
'use client';

import DetailedAlphaCard from './DetailedAlphaCard';
import DetailedAlertCard from './DetailedAlertCard';
import DetailedAnalysisCard from './DetailedAnalysisCard';
import DetailedBullishCard from './DetailedBullishCard';
import DetailedBearishCard from './DetailedBearishCard';

interface UnifiedTweetCardProps {
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
    metadata?: any;
  };
}

export default function UnifiedTweetCard({ tweet }: UnifiedTweetCardProps) {
  // Render the appropriate card component based on category
  switch (tweet.category) {
    case 'alpha':
      return <DetailedAlphaCard tweet={tweet} />;
    case 'alert':
      return <DetailedAlertCard tweet={tweet} />;
    case 'analysis':
      return <DetailedAnalysisCard tweet={tweet} />;
    case 'bullish':
      return <DetailedBullishCard tweet={tweet} />;
    case 'bearish':
      return <DetailedBearishCard tweet={tweet} />;
    default:
      // For uncategorized tweets, show as alpha card
      return <DetailedAlphaCard tweet={tweet} />;
  }
}
