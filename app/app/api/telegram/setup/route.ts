
import { NextRequest, NextResponse } from 'next/server';
import telegramClient from '@/lib/telegram-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'set_webhook') {
      // Get the base URL from the request
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://defidashtracker.com';
      const webhookUrl = `${baseUrl}/api/telegram/webhook`;

      const result = await telegramClient.setWebhook(webhookUrl);
      
      return NextResponse.json({
        success: true,
        message: 'Webhook set successfully',
        webhookUrl,
        result,
      });
    }

    if (action === 'get_bot_info') {
      const botInfo = await telegramClient.getMe();
      return NextResponse.json({
        success: true,
        botInfo,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Telegram setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const botInfo = await telegramClient.getMe();
    return NextResponse.json({
      success: true,
      botInfo,
      status: 'Telegram bot is configured',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
