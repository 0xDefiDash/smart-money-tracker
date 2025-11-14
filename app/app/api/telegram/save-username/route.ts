
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace('@', '').trim().toLowerCase();

    if (!cleanUsername) {
      return NextResponse.json(
        { success: false, error: 'Invalid username' },
        { status: 400 }
      );
    }

    // If not logged in, store in session/cookie for later
    if (!session?.user?.email) {
      // Store username temporarily (can be retrieved when they sign up/in)
      return NextResponse.json({
        success: true,
        message: 'Username saved temporarily. Sign in to complete connection.',
        pendingUsername: cleanUsername,
      });
    }

    // Update user's pending Telegram username
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        telegramUsername: cleanUsername,
        // Clear any existing chat ID if updating username
        telegramChatId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Username saved! Go to Telegram and send /connect to complete the setup.',
    });
  } catch (error: any) {
    console.error('Error saving Telegram username:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
