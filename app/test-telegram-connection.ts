
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function testTelegramConnection() {
  console.log('🔍 Testing Telegram Connection for @only1denis\n');

  try {
    // 1. Check bot token
    console.log('1️⃣ Checking bot token...');
    const authSecretsPath = path.join('/home/ubuntu/.config/abacusai_auth_secrets.json');
    if (fs.existsSync(authSecretsPath)) {
      const secrets = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
      const botToken = secrets?.telegram?.secrets?.bot_token?.value || secrets?.Telegram?.secrets?.BOT_TOKEN?.value;
      if (botToken) {
        console.log('✅ Bot token found:', botToken.substring(0, 10) + '...');
        
        // Test bot API
        const botInfo = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const botData = await botInfo.json();
        if (botData.ok) {
          console.log('✅ Bot is active:', botData.result.username);
        } else {
          console.log('❌ Bot API error:', botData);
        }

        // Check webhook
        const webhookInfo = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const webhookData = await webhookInfo.json();
        if (webhookData.ok) {
          console.log('✅ Webhook info:', {
            url: webhookData.result.url,
            has_custom_certificate: webhookData.result.has_custom_certificate,
            pending_update_count: webhookData.result.pending_update_count,
            last_error_message: webhookData.result.last_error_message,
          });
        }
      } else {
        console.log('❌ Bot token not found in auth secrets');
      }
    } else {
      console.log('❌ Auth secrets file not found');
    }

    // 2. Check database for username
    console.log('\n2️⃣ Checking database for username "only1denis"...');
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { telegramUsername: 'only1denis' },
          { telegramUsername: '@only1denis' },
        ],
      },
      select: {
        id: true,
        email: true,
        telegramUsername: true,
        telegramChatId: true,
        createdAt: true,
      },
    });

    if (users.length > 0) {
      console.log(`✅ Found ${users.length} user(s):`);
      users.forEach((user: any) => {
        console.log('  -', {
          email: user.email || 'No email',
          telegramUsername: user.telegramUsername,
          telegramChatId: user.telegramChatId,
          createdAt: user.createdAt,
        });
      });
    } else {
      console.log('❌ No users found with username "only1denis"');
      
      // Check all users with telegram usernames
      console.log('\n📋 All users with Telegram usernames:');
      const allTelegramUsers = await prisma.user.findMany({
        where: {
          telegramUsername: { not: null },
        },
        select: {
          id: true,
          email: true,
          telegramUsername: true,
          telegramChatId: true,
        },
      });
      
      if (allTelegramUsers.length > 0) {
        allTelegramUsers.forEach((user: any) => {
          console.log('  -', {
            email: user.email || 'No email',
            telegramUsername: user.telegramUsername,
            chatId: user.telegramChatId,
          });
        });
      } else {
        console.log('  No users with Telegram usernames found');
      }
    }

    // 3. Test message send (if we have bot token)
    console.log('\n3️⃣ Testing message send capability...');
    if (fs.existsSync(authSecretsPath)) {
      const secrets = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
      const botToken = secrets?.telegram?.secrets?.bot_token?.value || secrets?.Telegram?.secrets?.BOT_TOKEN?.value;
      
      if (botToken) {
        // Get updates to see if user has messaged the bot
        const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
        const updatesData = await updatesRes.json();
        
        if (updatesData.ok && updatesData.result.length > 0) {
          console.log(`✅ Found ${updatesData.result.length} recent messages:`);
          updatesData.result.slice(-5).forEach((update: any) => {
            if (update.message) {
              const msg = update.message;
              console.log('  -', {
                from_username: msg.from.username,
                text: msg.text,
                chat_id: msg.chat.id,
                date: new Date(msg.date * 1000).toISOString(),
              });
            }
          });
        } else {
          console.log('⚠️ No recent messages found');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTelegramConnection();
