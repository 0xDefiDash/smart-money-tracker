
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      'pepe': 'pepe'
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

// Analyze sentiment from tweet content
function analyzeSentiment(content: string): string {
  const lowercaseContent = content.toLowerCase();
  
  // Bullish indicators
  const bullishWords = ['bullish', 'moon', 'buy', 'long', 'pump', 'breakout', 'gem', 'accumulate', 'up', 'gain', 'profit', 'rocket', '🚀', '📈', 'calls', 'entry'];
  
  // Bearish indicators
  const bearishWords = ['bearish', 'dump', 'sell', 'short', 'crash', 'down', 'loss', 'exit', 'warning', '⚠️', '📉'];
  
  // Neutral indicators
  const neutralWords = ['watch', 'monitor', 'observe', 'analysis', 'update', 'report'];
  
  let bullishScore = 0;
  let bearishScore = 0;
  let neutralScore = 0;
  
  bullishWords.forEach(word => {
    if (lowercaseContent.includes(word)) bullishScore++;
  });
  
  bearishWords.forEach(word => {
    if (lowercaseContent.includes(word)) bearishScore++;
  });
  
  neutralWords.forEach(word => {
    if (lowercaseContent.includes(word)) neutralScore++;
  });
  
  if (bullishScore > bearishScore && bullishScore > neutralScore) return 'bullish';
  if (bearishScore > bullishScore && bearishScore > neutralScore) return 'bearish';
  if (bullishScore === bearishScore && bullishScore > 0) return 'neutral';
  return 'neutral';
}

// Extract token symbols from tweet content
function extractTokens(content: string): string[] {
  // Match $TOKEN patterns
  const tokenPattern = /\$([A-Z]{2,10})/g;
  const matches = content.match(tokenPattern);
  
  if (!matches) return [];
  
  // Remove $ and deduplicate
  return [...new Set(matches.map(token => token.replace('$', '')))];
}

// GET: Fetch all token calls with performance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const kolUsername = searchParams.get('kol');
    const sentiment = searchParams.get('sentiment');

    let where: any = {};
    
    if (kolUsername) {
      const kol = await prisma.kOLProfile.findUnique({
        where: { username: kolUsername }
      });
      
      if (kol) {
        where.kolId = kol.id;
      }
    }
    
    if (sentiment) {
      where.sentiment = sentiment;
    }

    const tokenCalls = await prisma.tokenCall.findMany({
      where,
      include: {
        kol: {
          select: {
            username: true,
            displayName: true,
            profileImageUrl: true,
          }
        },
        tweet: {
          select: {
            content: true,
            createdAt: true,
            likeCount: true,
            retweetCount: true,
          }
        }
      },
      orderBy: {
        calledAt: 'desc'
      },
      take: limit
    });

    // Update prices for recent calls (last 24 hours)
    const recentCalls = tokenCalls.filter(call => {
      const hoursSinceCall = (Date.now() - new Date(call.calledAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceCall < 24;
    });

    for (const call of recentCalls) {
      const tokenData = await getTokenPrice(call.tokenSymbol);
      if (tokenData && call.callPrice) {
        const currentPrice = tokenData.price;
        const priceChange = ((currentPrice - call.callPrice) / call.callPrice) * 100;
        const roi = priceChange;
        const isWin = roi > 0;

        await prisma.tokenCall.update({
          where: { id: call.id },
          data: {
            currentPrice,
            priceChange,
            roi,
            isWin,
            lastCheckedAt: new Date()
          }
        });

        // Update the call object for response
        call.currentPrice = currentPrice;
        call.priceChange = priceChange;
        call.roi = roi;
        call.isWin = isWin;
      }
    }

    // Calculate KOL stats
    const kolStats = await prisma.kOLStats.findMany({
      include: {
        kol: {
          select: {
            username: true,
            displayName: true,
            profileImageUrl: true,
          }
        }
      },
      orderBy: {
        winRate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      tokenCalls,
      kolStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching token calls:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token calls' },
      { status: 500 }
    );
  }
}

// POST: Create token calls from tweets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweetId, kolUsername } = body;

    // Get KOL profile
    const kol = await prisma.kOLProfile.findUnique({
      where: { username: kolUsername }
    });

    if (!kol) {
      return NextResponse.json(
        { success: false, error: 'KOL not found' },
        { status: 404 }
      );
    }

    // Get tweet
    const tweet = await prisma.kOLTweet.findUnique({
      where: { tweetId }
    });

    if (!tweet) {
      return NextResponse.json(
        { success: false, error: 'Tweet not found' },
        { status: 404 }
      );
    }

    // Extract tokens from tweet
    const tokens = extractTokens(tweet.content);
    
    if (tokens.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No tokens found in tweet'
      });
    }

    const sentiment = analyzeSentiment(tweet.content);
    const tokenCalls = [];

    // Create token calls for each token
    for (const tokenSymbol of tokens) {
      // Check if call already exists
      const existingCall = await prisma.tokenCall.findUnique({
        where: {
          tweetId_tokenSymbol: {
            tweetId,
            tokenSymbol
          }
        }
      });

      if (existingCall) {
        tokenCalls.push(existingCall);
        continue;
      }

      // Get current price
      const tokenData = await getTokenPrice(tokenSymbol);
      
      const tokenCall = await prisma.tokenCall.create({
        data: {
          kolId: kol.id,
          tweetId,
          tokenSymbol,
          tokenName: tokenData?.name,
          callPrice: tokenData?.price,
          currentPrice: tokenData?.price,
          sentiment,
          calledAt: tweet.createdAt
        }
      });

      tokenCalls.push(tokenCall);
    }

    // Update KOL stats
    await updateKOLStats(kol.id);

    return NextResponse.json({
      success: true,
      tokenCalls,
      message: `Created ${tokenCalls.length} token call(s)`
    });

  } catch (error) {
    console.error('Error creating token calls:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create token calls' },
      { status: 500 }
    );
  }
}

// Helper function to update KOL stats
async function updateKOLStats(kolId: string) {
  const calls = await prisma.tokenCall.findMany({
    where: { kolId }
  });

  const totalCalls = calls.length;
  const successfulCalls = calls.filter(c => c.isWin === true).length;
  const failedCalls = calls.filter(c => c.isWin === false).length;
  const pendingCalls = calls.filter(c => c.isWin === null).length;
  
  // Calculate win rate, handling division by zero
  const completedCalls = successfulCalls + failedCalls;
  const winRate = completedCalls > 0 ? (successfulCalls / completedCalls) * 100 : 0;
  
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
      winRate: isNaN(winRate) ? 0 : winRate,
      averageROI: isNaN(averageROI) ? 0 : averageROI,
      bestCall,
      worstCall,
      lastUpdated: new Date()
    },
    update: {
      totalCalls,
      successfulCalls,
      failedCalls,
      pendingCalls,
      winRate: isNaN(winRate) ? 0 : winRate,
      averageROI: isNaN(averageROI) ? 0 : averageROI,
      bestCall,
      worstCall,
      lastUpdated: new Date()
    }
  });
}
