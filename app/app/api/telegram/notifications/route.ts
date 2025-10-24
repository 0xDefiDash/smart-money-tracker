
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user by telegram chat ID
    const user = await prisma.user.findFirst({
      where: {
        telegramChatId: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return notification settings
    const settings = user.telegramNotificationSettings || {
      whaleAlerts: true,
      shotCallersAlerts: true,
      blockWarsAlerts: true,
      marketAlerts: false,
      dailySummary: true,
      selectedShotCallers: [],
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = body;

    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'User ID and settings are required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        telegramChatId: String(userId),
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegramChatId: String(userId),
          telegramNotificationSettings: settings,
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          telegramNotificationSettings: settings,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification settings saved successfully',
      settings: user.telegramNotificationSettings,
    });
  } catch (error: any) {
    console.error('Error saving notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to save notification settings' },
      { status: 500 }
    );
  }
}
