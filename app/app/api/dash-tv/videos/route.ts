
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamerId = searchParams.get('streamerId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = { isPublic: true }
    if (streamerId) where.streamerId = streamerId
    if (category) where.category = category

    const videos = await prisma.video.findMany({
      where,
      include: {
        streamer: {
          select: {
            displayName: true,
            username: true,
            avatar: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    const total = await prisma.video.count({ where })

    return NextResponse.json({
      videos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
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
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      category,
      duration,
      tags,
      isPublic
    } = body

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

    const video = await prisma.video.create({
      data: {
        streamerId: profile.id,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        category,
        duration,
        tags: tags || [],
        isPublic: isPublic !== false
      }
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
