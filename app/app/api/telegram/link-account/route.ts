
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Generate or retrieve linking code for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        telegramLinkingCode: true,
        telegramLinkingCodeExpiry: true,
        telegramChatId: true,
        telegramUsername: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If already connected, return that info
    if (user.telegramChatId) {
      return NextResponse.json({
        success: true,
        connected: true,
        username: user.telegramUsername,
      });
    }

    // Check if existing code is still valid (15 minutes)
    const now = new Date();
    if (
      user.telegramLinkingCode &&
      user.telegramLinkingCodeExpiry &&
      user.telegramLinkingCodeExpiry > now
    ) {
      return NextResponse.json({
        success: true,
        connected: false,
        linkingCode: user.telegramLinkingCode,
        expiresAt: user.telegramLinkingCodeExpiry,
      });
    }

    // Generate new linking code
    const linkingCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character code
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramLinkingCode: linkingCode,
        telegramLinkingCodeExpiry: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      connected: false,
      linkingCode,
      expiresAt,
    });
  } catch (error: any) {
    console.error('Error generating linking code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Link Telegram account using code sent to bot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, chatId, username } = body;

    if (!code || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Missing code or chatId' },
        { status: 400 }
      );
    }

    // Find user with this linking code
    const user = await prisma.user.findFirst({
      where: {
        telegramLinkingCode: code.toUpperCase(),
        telegramLinkingCodeExpiry: {
          gt: new Date(), // Code not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired linking code',
      });
    }

    // Link the Telegram account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: String(chatId),
        telegramUsername: username,
        telegramLinkingCode: null,
        telegramLinkingCodeExpiry: null,
        telegramNotificationSettings: {
          whaleAlerts: true,
          shotCallersAlerts: true,
          blockWarsAlerts: true,
          marketAlerts: false,
          dailySummary: true,
          selectedShotCallers: [],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account linked successfully',
    });
  } catch (error: any) {
    console.error('Error linking Telegram account:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
