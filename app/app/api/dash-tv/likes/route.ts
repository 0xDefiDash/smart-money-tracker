
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId, videoId } = body

    if (!streamId && !videoId) {
      return NextResponse.json({ error: 'streamId or videoId required' }, { status: 400 })
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

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: profile.id,
        ...(streamId ? { streamId } : { videoId })
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      })

      // Decrement like count
      if (streamId) {
        await prisma.stream.update({
          where: { id: streamId },
          data: { likesCount: { decrement: 1 } }
        })
      } else if (videoId) {
        await prisma.video.update({
          where: { id: videoId },
          data: { likesCount: { decrement: 1 } }
        })
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like
      const like = await prisma.like.create({
        data: {
          userId: profile.id,
          streamId,
          videoId
        }
      })

      // Increment like count
      if (streamId) {
        await prisma.stream.update({
          where: { id: streamId },
          data: { likesCount: { increment: 1 } }
        })
      } else if (videoId) {
        await prisma.video.update({
          where: { id: videoId },
          data: { likesCount: { increment: 1 } }
        })
      }

      return NextResponse.json({ liked: true, like })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('streamId')
    const videoId = searchParams.get('videoId')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ liked: false })
    }

    const profile = await prisma.streamerProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ liked: false })
    }

    const like = await prisma.like.findFirst({
      where: {
        userId: profile.id,
        ...(streamId ? { streamId } : { videoId })
      }
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('Error checking like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
