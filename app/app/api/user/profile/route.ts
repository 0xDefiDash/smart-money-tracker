
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { uploadFile } from '@/lib/s3'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        profileImage: true,
        xHandle: true,
        gameMoney: true,
        gameLevel: true,
        gameExp: true,
        isAdmin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const xHandle = formData.get('xHandle') as string
    const profileImageFile = formData.get('profileImage') as File

    const updateData: any = {}
    
    if (name) {
      updateData.name = name
    }
    
    if (xHandle !== null) {
      updateData.xHandle = xHandle || null // Allow empty string to clear the handle
    }

    if (profileImageFile && profileImageFile.size > 0) {
      // Upload profile image to S3
      const buffer = Buffer.from(await profileImageFile.arrayBuffer())
      const fileName = `profile-${session.user.id}-${profileImageFile.name}`
      const cloudStoragePath = await uploadFile(buffer, fileName)
      updateData.profileImage = cloudStoragePath
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        profileImage: true,
        xHandle: true,
        gameMoney: true,
        gameLevel: true,
        gameExp: true,
        isAdmin: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
