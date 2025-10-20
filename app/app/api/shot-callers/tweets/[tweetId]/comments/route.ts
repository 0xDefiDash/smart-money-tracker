
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;
    const body = await request.json();
    const { userId, userAddress, userName, userAvatar, content, parentId } = body;

    if (!userName || !content) {
      return NextResponse.json(
        { error: 'User name and content are required' },
        { status: 400 }
      );
    }

    const comment = await db.tweetComment.create({
      data: {
        tweetId,
        userId,
        userAddress,
        userName,
        userAvatar,
        content,
        parentId
      },
      include: {
        replies: true
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
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

    const comments = await db.tweetComment.findMany({
      where: {
        tweetId,
        parentId: null // Only get top-level comments
      },
      include: {
        replies: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalCount = await db.tweetComment.count({
      where: { tweetId }
    });

    return NextResponse.json({ 
      comments, 
      totalCount 
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
