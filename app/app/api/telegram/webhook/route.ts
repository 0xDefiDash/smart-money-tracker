
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import telegramClient from '@/lib/telegram-client';

const prisma = new PrismaClient();

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    first_name?: string;
    username?: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text || '';
      const userId = message.from.id;
      const firstName = message.from.first_name;
      const username = message.from.username;

      // Handle commands
      if (text.startsWith('/')) {
        await handleCommand(text, chatId, userId, firstName, username);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCommand(
  command: string,
  chatId: number,
  userId: number,
  firstName: string,
  username?: string
) {
  const cmd = command.split(' ')[0].toLowerCase();

  try {
    // Update or create user with Telegram info
    await updateUserTelegramInfo(userId, chatId, username);

    switch (cmd) {
      case '/start':
        await telegramClient.sendWelcomeMessage(String(chatId), firstName);
        break;

      case '/help':
        await telegramClient.sendHelpMessage(String(chatId));
        break;

      case '/app':
      case '/miniapp':
        await telegramClient.sendMessage({
          chat_id: chatId,
          text: '📱 *Launch DeFiDash Mini App*\n\nClick the button below to open our mobile-optimized app!',
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Open Mini App',
                  web_app: { url: 'https://defidashtracker.com/telegram-mini' },
                },
              ],
            ],
          },
        });
        break;

      case '/settings':
        await telegramClient.sendMessage({
          chat_id: chatId,
          text: '⚙️ *Notification Settings*\n\nManage your notification preferences in the Mini App.',
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '⚙️ Open Settings',
                  web_app: { url: 'https://defidashtracker.com/telegram-mini/notifications' },
                },
              ],
            ],
          },
        });
        break;

      case '/whale':
        const whaleRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://defidashtracker.com'}/api/telegram/whale-feed`);
        if (whaleRes.ok) {
          const whaleData = await whaleRes.json();
          const transactions = whaleData.transactions || [];
          
          if (transactions.length > 0) {
            const tx = transactions[0];
            await telegramClient.sendWhaleAlert(String(chatId), {
              blockchain: tx.blockchain,
              value: tx.value,
              valueUsd: tx.valueUsd,
              fromAddress: tx.fromAddress || 'Unknown',
              toAddress: tx.toAddress || 'Unknown',
              txHash: tx.txHash || 'Unknown',
            });
          } else {
            await telegramClient.sendMessage({
              chat_id: chatId,
              text: '🐋 No recent whale transactions found.',
            });
          }
        }
        break;

      case '/alpha':
        await telegramClient.sendMessage({
          chat_id: chatId,
          text: '💎 *Latest Alpha Feeds*\n\nView the latest token calls from top KOLs in the Mini App!',
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 View Alpha Feeds',
                  web_app: { url: 'https://defidashtracker.com/shot-callers' },
                },
              ],
            ],
          },
        });
        break;

      case '/market':
        const marketRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://defidashtracker.com'}/api/telegram/market-feed`);
        if (marketRes.ok) {
          const marketData = await marketRes.json();
          const cryptos = marketData.data || [];
          
          if (cryptos.length > 0) {
            const topCryptos = cryptos.slice(0, 5);
            let message = '📊 *Top Market Movers*\n\n';
            
            topCryptos.forEach((crypto: any, idx: number) => {
              const emoji = crypto.priceChange24h >= 0 ? '📈' : '📉';
              message += `${idx + 1}. *${crypto.symbol}*: $${crypto.price.toFixed(2)} (${emoji} ${crypto.priceChange24h >= 0 ? '+' : ''}${crypto.priceChange24h.toFixed(2)}%)\n`;
            });
            
            await telegramClient.sendMessage({
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown',
            });
          }
        }
        break;

      default:
        await telegramClient.sendMessage({
          chat_id: chatId,
          text: '❓ Unknown command. Use /help to see available commands.',
        });
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await telegramClient.sendMessage({
      chat_id: chatId,
      text: '⚠️ An error occurred. Please try again later.',
    });
  }
}

async function updateUserTelegramInfo(
  userId: number,
  chatId: number,
  username?: string
) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        telegramChatId: String(chatId),
      },
    });

    if (existingUser) {
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          telegramUsername: username,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          telegramChatId: String(chatId),
          telegramUsername: username,
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
    }
  } catch (error) {
    console.error('Error updating user Telegram info:', error);
  }
}
