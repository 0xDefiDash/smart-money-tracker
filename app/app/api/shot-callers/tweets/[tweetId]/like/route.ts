
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;
    const body = await request.json();
    const { userId, userAddress, userName } = body;

    if (!userId && !userAddress) {
      return NextResponse.json(
        { error: 'User ID or wallet address is required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db.tweetLike.findFirst({
      where: {
        tweetId,
        OR: [
          { userId: userId || undefined },
          { userAddress: userAddress || undefined }
        ]
      }
    });

    if (existingLike) {
      // Unlike
      await db.tweetLike.delete({
        where: { id: existingLike.id }
      });

      // Get updated count
      const likesCount = await db.tweetLike.count({
        where: { tweetId }
      });

      return NextResponse.json({ 
        liked: false, 
        likesCount,
        message: 'Tweet unliked' 
      });
    } else {
      // Like
      await db.tweetLike.create({
        data: {
          tweetId,
          userId,
          userAddress,
          userName
        }
      });

      // Get updated count
      const likesCount = await db.tweetLike.count({
        where: { tweetId }
      });

      return NextResponse.json({ 
        liked: true, 
        likesCount,
        message: 'Tweet liked' 
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userAddress = searchParams.get('userAddress');

    const likesCount = await db.tweetLike.count({
      where: { tweetId }
    });

    let isLiked = false;
    if (userId || userAddress) {
      const like = await db.tweetLike.findFirst({
        where: {
          tweetId,
          OR: [
            { userId: userId || undefined },
            { userAddress: userAddress || undefined }
          ]
        }
      });
      isLiked = !!like;
    }

    return NextResponse.json({ likesCount, isLiked });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}
