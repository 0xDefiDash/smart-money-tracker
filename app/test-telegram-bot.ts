// Test script for Telegram bot integration
import telegramClient from './lib/telegram-client';

async function testBot() {
  console.log('🤖 Testing Telegram Bot Integration...\n');

  try {
    // Test 1: Get bot info
    console.log('📋 Test 1: Getting bot info...');
    const botInfo = await telegramClient.getMe();
    
    if (botInfo.ok) {
      console.log('✅ Bot connected successfully!');
      console.log('   Bot Name:', botInfo.result.first_name);
      console.log('   Username:', '@' + botInfo.result.username);
      console.log('   Bot ID:', botInfo.result.id);
    } else {
      console.log('❌ Failed to get bot info:', botInfo);
      return;
    }

    // Test 2: Set commands
    console.log('\n📋 Test 2: Setting bot commands...');
    const commands = [
      { command: 'app', description: '📱 Launch Telegram Mini App' },
      { command: 'start', description: '👋 Start the bot' },
      { command: 'help', description: 'ℹ️ Show help and commands' },
      { command: 'market', description: '📊 Get market overview' },
      { command: 'whale', description: '🐋 Latest whale transactions' },
      { command: 'alpha', description: '💎 Alpha feeds from KOLs' },
      { command: 'settings', description: '⚙️ Notification settings' },
      { command: 'connect', description: '🔗 Get your Chat ID' },
    ];
    
    const commandsResult = await telegramClient.setMyCommands(commands);
    if (commandsResult.ok) {
      console.log('✅ Commands set successfully!');
    } else {
      console.log('❌ Failed to set commands:', commandsResult);
    }

    // Test 3: Set menu button
    console.log('\n📋 Test 3: Setting menu button...');
    const menuResult = await telegramClient.setMenuButton({
      type: 'web_app',
      text: '📱 Open App',
      web_app: { url: 'https://defidashtracker.com/telegram-mini' },
    });
    
    if (menuResult.ok) {
      console.log('✅ Menu button set successfully!');
    } else {
      console.log('❌ Failed to set menu button:', menuResult);
    }

    console.log('\n✨ Bot setup complete!');
    console.log('\n📱 Next steps:');
    console.log('   1. Search for @' + botInfo.result.username + ' on Telegram');
    console.log('   2. Send /start to begin');
    console.log('   3. Use /help to see all commands');
    console.log('   4. Set up webhook at: https://defidashtracker.com/api/telegram/webhook');

  } catch (error: any) {
    console.error('❌ Error testing bot:', error);
    console.error('   Make sure the bot token is correct in the auth secrets file');
  }
}

testBot();
