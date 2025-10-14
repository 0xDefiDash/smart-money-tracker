
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('streamId')
    const videoId = searchParams.get('videoId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    if (!streamId && !videoId) {
      return NextResponse.json({ error: 'streamId or videoId required' }, { status: 400 })
    }

    const where: any = {
      parentId: null, // Only get top-level comments
      ...(streamId ? { streamId } : { videoId })
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            displayName: true,
            username: true,
            avatar: true,
            isVerified: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                displayName: true,
                username: true,
                avatar: true,
                isVerified: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    const total = await prisma.comment.count({ where })

    return NextResponse.json({
      comments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId, videoId, content, parentId } = body

    if (!streamId && !videoId) {
      return NextResponse.json({ error: 'streamId or videoId required' }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await prisma.streamerProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Please create a profile first.' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        userId: profile.id,
        streamId,
        videoId,
        content: content.trim(),
        parentId
      },
      include: {
        user: {
          select: {
            displayName: true,
            username: true,
            avatar: true,
            isVerified: true
          }
        }
      }
    })

    // Increment comment count
    if (streamId) {
      await prisma.stream.update({
        where: { id: streamId },
        data: { commentsCount: { increment: 1 } }
      })
    } else if (videoId) {
      await prisma.video.update({
        where: { id: videoId },
        data: { commentsCount: { increment: 1 } }
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
