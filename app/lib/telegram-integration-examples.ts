
/**
 * Telegram Integration Examples
 * 
 * This file demonstrates how to send Telegram notifications from various parts of the app.
 * Import and use these functions wherever you need to send notifications.
 */

/**
 * Example 1: Send Whale Alert
 * Use this when a large transaction is detected
 */
export async function sendWhaleAlertNotification(transaction: {
  blockchain: string;
  value: string;
  valueUsd: number;
  fromAddress: string;
  toAddress: string;
  txHash: string;
}) {
  try {
    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'whale_alert',
        data: transaction,
        // Optional: userId - if omitted, sends to all users with whale alerts enabled
      }),
    });

    const result = await response.json();
    console.log('Whale alert sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending whale alert:', error);
  }
}

/**
 * Example 2: Send Block Wars Notification
 * Use this for game events like battles, wins, achievements
 */
export async function sendBlockWarsNotification(userId: string, notification: {
  type: 'battle' | 'win' | 'achievement' | 'level_up';
  title: string;
  description: string;
  reward?: number;
}) {
  try {
    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'block_wars',
        data: notification,
        userId, // Send to specific user
      }),
    });

    const result = await response.json();
    console.log('Block Wars notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending Block Wars notification:', error);
  }
}

/**
 * Example 3: Send Alpha Feed (Shot Callers)
 * Use this when a new token call is detected from a KOL
 */
export async function sendAlphaFeedNotification(tokenCall: {
  kolUsername: string;
  kolDisplayName: string;
  tokenSymbol: string;
  tokenName?: string;
  sentiment: string;
  content: string;
  tweetUrl: string;
}) {
  try {
    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'alpha_feed',
        data: tokenCall,
      }),
    });

    const result = await response.json();
    console.log('Alpha feed sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending alpha feed:', error);
  }
}

/**
 * Example 4: Send Market Alert
 * Use this for significant price movements
 */
export async function sendMarketAlertNotification(alert: {
  symbol: string;
  name: string;
  priceChange: number;
  currentPrice: number;
  volume24h: number;
}) {
  try {
    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'market_alert',
        data: alert,
      }),
    });

    const result = await response.json();
    console.log('Market alert sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending market alert:', error);
  }
}

/**
 * Example 5: Send Daily Summary
 * Use this for end-of-day reports (can be scheduled with a cron job)
 */
export async function sendDailySummaryNotification(summary: {
  date: string;
  totalWhaleTransactions: number;
  totalWhaleVolumeUsd: number;
  topMovers: Array<{ symbol: string; change: number }>;
  sentiment: string;
}) {
  try {
    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'daily_summary',
        data: summary,
      }),
    });

    const result = await response.json();
    console.log('Daily summary sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
}

/**
 * Example Usage in Whale Transaction Detection:
 * 
 * // In your whale transaction detection logic
 * if (transaction.valueUsd >= WHALE_THRESHOLD) {
 *   await sendWhaleAlertNotification({
 *     blockchain: 'ethereum',
 *     value: '100 ETH',
 *     valueUsd: 350000,
 *     fromAddress: '0x123...',
 *     toAddress: '0xabc...',
 *     txHash: '0xdef...',
 *   });
 * }
 */

/**
 * Example Usage in Block Wars Game:
 * 
 * // When player wins a battle
 * await sendBlockWarsNotification(userId, {
 *   type: 'win',
 *   title: 'Battle Victory!',
 *   description: 'You defeated the opponent and earned rewards!',
 *   reward: 500,
 * });
 * 
 * // When player levels up
 * await sendBlockWarsNotification(userId, {
 *   type: 'level_up',
 *   title: 'Level Up!',
 *   description: `Congratulations! You've reached level ${newLevel}`,
 *   reward: 1000,
 * });
 */

/**
 * Example Usage in Shot Callers (KOL Tracking):
 * 
 * // When a new token call is detected
 * await sendAlphaFeedNotification({
 *   kolUsername: 'cryptowhale',
 *   kolDisplayName: 'Crypto Whale 🐋',
 *   tokenSymbol: 'SOL',
 *   tokenName: 'Solana',
 *   sentiment: 'bullish',
 *   content: 'Solana is looking strong! Target $200 🚀',
 *   tweetUrl: 'https://twitter.com/cryptowhale/status/123...',
 * });
 */

/**
 * Example Usage for Market Monitoring:
 * 
 * // When significant price change detected
 * if (Math.abs(priceChange) >= 10) { // 10% change threshold
 *   await sendMarketAlertNotification({
 *     symbol: 'BTC',
 *     name: 'Bitcoin',
 *     priceChange: 12.5,
 *     currentPrice: 68500,
 *     volume24h: 28500000000,
 *   });
 * }
 */
