
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import telegramClient from '@/lib/telegram-client';

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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    console.log('📨 Received Telegram update:', JSON.stringify(update, null, 2));

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
        // Check if there's a linking code parameter
        const parts = command.split(' ');
        if (parts.length > 1) {
          const linkingCode = parts[1].toUpperCase();
          
          // Try to find user with this linking code
          const user = await prisma.user.findFirst({
            where: {
              telegramLinkingCode: linkingCode,
              telegramLinkingCodeExpiry: {
                gte: new Date(), // Code must not be expired
              },
            },
            select: {
              id: true,
              email: true,
              name: true,
              telegramChatId: true,
            },
          });

          if (user) {
            // Link the account
            await prisma.user.update({
              where: { id: user.id },
              data: {
                telegramChatId: String(chatId),
                telegramUsername: username,
                telegramLinkingCode: null, // Clear the code
                telegramLinkingCodeExpiry: null,
                telegramNotificationSettings: {
                  whaleAlerts: true,
                  blockWars: true,
                  alphaFeeds: true,
                  marketAlerts: false,
                  dailySummary: true,
                },
              },
            });

            // Send success message
            await telegramClient.sendMessage({
              chat_id: chatId,
              text: `✅ *Account Connected Successfully!*\n\n👤 Account: ${user.name || user.email || 'DeFiDash User'}\n${username ? `📱 Telegram: @${username}\n` : ''}\n🎉 Welcome to DeFiDash Tracker!\n\n🔔 You'll now receive:\n• 🐋 Wallet tracker alerts\n• 💎 Shot caller notifications\n• ⚔️ Block Wars updates\n• 📊 Market insights\n• 📈 Daily market summaries\n\nUse /settings to customize your notifications.\nUse /help to see all commands.`,
              parse_mode: 'Markdown',
            });
          } else {
            // Invalid or expired code
            await telegramClient.sendMessage({
              chat_id: chatId,
              text: `❌ *Invalid or Expired Code*\n\nThe connection code \`${linkingCode}\` is either invalid or has expired.\n\n*To connect your account:*\n1. Go to [DeFiDash Settings](https://defidashtracker.com/settings)\n2. Click "Connect Telegram"\n3. Click the new link that appears\n\n⏰ Codes expire after 5 minutes for security.`,
              parse_mode: 'Markdown',
            });
          }
        } else {
          // No linking code, send welcome message
          await telegramClient.sendWelcomeMessage(String(chatId), firstName);
        }
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

      case '/connect':
      case '/link':
        // Try to match username with a pending account
        if (!username) {
          await telegramClient.sendMessage({
            chat_id: chatId,
            text: `❌ *No Username Found*\n\nYou need to set a Telegram username first.\n\n*How to set a username:*\n1. Open Telegram Settings\n2. Tap on your profile\n3. Tap "Username"\n4. Create a username\n5. Come back and send /connect again`,
            parse_mode: 'Markdown',
          });
          break;
        }

        // Find user with this pending username
        const pendingUser = await prisma.user.findFirst({
          where: {
            telegramUsername: username.toLowerCase(),
            telegramChatId: null, // Not yet connected
          },
          select: {
            id: true,
            email: true,
            telegramUsername: true,
            telegramChatId: true,
          },
        });

        if (pendingUser) {
          // Link the account
          await prisma.user.update({
            where: { id: pendingUser.id },
            data: {
              telegramChatId: String(chatId),
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

          await telegramClient.sendMessage({
            chat_id: chatId,
            text: `✅ *Account Connected Successfully!*\n\n👤 Username: @${username}\n\n🎉 Welcome to DeFiDash Tracker!\n\n🔔 You'll now receive:\n• 🐋 Whale transaction alerts\n• 💎 Shot caller notifications\n• ⚔️ Block Wars updates\n• 📊 Market insights\n• 📈 Daily market summaries\n\nUse /settings to customize your notifications.\nUse /help to see all commands.`,
            parse_mode: 'Markdown',
          });
        } else {
          // No pending username found
          await telegramClient.sendMessage({
            chat_id: chatId,
            text: `🔗 *Connect Your Account*\n\n👤 Your Telegram: @${username}\n\n*To connect:*\n1. Go to [DeFiDash Settings](https://defidashtracker.com/settings)\n2. Enter your Telegram username: \`${username}\`\n3. Click "Save"\n4. Come back here and send /connect again\n\n✅ Simple as that!`,
            parse_mode: 'Markdown',
          });
        }
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
      select: {
        id: true,
        telegramUsername: true,
        telegramChatId: true,
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
