
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';

// Test endpoint to post a test tweet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'platform-feature' } = body;

    let tweetText = '';

    // Generate test tweet based on type
    switch (testType) {
      case 'whale-alert':
        tweetText = twitterClient.createWhaleAlertTweet({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          amount: '1,500',
          token: 'ETH',
          usdValue: '$4.8M',
          type: 'buy',
          chain: 'Ethereum'
        });
        break;

      case 'market-update':
        tweetText = twitterClient.createMarketUpdateTweet({
          token: 'BTC',
          price: '$45,230',
          change24h: '+12.5%',
          sentiment: 'bullish'
        });
        break;

      case 'platform-feature':
        tweetText = twitterClient.createPlatformFeatureTweet('whale-tracker');
        break;

      case 'trending-token':
        tweetText = twitterClient.createTrendingTokenTweet({
          token: 'PEPE',
          price: '$0.00001234',
          change: '+45.2%',
          volume: '$125M',
          reason: 'Massive whale accumulation detected in the last 24h!'
        });
        break;

      case 'daily-report':
        tweetText = twitterClient.createDailyReportTweet({
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalWhaleTransactions: 247,
          topMovers: [
            { token: 'BTC', change: '+12.5%' },
            { token: 'ETH', change: '+8.3%' },
            { token: 'SOL', change: '+15.7%' }
          ],
          marketSentiment: 'Bullish'
        });
        break;

      default:
        tweetText = `🚀 DeFiDash Tracker is live!

Track whale movements, monitor wallets, and get real-time crypto alerts.

Visit: https://defidashtracker.com

#DeFi #Crypto #SmartMoney`;
    }

    // Post the test tweet
    console.log('Attempting to post test tweet:', tweetText);
    const result = await twitterClient.postTweet(tweetText);

    return NextResponse.json({
      success: result.success,
      tweetId: result.tweetId,
      tweetText,
      error: result.error
    });
  } catch (error) {
    console.error('Error in test post:', error);
    return NextResponse.json(
      { error: 'Failed to post test tweet', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check Twitter credentials
export async function GET() {
  try {
    const testTweet = twitterClient.createPlatformFeatureTweet('whale-tracker');
    
    return NextResponse.json({
      success: true,
      message: 'Twitter/X integration is ready!',
      account: '@Defidash_Agent',
      previewTweet: testTweet,
      instructions: 'Send a POST request to this endpoint with { "testType": "platform-feature" } to post a test tweet'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Twitter credentials not configured', details: String(error) },
      { status: 500 }
    );
  }
}
