
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';
import { prisma } from '@/lib/db';

// This endpoint handles automatic posting based on site events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventData, autoPost = false } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    const tweets: Array<{ text: string; posted: boolean; tweetId?: string }> = [];

    // Generate appropriate tweets based on event type
    switch (eventType) {
      case 'whale-transaction':
        // Only post if transaction is significant (>$100k)
        if (parseFloat(eventData.usdValue.replace(/[^0-9.]/g, '')) > 100000 && autoPost) {
          const tweetText = twitterClient.createWhaleAlertTweet(eventData);
          const result = await twitterClient.postTweet(tweetText);
          tweets.push({
            text: tweetText,
            posted: result.success,
            tweetId: result.tweetId
          });
        }
        break;

      case 'market-update':
        // Post market updates for significant price changes (>10%)
        const priceChange = parseFloat(eventData.change24h.replace(/[^0-9.-]/g, ''));
        if (Math.abs(priceChange) > 10 && autoPost) {
          const tweetText = twitterClient.createMarketUpdateTweet(eventData);
          const result = await twitterClient.postTweet(tweetText);
          tweets.push({
            text: tweetText,
            posted: result.success,
            tweetId: result.tweetId
          });
        }
        break;

      case 'daily-report':
        // Post daily report
        const tweetText = twitterClient.createDailyReportTweet(eventData);
        if (autoPost) {
          const result = await twitterClient.postTweet(tweetText);
          tweets.push({
            text: tweetText,
            posted: result.success,
            tweetId: result.tweetId
          });
        } else {
          tweets.push({
            text: tweetText,
            posted: false
          });
        }
        break;

      case 'trending-token':
        // Post trending tokens
        const trendingTweet = twitterClient.createTrendingTokenTweet(eventData);
        if (autoPost) {
          const result = await twitterClient.postTweet(trendingTweet);
          tweets.push({
            text: trendingTweet,
            posted: result.success,
            tweetId: result.tweetId
          });
        } else {
          tweets.push({
            text: trendingTweet,
            posted: false
          });
        }
        break;

      case 'platform-announcement':
        // Post platform announcements
        const announcementTweet = twitterClient.createPlatformFeatureTweet(eventData.feature);
        if (autoPost) {
          const result = await twitterClient.postTweet(announcementTweet);
          tweets.push({
            text: announcementTweet,
            posted: result.success,
            tweetId: result.tweetId
          });
        } else {
          tweets.push({
            text: announcementTweet,
            posted: false
          });
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      tweets,
      message: autoPost ? 'Tweets posted automatically' : 'Tweet preview generated'
    });
  } catch (error) {
    console.error('Error in auto-post:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to test Twitter connection
export async function GET() {
  try {
    // Test if Twitter credentials are configured
    const testTweet = twitterClient.createPlatformFeatureTweet('whale-tracker');
    
    return NextResponse.json({
      success: true,
      message: 'Twitter integration is configured',
      previewTweet: testTweet
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Twitter credentials not configured', details: String(error) },
      { status: 500 }
    );
  }
}
