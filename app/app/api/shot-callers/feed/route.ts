
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';
import { prisma } from '@/lib/db';

// Tracking prominent crypto KOLs for real-time intelligence
const TRACKED_ACCOUNTS = [
  'Defidash_Agent',    // Our AI DeFi agent
  'aixbt_agent',       // AI crypto analyst
  'RealDonaldTrump',   // Political influence on crypto  
  'cryptowendyo',      // Crypto Wendy O
  'CryptoExpert101',   // Crypto expert & analyst
  'pepecoineth',       // Pepe community leader
  '0xsweep',           // NFT & DeFi influencer
  'poe_real69',        // Crypto trader
  '100xdarren',        // Alt coin specialist
  '1crypticpoet',      // Crypto poet & analyst
  'bullrun_gravano',   // Bull market caller
  'JessePollak',       // Base ecosystem lead
  'jameswynn'          // Crypto & tech influencer
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const forceRefresh = searchParams.get('refresh') === 'true';

    console.log('🎯 Shot Callers Feed Request:', { category, limit, forceRefresh });
    console.log('📱 Tracking accounts:', TRACKED_ACCOUNTS);

    // Fetch fresh tweets from Twitter API and store in database
    const allTweets: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    let fromCache = false;
    
    // Try to fetch from Twitter API
    for (const username of TRACKED_ACCOUNTS) {
      try {
        // Ensure KOL profile exists in database
        let kolProfile = await prisma.kOLProfile.findUnique({
          where: { username }
        });

        // Only fetch from API if force refresh or not recently fetched
        const shouldFetchFromAPI = forceRefresh || 
          !kolProfile?.lastFetchedAt || 
          (Date.now() - kolProfile.lastFetchedAt.getTime()) > 5 * 60 * 1000; // 5 minutes

        if (!shouldFetchFromAPI && kolProfile) {
          console.log(`⚡ Using cached data for @${username}`);
          fromCache = true;
          
          // Get cached tweets from database
          const cachedTweets = await prisma.kOLTweet.findMany({
            where: { kolId: kolProfile.id },
            take: 10,
            orderBy: { createdAt: 'desc' }
          });

          const cachedKolProfile = kolProfile; // Store reference for closure
          cachedTweets.forEach((tweet: any) => {
            allTweets.push({
              id: tweet.tweetId,
              author: cachedKolProfile.displayName,
              username: cachedKolProfile.username,
              avatar: cachedKolProfile.profileImageUrl || getDefaultAvatar(cachedKolProfile.username),
              content: tweet.content,
              timestamp: formatTimestamp(tweet.createdAt.toISOString()),
              likes: tweet.likeCount,
              retweets: tweet.retweetCount,
              replies: tweet.replyCount,
              category: tweet.category || 'general',
              coins: tweet.coins,
              metadata: (tweet as any).metadata || {},
            });
          });

          continue;
        }

        console.log(`🔄 Fetching fresh tweets for @${username}...`);
        const response = await twitterClient.getUserTweets(username, 10);
        
        if (response.data && response.data.length > 0) {
          successCount++;
          const user = response.includes?.users?.[0];
          
          // Create or update KOL profile
          if (!kolProfile && user) {
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
              }
            });
            console.log(`✅ Created profile for @${username}`);
          } else if (kolProfile && user) {
            // Update existing profile
            await prisma.kOLProfile.update({
              where: { id: kolProfile.id },
              data: {
                displayName: user.name,
                profileImageUrl: user.profile_image_url,
                followersCount: user.public_metrics?.followers_count || 0,
                followingCount: user.public_metrics?.following_count || 0,
                tweetCount: user.public_metrics?.tweet_count || 0,
                isVerified: user.verified || false,
                lastFetchedAt: new Date(),
              }
            });
            console.log(`✅ Updated profile for @${username}`);
          }

          // Store tweets in database
          for (const tweet of response.data) {
            const category = twitterClient.categorizeTweet(tweet.text);
            const coins = twitterClient.extractCoinsFromTweet(tweet.text);
            const hashtags = tweet.entities?.hashtags?.map(h => h.tag) || [];
            const mentions = tweet.entities?.mentions?.map(m => m.username) || [];
            
            // Extract advanced metadata
            const tradingSignals = twitterClient.extractTradingSignals(tweet.text);
            const sentiment = twitterClient.extractSentiment(tweet.text);
            const technicalData = twitterClient.extractTechnicalIndicators(tweet.text);
            const alertMetadata = category === 'alert' ? twitterClient.extractAlertMetadata(tweet.text) : null;

            if (kolProfile) {
              // Upsert tweet (create or update if exists)
              const storedTweet = await prisma.kOLTweet.upsert({
                where: { tweetId: tweet.id },
                create: {
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
                  metadata: {
                    tradingSignals,
                    sentiment,
                    technicalData,
                    alertMetadata,
                  }
                },
                update: {
                  likeCount: tweet.public_metrics?.like_count || 0,
                  retweetCount: tweet.public_metrics?.retweet_count || 0,
                  replyCount: tweet.public_metrics?.reply_count || 0,
                  quoteCount: tweet.public_metrics?.quote_count || 0,
                  metadata: {
                    tradingSignals,
                    sentiment,
                    technicalData,
                    alertMetadata,
                  }
                }
              });

              // Create token calls if coins are mentioned
              if (coins.length > 0) {
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shot-callers/token-calls`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      tweetId: tweet.id,
                      kolUsername: username
                    })
                  });
                } catch (error) {
                  console.error('Error creating token calls:', error);
                }
              }
            }

            // Add to response
            allTweets.push({
              id: tweet.id,
              author: user?.name || username,
              username: username,
              avatar: user?.profile_image_url || getDefaultAvatar(username),
              content: tweet.text,
              timestamp: formatTimestamp(tweet.created_at),
              likes: tweet.public_metrics?.like_count || 0,
              retweets: tweet.public_metrics?.retweet_count || 0,
              replies: tweet.public_metrics?.reply_count || 0,
              category,
              coins,
              metadata: {
                tradingSignals,
                sentiment,
                technicalData,
                alertMetadata,
              }
            });
          }
        } else {
          errorCount++;
          console.log(`⚠️ No tweets returned for @${username}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error fetching tweets for ${username}:`, error);
      }
    }

    // If no tweets from API, fetch from database
    if (allTweets.length === 0) {
      console.log('📦 No fresh tweets available, loading from database...');
      fromCache = true;
      
      const dbTweets = await prisma.kOLTweet.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          kol: true
        }
      });

      console.log(`📊 Loaded ${dbTweets.length} tweets from database`);

      allTweets.push(...dbTweets.map((tweet: any) => ({
        id: tweet.tweetId,
        author: tweet.kol.displayName,
        username: tweet.kol.username,
        avatar: tweet.kol.profileImageUrl || getDefaultAvatar(tweet.kol.username),
        content: tweet.content,
        timestamp: formatTimestamp(tweet.createdAt.toISOString()),
        likes: tweet.likeCount,
        retweets: tweet.retweetCount,
        replies: tweet.replyCount,
        category: tweet.category || 'general',
        coins: tweet.coins,
        metadata: (tweet as any).metadata || {},
      })));
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

    console.log(`✅ Returning ${limitedTweets.length} tweets (${successCount} sources successful, ${errorCount} errors)`);

    return NextResponse.json({
      tweets: limitedTweets,
      count: limitedTweets.length,
      tracked_accounts: TRACKED_ACCOUNTS,
      status: {
        success: successCount,
        errors: errorCount,
        fromCache,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching feed:', error);
    
    // Try to return cached data on error
    try {
      const dbTweets = await prisma.kOLTweet.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { kol: true }
      });

      return NextResponse.json({
        tweets: dbTweets.map((tweet: any) => ({
          id: tweet.tweetId,
          author: tweet.kol.displayName,
          username: tweet.kol.username,
          avatar: tweet.kol.profileImageUrl || getDefaultAvatar(tweet.kol.username),
          content: tweet.content,
          timestamp: formatTimestamp(tweet.createdAt.toISOString()),
          likes: tweet.likeCount,
          retweets: tweet.retweetCount,
          replies: tweet.replyCount,
          category: tweet.category || 'general',
          coins: tweet.coins,
          metadata: (tweet as any).metadata || {},
        })),
        count: dbTweets.length,
        tracked_accounts: TRACKED_ACCOUNTS,
        status: {
          success: 0,
          errors: TRACKED_ACCOUNTS.length,
          fromCache: true,
          error: 'Using cached data due to API error',
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch feed',
          tweets: [],
          count: 0
        },
        { status: 500 }
      );
    }
  }
}

function getDefaultAvatar(username: string): string {
  const avatarMap: Record<string, string> = {
    'Defidash_Agent': '/images/defidash-agent-avatar.jpg',
    'defidash_agent': '/images/defidash-agent-avatar.jpg',
  };
  return avatarMap[username] || '/images/defidash-agent-avatar.jpg';
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
