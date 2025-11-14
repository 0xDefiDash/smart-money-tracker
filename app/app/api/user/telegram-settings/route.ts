
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        telegramChatId: true,
        telegramUsername: true,
        telegramNotificationSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has pending connection (username but no chat ID)
    const hasPendingConnection = user.telegramUsername && !user.telegramChatId;

    return NextResponse.json({
      success: true,
      chatId: user.telegramChatId,
      username: user.telegramUsername,
      pendingUsername: hasPendingConnection ? user.telegramUsername : null,
      settings: user.telegramNotificationSettings || {
        whaleAlerts: true,
        blockWars: true,
        alphaFeeds: true,
        marketAlerts: false,
        dailySummary: true,
      },
    });
  } catch (error: any) {
    console.error('Error fetching telegram settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId, settings } = body;

    const updateData: any = {};

    if (chatId !== undefined) {
      updateData.telegramChatId = chatId;
    }

    if (settings !== undefined) {
      updateData.telegramNotificationSettings = settings;
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating telegram settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
