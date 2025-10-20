
import { NextRequest, NextResponse } from 'next/server';
import { twitterClient } from '@/lib/twitter-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('max_results') || '10');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const response = await twitterClient.getUserTweets(username, maxResults);
    
    // Process tweets to add categories and extracted coins
    const processedTweets = response.data?.map(tweet => ({
      ...tweet,
      category: twitterClient.categorizeTweet(tweet.text),
      coins: twitterClient.extractCoinsFromTweet(tweet.text),
    })) || [];

    return NextResponse.json({
      ...response,
      data: processedTweets,
    });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}
