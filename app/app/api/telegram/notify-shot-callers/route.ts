
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import telegramClient from '@/lib/telegram-client';

const prisma = new PrismaClient();

// This endpoint should be called when a new Shot Caller post is created
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, tokenSymbol, tokenName, sentiment, content, tweetUrl } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find all users who have notifications enabled for this shot caller
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: {
          not: null,
        },
      },
    });

    let notificationsSent = 0;

    for (const user of users) {
      const settings = user.telegramNotificationSettings as any;
      
      if (
        settings &&
        settings.shotCallersAlerts &&
        settings.selectedShotCallers &&
        settings.selectedShotCallers.includes(username)
      ) {
        try {
          await telegramClient.sendAlphaFeed(user.telegramChatId!, {
            kolUsername: username,
            kolDisplayName: displayName || username,
            tokenSymbol: tokenSymbol || 'Unknown',
            tokenName,
            sentiment: sentiment || 'neutral',
            content: content || 'New token call',
            tweetUrl: tweetUrl || '#',
          });
          notificationsSent++;
        } catch (error) {
          console.error(`Error sending notification to user ${user.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent,
      message: `Sent notifications to ${notificationsSent} users`,
    });
  } catch (error: any) {
    console.error('Error sending shot caller notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
