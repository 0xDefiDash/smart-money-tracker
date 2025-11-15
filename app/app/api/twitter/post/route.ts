
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, type, data } = body;

    if (!text && !type) {
      return NextResponse.json(
        { error: 'Either text or type must be provided' },
        { status: 400 }
      );
    }

    let tweetText = text;

    // Generate tweet based on type and data
    if (type && data) {
      switch (type) {
        case 'whale-alert':
          tweetText = twitterClient.createWhaleAlertTweet(data);
          break;
        case 'market-update':
          tweetText = twitterClient.createMarketUpdateTweet(data);
          break;
        case 'alert':
          tweetText = twitterClient.createAlertTweet(data);
          break;
        case 'platform-feature':
          tweetText = twitterClient.createPlatformFeatureTweet(data.feature);
          break;
        case 'daily-report':
          tweetText = twitterClient.createDailyReportTweet(data);
          break;
        case 'trending-token':
          tweetText = twitterClient.createTrendingTokenTweet(data);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid tweet type' },
            { status: 400 }
          );
      }
    }

    // Post the tweet
    const result = await twitterClient.postTweet(tweetText);

    if (result.success) {
      return NextResponse.json({
        success: true,
        tweetId: result.tweetId,
        text: tweetText
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
