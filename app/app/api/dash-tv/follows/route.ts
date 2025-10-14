
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
    const { followingId } = body

    if (!followingId) {
      return NextResponse.json({ error: 'followingId required' }, { status: 400 })
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

    if (profile.id === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: profile.id,
          followingId
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      })

      // Update counts
      await prisma.streamerProfile.update({
        where: { id: profile.id },
        data: { followingCount: { decrement: 1 } }
      })

      await prisma.streamerProfile.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } }
      })

      return NextResponse.json({ following: false })
    } else {
      // Follow
      const follow = await prisma.follow.create({
        data: {
          followerId: profile.id,
          followingId
        }
      })

      // Update counts
      await prisma.streamerProfile.update({
        where: { id: profile.id },
        data: { followingCount: { increment: 1 } }
      })

      await prisma.streamerProfile.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } }
      })

      return NextResponse.json({ following: true, follow })
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
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
    const followingId = searchParams.get('followingId')

    if (!followingId) {
      return NextResponse.json({ error: 'followingId required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ following: false })
    }

    const profile = await prisma.streamerProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ following: false })
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: profile.id,
          followingId
        }
      }
    })

    return NextResponse.json({ following: !!follow })
  } catch (error) {
    console.error('Error checking follow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
