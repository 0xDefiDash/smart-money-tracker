
// Telegram Bot API Client
import fs from 'fs';
import path from 'path';

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  reply_markup?: any;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    text?: string;
    date: number;
  };
}

class TelegramClient {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = this.getBotToken();
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  private getBotToken(): string {
    try {
      const authSecretsPath = path.join('/home/ubuntu/.config/abacusai_auth_secrets.json');
      if (fs.existsSync(authSecretsPath)) {
        const secrets = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
        const botToken = secrets?.telegram?.secrets?.bot_token?.value || secrets?.Telegram?.secrets?.BOT_TOKEN?.value;
        if (botToken) {
          return botToken;
        }
      }
    } catch (error) {
      console.error('Error reading Telegram bot token from auth secrets:', error);
    }

    // Fallback to environment variable
    const envToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!envToken) {
      throw new Error('Telegram bot token not found in auth secrets or environment variables');
    }
    return envToken;
  }

  async sendMessage(params: TelegramMessage): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to send message');
      }

      return data.result;
    } catch (error: any) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  async sendWhaleAlert(chatId: string, transaction: {
    blockchain: string;
    value: string;
    valueUsd: number;
    fromAddress: string;
    toAddress: string;
    txHash: string;
  }): Promise<void> {
    const message = `
🐋 *Whale Alert*

💰 *Value:* ${transaction.value} (≈ $${transaction.valueUsd.toLocaleString()})
⛓️ *Blockchain:* ${transaction.blockchain.toUpperCase()}

📤 *From:* \`${transaction.fromAddress.slice(0, 8)}...${transaction.fromAddress.slice(-6)}\`
📥 *To:* \`${transaction.toAddress.slice(0, 8)}...${transaction.toAddress.slice(-6)}\`

🔗 [View Transaction](https://etherscan.io/tx/${transaction.txHash})
    `.trim();

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });
  }

  async sendBlockWarsNotification(chatId: string, notification: {
    type: 'battle' | 'win' | 'achievement' | 'level_up';
    title: string;
    description: string;
    reward?: number;
  }): Promise<void> {
    const emojis = {
      battle: '⚔️',
      win: '🏆',
      achievement: '🎖️',
      level_up: '⬆️',
    };

    const emoji = emojis[notification.type];
    
    let message = `
${emoji} *${notification.title}*

${notification.description}
    `.trim();

    if (notification.reward) {
      message += `\n\n💰 *Reward:* ${notification.reward.toLocaleString()} coins`;
    }

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  }

  async sendAlphaFeed(chatId: string, tokenCall: {
    kolUsername: string;
    kolDisplayName: string;
    tokenSymbol: string;
    tokenName?: string;
    sentiment: string;
    content: string;
    tweetUrl: string;
  }): Promise<void> {
    const sentimentEmojis: Record<string, string> = {
      bullish: '🚀',
      bearish: '📉',
      neutral: '➡️',
      alert: '🚨',
    };

    const emoji = sentimentEmojis[tokenCall.sentiment] || '📊';

    const message = `
${emoji} *Alpha Feed - ${tokenCall.kolDisplayName}*

💎 *Token:* ${tokenCall.tokenSymbol}${tokenCall.tokenName ? ` (${tokenCall.tokenName})` : ''}
📊 *Sentiment:* ${tokenCall.sentiment.toUpperCase()}

💬 "${tokenCall.content.slice(0, 200)}${tokenCall.content.length > 200 ? '...' : ''}"

🔗 [View Tweet](${tokenCall.tweetUrl})
    `.trim();

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
  }

  async sendMarketAlert(chatId: string, alert: {
    symbol: string;
    name: string;
    priceChange: number;
    currentPrice: number;
    volume24h: number;
  }): Promise<void> {
    const isPositive = alert.priceChange > 0;
    const emoji = isPositive ? '📈' : '📉';

    const message = `
${emoji} *Market Alert*

💰 *${alert.symbol}* (${alert.name})
💵 *Price:* $${alert.currentPrice.toLocaleString()}
${isPositive ? '📈' : '📉'} *Change:* ${isPositive ? '+' : ''}${alert.priceChange.toFixed(2)}%
📊 *24h Volume:* $${(alert.volume24h / 1000000).toFixed(2)}M
    `.trim();

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  }

  async sendDailySummary(chatId: string, summary: {
    date: string;
    totalWhaleTransactions: number;
    totalWhaleVolumeUsd: number;
    topMovers: Array<{ symbol: string; change: number }>;
    sentiment: string;
  }): Promise<void> {
    const message = `
📊 *Daily Market Summary - ${summary.date}*

🐋 *Whale Activity*
• Transactions: ${summary.totalWhaleTransactions}
• Volume: $${(summary.totalWhaleVolumeUsd / 1000000).toFixed(2)}M

📈 *Top Movers*
${summary.topMovers.map(m => `• ${m.symbol}: ${m.change > 0 ? '+' : ''}${m.change.toFixed(2)}%`).join('\n')}

💭 *Market Sentiment:* ${summary.sentiment.toUpperCase()}

📱 Visit DeFiDash for more insights!
    `.trim();

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  }

  async sendWelcomeMessage(chatId: string, firstName: string): Promise<void> {
    const message = `
👋 Welcome ${firstName}!

I'm the DeFiDash Tracker Bot 🤖

🚀 *NEW: Telegram Mini App Available!*
Launch our mobile-optimized app directly in Telegram for instant access to:
📊 Live Market Data
🐋 Whale Activity Tracking  
🔥 Trending Tokens
⚔️ Block Wars Game

Use /app to launch the Mini App
Use /help to see all available commands
Use /settings to customize your notifications

Let's track the smart money together! 🚀
    `.trim();

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  }

  async sendHelpMessage(chatId: string): Promise<void> {
    const message = `
ℹ️ *DeFiDash Bot Commands*

📱 *Mini App*
/app - Launch the Telegram Mini App
/miniapp - Same as /app

📋 *Quick Commands*
/start - Start the bot and get welcome message
/help - Show this help message
/settings - View and update notification preferences
/connect - Link your Telegram to DeFiDash account

📊 *Market Data*
/whale - Get latest whale transactions
/alpha - Get latest alpha feeds from KOLs
/market - Get current market overview
/blockwars - Get your Block Wars stats

🔔 *Notification Types*
• Whale Alerts - Large crypto transfers
• Block Wars - Game updates and achievements  
• Alpha Feeds - Token calls from KOLs
• Market Alerts - Significant price movements
• Daily Summary - End-of-day market report

💡 *Pro Tip:* Use the Mini App (/app) for the best mobile experience!

🌐 Visit https://defidashtracker.com for full experience!
    `.trim();

    await this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  }

  async setWebhook(webhookUrl: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting webhook:', error);
      throw error;
    }
  }

  async getMe(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw error;
    }
  }

  async setMenuButton(menuButton?: {
    type: 'commands' | 'web_app' | 'default';
    text?: string;
    web_app?: { url: string };
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/setChatMenuButton`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu_button: menuButton || {
            type: 'web_app',
            text: '📱 Open App',
            web_app: { url: 'https://defidashtracker.com/telegram-mini' },
          },
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting menu button:', error);
      throw error;
    }
  }

  async setMyCommands(commands: Array<{ command: string; description: string }>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commands }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting commands:', error);
      throw error;
    }
  }
}

export const telegramClient = new TelegramClient();
export default telegramClient;
