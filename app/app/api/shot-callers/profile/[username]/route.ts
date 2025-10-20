
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { twitterClient } from '@/lib/twitter-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;

    // Fetch KOL profile from database
    let kolProfile = await prisma.kOLProfile.findUnique({
      where: { username },
      include: {
        tweets: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    // If profile doesn't exist, try to fetch from Twitter API
    if (!kolProfile) {
      const response = await twitterClient.getUserTweets(username, 10);
      
      if (response.data && response.includes?.users?.[0]) {
        const user = response.includes.users[0];
        
        // Create new profile
        kolProfile = await prisma.kOLProfile.create({
          data: {
            username,
            displayName: user.name,
            twitterUserId: user.id,
            profileImageUrl: user.profile_image_url,
            followersCount: user.public_metrics?.followers_count || 0,
            followingCount: user.public_metrics?.following_count || 0,
            tweetCount: user.public_metrics?.tweet_count || 0,
            isVerified: user.verified || false,
            isTracked: true,
            lastFetchedAt: new Date(),
          },
          include: {
            tweets: {
              orderBy: { createdAt: 'desc' },
              take: 50
            }
          }
        });

        // Store tweets
        for (const tweet of response.data) {
          const category = twitterClient.categorizeTweet(tweet.text);
          const coins = twitterClient.extractCoinsFromTweet(tweet.text);
          const hashtags = tweet.entities?.hashtags?.map(h => h.tag) || [];
          const mentions = tweet.entities?.mentions?.map(m => m.username) || [];

          await prisma.kOLTweet.create({
            data: {
              kolId: kolProfile.id,
              tweetId: tweet.id,
              content: tweet.text,
              createdAt: new Date(tweet.created_at),
              likeCount: tweet.public_metrics?.like_count || 0,
              retweetCount: tweet.public_metrics?.retweet_count || 0,
              replyCount: tweet.public_metrics?.reply_count || 0,
              quoteCount: tweet.public_metrics?.quote_count || 0,
              category,
              coins,
              hashtags,
              mentions,
              isAlert: category === 'alert',
            }
          });
        }

        // Refresh profile with tweets
        kolProfile = await prisma.kOLProfile.findUnique({
          where: { username },
          include: {
            tweets: {
              orderBy: { createdAt: 'desc' },
              take: 50
            }
          }
        });
      }
    }

    if (!kolProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalTweets = kolProfile.tweets.length;
    const totalLikes = kolProfile.tweets.reduce((sum, t) => sum + t.likeCount, 0);
    const totalRetweets = kolProfile.tweets.reduce((sum, t) => sum + t.retweetCount, 0);
    const totalReplies = kolProfile.tweets.reduce((sum, t) => sum + t.replyCount, 0);
    const totalEngagement = totalLikes + totalRetweets + totalReplies;

    // Top coins
    const coinCounts = new Map<string, number>();
    kolProfile.tweets.forEach(tweet => {
      tweet.coins.forEach(coin => {
        coinCounts.set(coin, (coinCounts.get(coin) || 0) + 1);
      });
    });
    const topCoins = Array.from(coinCounts.entries())
      .map(([coin, mentions]) => ({ coin, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);

    // Category distribution
    const categoryCounts = new Map<string, number>();
    kolProfile.tweets.forEach(tweet => {
      const cat = tweet.category || 'general';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
    const categories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Format tweets
    const formattedTweets = kolProfile.tweets.map(tweet => ({
      id: tweet.tweetId,
      content: tweet.content,
      timestamp: formatTimestamp(tweet.createdAt.toISOString()),
      likes: tweet.likeCount,
      retweets: tweet.retweetCount,
      replies: tweet.replyCount,
      category: tweet.category || 'general',
      coins: tweet.coins,
      isAlert: tweet.isAlert,
    }));

    // Get default avatar based on username
    const getDefaultAvatar = (username: string): string => {
      const avatarMap: Record<string, string> = {
        'CryptoExpert101': '/Uploads/cryptoExpert101.jpg',
        'JamesWynnReal': '/Uploads/James wynn.jpg',
        '100xDarren': '/Uploads/100xdarren.jpg',
        'BullRunGravano': '/Uploads/bullrun Gravano.jpg',
      };
      return avatarMap[username] || '/Uploads/cryptoExpert101.jpg';
    };

    return NextResponse.json({
      profile: {
        username: kolProfile.username,
        displayName: kolProfile.displayName,
        avatar: kolProfile.profileImageUrl || getDefaultAvatar(kolProfile.username),
        bio: kolProfile.bio,
        followersCount: kolProfile.followersCount,
        followingCount: kolProfile.followingCount,
        tweetCount: kolProfile.tweetCount,
        isVerified: kolProfile.isVerified,
        category: kolProfile.category,
        influenceScore: kolProfile.influenceScore,
      },
      tweets: formattedTweets,
      stats: {
        totalTweets,
        totalEngagement,
        avgLikes: totalTweets > 0 ? totalLikes / totalTweets : 0,
        avgRetweets: totalTweets > 0 ? totalRetweets / totalTweets : 0,
        topCoins,
        categories,
      }
    });
  } catch (error) {
    console.error('Error fetching KOL profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
