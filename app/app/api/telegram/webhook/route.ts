
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import telegramClient from '@/lib/telegram-client';

export const dynamic = 'force-dynamic';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
    };
    text?: string;
    date: number;
  };
  callback_query?: any;
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    const firstName = message.from.first_name;
    const username = message.from.username;

    // Handle commands
    if (text.startsWith('/')) {
      await handleCommand(text, chatId, firstName, username);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handleCommand(
  command: string,
  chatId: string,
  firstName: string,
  username?: string
) {
  const cmd = command.split(' ')[0].toLowerCase();

  switch (cmd) {
    case '/start':
      await telegramClient.sendWelcomeMessage(chatId, firstName);
      // Create or update user telegram connection
      await updateTelegramConnection(chatId, username, firstName);
      break;

    case '/help':
      await telegramClient.sendHelpMessage(chatId);
      break;

    case '/settings':
      await sendSettingsMessage(chatId);
      break;

    case '/connect':
      await sendConnectInstructions(chatId);
      break;

    case '/whale':
      await sendLatestWhaleTransactions(chatId);
      break;

    case '/alpha':
      await sendLatestAlphaFeeds(chatId);
      break;

    case '/market':
      await sendMarketOverview(chatId);
      break;

    case '/blockwars':
      await sendBlockWarsStats(chatId, username);
      break;

    default:
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: `Unknown command. Use /help to see available commands.`,
      });
  }
}

async function updateTelegramConnection(
  chatId: string,
  username?: string,
  firstName?: string
) {
  try {
    // Check if user exists with this telegram chat ID
    let user = await prisma.user.findFirst({
      where: { telegramChatId: chatId },
    });

    if (!user && username) {
      // Try to find user by username
      user = await prisma.user.findFirst({
        where: { username: username },
      });

      if (user) {
        // Link telegram to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramChatId: chatId,
            telegramUsername: username,
          },
        });
      }
    }

    if (!user) {
      // Create new user for this telegram account
      user = await prisma.user.create({
        data: {
          telegramChatId: chatId,
          telegramUsername: username,
          name: firstName || 'Telegram User',
          username: username || `tg_${chatId}`,
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error updating telegram connection:', error);
  }
}

async function sendSettingsMessage(chatId: string) {
  const user = await prisma.user.findFirst({
    where: { telegramChatId: chatId },
  });

  if (!user) {
    await telegramClient.sendMessage({
      chat_id: chatId,
      text: 'Please use /connect to link your account first.',
    });
    return;
  }

  const settings = user.telegramNotificationSettings as any || {};
  
  const message = `
⚙️ *Your Notification Settings*

🐋 Whale Alerts: ${settings.whaleAlerts ? '✅ Enabled' : '❌ Disabled'}
⚔️ Block Wars: ${settings.blockWars ? '✅ Enabled' : '❌ Disabled'}
💎 Alpha Feeds: ${settings.alphaFeeds ? '✅ Enabled' : '❌ Disabled'}
📊 Market Alerts: ${settings.marketAlerts ? '✅ Enabled' : '❌ Disabled'}
📈 Daily Summary: ${settings.dailySummary ? '✅ Enabled' : '❌ Disabled'}

To update settings, visit:
https://defidashtracker.com/settings
  `.trim();

  await telegramClient.sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  });
}

async function sendConnectInstructions(chatId: string) {
  const message = `
🔗 *Connect Your Account*

To link your DeFiDash account with Telegram:

1. Visit https://defidashtracker.com/settings
2. Go to "Telegram Notifications" section
3. Copy your Chat ID: \`${chatId}\`
4. Paste it in the settings and save

Once connected, you'll receive personalized notifications!
  `.trim();

  await telegramClient.sendMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  });
}

async function sendLatestWhaleTransactions(chatId: string) {
  try {
    const transactions = await prisma.whaleTransaction.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: { cryptocurrency: true },
    });

    if (transactions.length === 0) {
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: 'No whale transactions found recently.',
      });
      return;
    }

    let message = '🐋 *Latest Whale Transactions*\n\n';

    for (const tx of transactions) {
      message += `💰 ${tx.cryptocurrency.symbol}: $${tx.valueUsd.toLocaleString()}\n`;
      message += `⛓️ ${tx.blockchain}\n`;
      message += `🕐 ${new Date(tx.timestamp).toLocaleString()}\n\n`;
    }

    await telegramClient.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Error fetching whale transactions:', error);
  }
}

async function sendLatestAlphaFeeds(chatId: string) {
  try {
    const tokenCalls = await prisma.tokenCall.findMany({
      take: 5,
      orderBy: { calledAt: 'desc' },
      include: {
        kol: true,
        tweet: true,
      },
    });

    if (tokenCalls.length === 0) {
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: 'No alpha feeds found recently.',
      });
      return;
    }

    let message = '💎 *Latest Alpha Feeds*\n\n';

    for (const call of tokenCalls) {
      const sentimentEmoji = call.sentiment === 'bullish' ? '🚀' : 
                             call.sentiment === 'bearish' ? '📉' : '➡️';
      
      message += `${sentimentEmoji} *${call.tokenSymbol}* by @${call.kol.username}\n`;
      message += `📊 ${call.sentiment.toUpperCase()}\n`;
      message += `🕐 ${new Date(call.calledAt).toLocaleString()}\n\n`;
    }

    await telegramClient.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Error fetching alpha feeds:', error);
  }
}

async function sendMarketOverview(chatId: string) {
  try {
    const cryptos = await prisma.cryptocurrency.findMany({
      take: 10,
      orderBy: { rank: 'asc' },
    });

    if (cryptos.length === 0) {
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: 'Market data not available.',
      });
      return;
    }

    let message = '📊 *Market Overview*\n\n';

    for (const crypto of cryptos) {
      const change = crypto.priceChange24h || 0;
      const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      
      message += `${emoji} *${crypto.symbol}*: $${crypto.price?.toLocaleString() || 'N/A'}\n`;
      message += `   ${change > 0 ? '+' : ''}${change.toFixed(2)}%\n\n`;
    }

    await telegramClient.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
  }
}

async function sendBlockWarsStats(chatId: string, username?: string) {
  try {
    if (!username) {
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: 'Please connect your account to view Block Wars stats.',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: 'User not found. Please connect your account.',
      });
      return;
    }

    const message = `
⚔️ *Your Block Wars Stats*

👤 *Player:* ${user.name || username}
⭐ *Level:* ${user.gameLevel}
✨ *Experience:* ${user.gameExp}
💰 *Money:* ${user.gameMoney.toLocaleString()}

Keep playing to level up! 🚀
    `.trim();

    await telegramClient.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Error fetching Block Wars stats:', error);
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Telegram webhook is active',
    timestamp: new Date().toISOString(),
  });
}
