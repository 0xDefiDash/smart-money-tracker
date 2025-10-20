
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';
import { prisma } from '@/lib/db';

// List of tracked KOL accounts
const TRACKED_ACCOUNTS = [
  'CryptoExpert101',
  'JamesWynnReal',
  'BullRunGravano',
  // Add more accounts here as needed
];

// Analyze sentiment from tweet content
function analyzeSentiment(content: string): string {
  const lowercaseContent = content.toLowerCase();
  
  // Bullish indicators
  const bullishWords = ['bullish', 'moon', 'buy', 'long', 'pump', 'breakout', 'gem', 'accumulate', 'up', 'gain', 'profit', 'rocket', '🚀', '📈', 'calls', 'entry', 'buy the dip', 'btfd', 'lfg', 'to the moon'];
  
  // Bearish indicators
  const bearishWords = ['bearish', 'dump', 'sell', 'short', 'crash', 'down', 'loss', 'exit', 'warning', '⚠️', '📉', 'take profit', 'sell signal'];
  
  let bullishScore = 0;
  let bearishScore = 0;
  
  bullishWords.forEach(word => {
    if (lowercaseContent.includes(word)) bullishScore++;
  });
  
  bearishWords.forEach(word => {
    if (lowercaseContent.includes(word)) bearishScore++;
  });
  
  if (bullishScore > bearishScore) return 'bullish';
  if (bearishScore > bullishScore) return 'bearish';
  return 'neutral';
}

// Extract token symbols from tweet content
function extractTokens(content: string): string[] {
  // Match $TOKEN patterns
  const tokenPattern = /\$([A-Z]{2,10})\b/g;
  const matches = content.match(tokenPattern);
  
  if (!matches) return [];
  
  // Remove $ and deduplicate
  const tokens = [...new Set(matches.map(token => token.replace('$', '')))];
  
  // Filter out common false positives
  const filteredTokens = tokens.filter(token => 
    !['USD', 'US', 'USA', 'UK', 'EU', 'API', 'NFT', 'ETH', 'NFTs'].includes(token) || 
    ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'PEPE', 'SHIB'].includes(token)
  );
  
  return filteredTokens;
}

// Get token price from CoinGecko API
async function getTokenPrice(symbol: string): Promise<{ price: number; name: string } | null> {
  try {
    // Normalize symbol
    const normalizedSymbol = symbol.toLowerCase().replace('$', '');
    
    // Map common symbols to CoinGecko IDs
    const symbolToCoinGeckoId: Record<string, string> = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'sol': 'solana',
      'bnb': 'binancecoin',
      'xrp': 'ripple',
      'ada': 'cardano',
      'doge': 'dogecoin',
      'matic': 'matic-network',
      'dot': 'polkadot',
      'avax': 'avalanche-2',
      'link': 'chainlink',
      'atom': 'cosmos',
      'uni': 'uniswap',
      'ltc': 'litecoin',
      'bch': 'bitcoin-cash',
      'algo': 'algorand',
      'vet': 'vechain',
      'icp': 'internet-computer',
      'fil': 'filecoin',
      'aave': 'aave',
      'sand': 'the-sandbox',
      'mana': 'decentraland',
      'axs': 'axie-infinity',
      'gala': 'gala',
      'ape': 'apecoin',
      'shib': 'shiba-inu',
      'pepe': 'pepe',
      'bonk': 'bonk',
      'wif': 'dogwifcoin',
      'trump': 'maga',
      'popcat': 'popcat',
      'mew': 'cat-in-a-dogs-world',
      'render': 'render-token',
      'tao': 'bittensor',
      'near': 'near',
      'sui': 'sui',
      'arb': 'arbitrum',
      'op': 'optimism',
      'imx': 'immutable-x',
      'inj': 'injective-protocol',
      'floki': 'floki',
      'sei': 'sei-network'
    };

    const coinId = symbolToCoinGeckoId[normalizedSymbol] || normalizedSymbol;
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data[coinId]?.usd) {
      return {
        price: data[coinId].usd,
        name: coinId.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

// Update KOL stats
async function updateKOLStats(kolId: string) {
  const calls = await prisma.tokenCall.findMany({
    where: { kolId }
  });

  const totalCalls = calls.length;
  const successfulCalls = calls.filter(c => c.isWin === true).length;
  const failedCalls = calls.filter(c => c.isWin === false).length;
  const pendingCalls = calls.filter(c => c.isWin === null).length;
  const winRate = totalCalls > 0 ? (successfulCalls / (successfulCalls + failedCalls)) * 100 : 0;
  
  const roiValues = calls.filter(c => c.roi !== null).map(c => c.roi!);
  const averageROI = roiValues.length > 0 
    ? roiValues.reduce((a, b) => a + b, 0) / roiValues.length 
    : 0;
  
  const bestCall = roiValues.length > 0 ? Math.max(...roiValues) : undefined;
  const worstCall = roiValues.length > 0 ? Math.min(...roiValues) : undefined;

  await prisma.kOLStats.upsert({
    where: { kolId },
    create: {
      kolId,
      totalCalls,
      successfulCalls,
      failedCalls,
      pendingCalls,
      winRate,
      averageROI,
      bestCall,
      worstCall,
      lastUpdated: new Date()
    },
    update: {
      totalCalls,
      successfulCalls,
      failedCalls,
      pendingCalls,
      winRate,
      averageROI,
      bestCall,
      worstCall,
      lastUpdated: new Date()
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting sync for tracked KOLs...');
    
    const results = {
      success: true,
      processed: 0,
      tokenCallsCreated: 0,
      errors: [] as string[],
      accounts: [] as any[]
    };

    for (const username of TRACKED_ACCOUNTS) {
      try {
        console.log(`Processing ${username}...`);
        
        // Ensure KOL profile exists
        let kolProfile = await prisma.kOLProfile.findUnique({
          where: { username }
        });

        // Fetch tweets from Twitter API
        const response = await twitterClient.getUserTweets(username, 20);
        
        if (!response.data || response.data.length === 0) {
          console.log(`No tweets found for ${username}`);
          results.errors.push(`No tweets found for ${username}`);
          continue;
        }

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
        } else if (kolProfile && user) {
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
        }

        if (!kolProfile) {
          console.log(`Failed to create/find profile for ${username}`);
          results.errors.push(`Failed to create/find profile for ${username}`);
          continue;
        }

        let tweetsProcessed = 0;
        let callsCreated = 0;

        // Process each tweet
        for (const tweet of response.data) {
          try {
            const category = twitterClient.categorizeTweet(tweet.text);
            const coins = twitterClient.extractCoinsFromTweet(tweet.text);
            const hashtags = tweet.entities?.hashtags?.map(h => h.tag) || [];
            const mentions = tweet.entities?.mentions?.map(m => m.username) || [];

            // Store tweet
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
              },
              update: {
                likeCount: tweet.public_metrics?.like_count || 0,
                retweetCount: tweet.public_metrics?.retweet_count || 0,
                replyCount: tweet.public_metrics?.reply_count || 0,
                quoteCount: tweet.public_metrics?.quote_count || 0,
              }
            });

            tweetsProcessed++;

            // Extract tokens and create token calls
            const tokens = extractTokens(tweet.text);
            
            if (tokens.length > 0) {
              const sentiment = analyzeSentiment(tweet.text);

              for (const tokenSymbol of tokens) {
                // Check if call already exists
                const existingCall = await prisma.tokenCall.findUnique({
                  where: {
                    tweetId_tokenSymbol: {
                      tweetId: tweet.id,
                      tokenSymbol
                    }
                  }
                });

                if (existingCall) {
                  console.log(`Token call already exists for ${tokenSymbol} in tweet ${tweet.id}`);
                  continue;
                }

                // Get current price
                const tokenData = await getTokenPrice(tokenSymbol);
                
                const tokenCall = await prisma.tokenCall.create({
                  data: {
                    kolId: kolProfile.id,
                    tweetId: tweet.id,
                    tokenSymbol,
                    tokenName: tokenData?.name || tokenSymbol,
                    callPrice: tokenData?.price,
                    currentPrice: tokenData?.price,
                    sentiment,
                    calledAt: new Date(tweet.created_at),
                  }
                });

                callsCreated++;
                console.log(`Created token call for ${tokenSymbol} by ${username}`);
              }
            }
          } catch (tweetError) {
            console.error(`Error processing tweet ${tweet.id}:`, tweetError);
          }
        }

        // Update KOL stats
        await updateKOLStats(kolProfile.id);

        results.accounts.push({
          username,
          tweetsProcessed,
          callsCreated
        });

        results.processed += tweetsProcessed;
        results.tokenCallsCreated += callsCreated;

      } catch (accountError: any) {
        console.error(`Error processing ${username}:`, accountError);
        results.errors.push(`Error processing ${username}: ${accountError.message}`);
      }
    }

    console.log('Sync completed:', results);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Error syncing token calls:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync token calls',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// GET: Trigger sync manually
export async function GET(request: NextRequest) {
  return POST(request);
}
