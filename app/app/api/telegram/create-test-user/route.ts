
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, secret } = body;

    // Simple security check
    if (secret !== 'test123') {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 403 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace('@', '').trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { telegramUsername: cleanUsername },
      select: {
        id: true,
        telegramUsername: true,
        telegramChatId: true,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existing,
      });
    }

    // Create new user with only the fields that exist in the database
    const user = await prisma.user.create({
      data: {
        telegramUsername: cleanUsername,
        telegramNotificationSettings: {
          whaleAlerts: true,
          shotCallersAlerts: true,
          blockWarsAlerts: true,
          marketAlerts: false,
          dailySummary: true,
          selectedShotCallers: [],
        },
      },
      select: {
        id: true,
        telegramUsername: true,
        telegramChatId: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Now send /connect to the bot!',
      user,
    });
  } catch (error: any) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
