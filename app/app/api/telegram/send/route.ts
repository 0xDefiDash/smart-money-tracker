
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import telegramClient from '@/lib/telegram-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get users to notify
    let users;
    if (userId) {
      users = await prisma.user.findMany({
        where: { id: userId, telegramChatId: { not: null } },
      });
    } else {
      // Get all users with telegram notifications enabled for this type
      users = await prisma.user.findMany({
        where: {
          telegramChatId: { not: null },
        },
      });
    }

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to notify',
        sent: 0,
      });
    }

    const results = [];

    for (const user of users) {
      const settings = (user.telegramNotificationSettings as any) || {};
      const chatId = user.telegramChatId;

      if (!chatId) continue;

      try {
        // Check if user has this notification type enabled
        const isEnabled = checkNotificationEnabled(type, settings);
        
        if (!isEnabled) continue;

        switch (type) {
          case 'whale_alert':
            await telegramClient.sendWhaleAlert(chatId, data);
            break;

          case 'block_wars':
            await telegramClient.sendBlockWarsNotification(chatId, data);
            break;

          case 'alpha_feed':
            await telegramClient.sendAlphaFeed(chatId, data);
            break;

          case 'market_alert':
            await telegramClient.sendMarketAlert(chatId, data);
            break;

          case 'daily_summary':
            await telegramClient.sendDailySummary(chatId, data);
            break;

          default:
            await telegramClient.sendMessage({
              chat_id: chatId,
              text: data.message || 'You have a new notification!',
            });
        }

        results.push({ userId: user.id, success: true });
      } catch (error: any) {
        console.error(`Error sending to user ${user.id}:`, error);
        results.push({ userId: user.id, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error: any) {
    console.error('Send telegram notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function checkNotificationEnabled(type: string, settings: any): boolean {
  // Default to enabled if settings not configured
  if (!settings || Object.keys(settings).length === 0) {
    return true;
  }

  switch (type) {
    case 'whale_alert':
      return settings.whaleAlerts !== false;
    case 'block_wars':
      return settings.blockWars !== false;
    case 'alpha_feed':
      return settings.alphaFeeds !== false;
    case 'market_alert':
      return settings.marketAlerts !== false;
    case 'daily_summary':
      return settings.dailySummary !== false;
    default:
      return true;
  }
}
