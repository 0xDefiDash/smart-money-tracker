
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('userId')

    if (!username && !userId) {
      return NextResponse.json({ error: 'Username or userId required' }, { status: 400 })
    }

    const profile = await prisma.streamerProfile.findUnique({
      where: username ? { username } : { userId: userId! },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            streams: true,
            videos: true,
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
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
      displayName,
      username,
      bio,
      avatar,
      bannerImage,
      twitterHandle,
      telegramHandle,
      discordHandle,
      websiteUrl,
      category
    } = body

    // Check if user already has a profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingProfile = await prisma.streamerProfile.findUnique({
      where: { userId: user.id }
    })

    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
    }

    // Check if username is taken
    const usernameExists = await prisma.streamerProfile.findUnique({
      where: { username }
    })

    if (usernameExists) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const profile = await prisma.streamerProfile.create({
      data: {
        userId: user.id,
        displayName,
        username,
        bio,
        avatar,
        bannerImage,
        twitterHandle,
        telegramHandle,
        discordHandle,
        websiteUrl,
        category
      }
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      displayName,
      bio,
      avatar,
      bannerImage,
      twitterHandle,
      telegramHandle,
      discordHandle,
      websiteUrl,
      category
    } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await prisma.streamerProfile.update({
      where: { userId: user.id },
      data: {
        displayName,
        bio,
        avatar,
        bannerImage,
        twitterHandle,
        telegramHandle,
        discordHandle,
        websiteUrl,
        category,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
