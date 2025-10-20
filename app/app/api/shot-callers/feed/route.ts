
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';

// List of tracked KOL accounts
const TRACKED_ACCOUNTS = [
  'CryptoExpert101',
  // Add more accounts here as needed
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch tweets from all tracked accounts
    const allTweets: any[] = [];
    
    for (const username of TRACKED_ACCOUNTS) {
      try {
        const response = await twitterClient.getUserTweets(username, 5);
        
        if (response.data) {
          const user = response.includes?.users?.[0];
          
          const processedTweets = response.data.map(tweet => ({
            id: tweet.id,
            author: user?.name || username,
            username: username,
            avatar: user?.profile_image_url || `/Uploads/cryptoExpert101.jpg`,
            content: tweet.text,
            timestamp: formatTimestamp(tweet.created_at),
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
            category: twitterClient.categorizeTweet(tweet.text),
            coins: twitterClient.extractCoinsFromTweet(tweet.text),
          }));
          
          allTweets.push(...processedTweets);
        }
      } catch (error) {
        console.error(`Error fetching tweets for ${username}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    allTweets.sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp);
      const timeB = parseTimestamp(b.timestamp);
      return timeB - timeA;
    });

    // Filter by category if specified
    let filteredTweets = allTweets;
    if (category && category !== 'all') {
      filteredTweets = allTweets.filter(tweet => tweet.category === category);
    }

    // Limit results
    const limitedTweets = filteredTweets.slice(0, limit);

    return NextResponse.json({
      tweets: limitedTweets,
      count: limitedTweets.length,
      tracked_accounts: TRACKED_ACCOUNTS,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function parseTimestamp(timestamp: string): number {
  if (timestamp.includes('m ago')) {
    const mins = parseInt(timestamp);
    return Date.now() - mins * 60000;
  }
  if (timestamp.includes('h ago')) {
    const hours = parseInt(timestamp);
    return Date.now() - hours * 3600000;
  }
  if (timestamp.includes('d ago')) {
    const days = parseInt(timestamp);
    return Date.now() - days * 86400000;
  }
  return new Date(timestamp).getTime();
}
