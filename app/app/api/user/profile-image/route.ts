
// API endpoint to serve profile images with signed URLs

import { NextRequest, NextResponse } from 'next/server'
import { downloadFile } from '@/lib/s3'
import { prisma } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const key = searchParams.get('key')

    // If we have a direct key, serve it
    if (key) {
      const signedUrl = await downloadFile(key)
      return NextResponse.redirect(signedUrl)
    }

    // If we have a userId, get their profile image
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true }
      })

      if (!user?.profileImage) {
        return NextResponse.json({ error: 'No profile image found' }, { status: 404 })
      }

      const signedUrl = await downloadFile(user.profileImage)
      return NextResponse.redirect(signedUrl)
    }

    return NextResponse.json({ error: 'Missing userId or key parameter' }, { status: 400 })
  } catch (error) {
    console.error('Profile image serve error:', error)
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 })
  }
}
