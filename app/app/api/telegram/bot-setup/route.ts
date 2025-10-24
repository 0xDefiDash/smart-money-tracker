
import { NextRequest, NextResponse } from 'next/server';
import telegramClient from '@/lib/telegram-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Set bot commands
    const commands = [
      { command: 'app', description: '📱 Launch Telegram Mini App' },
      { command: 'start', description: '👋 Start the bot' },
      { command: 'help', description: 'ℹ️ Show help and commands' },
      { command: 'market', description: '📊 Get market overview' },
      { command: 'whale', description: '🐋 Latest whale transactions' },
      { command: 'alpha', description: '💎 Alpha feeds from KOLs' },
      { command: 'blockwars', description: '⚔️ Your Block Wars stats' },
      { command: 'settings', description: '⚙️ Notification settings' },
      { command: 'connect', description: '🔗 Connect your account' },
    ];

    const commandsResult = await telegramClient.setMyCommands(commands);

    // Set menu button to launch mini app
    const menuResult = await telegramClient.setMenuButton({
      type: 'web_app',
      text: '📱 Open App',
      web_app: { url: 'https://defidashtracker.com/telegram-mini' },
    });

    // Get bot info
    const botInfo = await telegramClient.getMe();

    return NextResponse.json({
      success: true,
      message: 'Bot setup completed successfully',
      botInfo: botInfo.result,
      commandsSet: commandsResult.ok,
      menuButtonSet: menuResult.ok,
    });
  } catch (error: any) {
    console.error('Error setting up bot:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const botInfo = await telegramClient.getMe();
    
    return NextResponse.json({
      success: true,
      botInfo: botInfo.result,
      message: 'Bot is running. Use POST to setup commands and menu.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
