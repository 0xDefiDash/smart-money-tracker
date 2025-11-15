
/**
 * Automated Twitter Posting Script
 * Monitors whale movements and token calls, then posts to @Defidash_Agent
 */

import { twitterClient } from '../lib/twitter-client';
import { prisma } from '../lib/db';

interface WhaleTransaction {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  valueUsd: number;
  cryptocurrency: {
    symbol: string;
    name: string;
  };
  timestamp: Date;
  blockchain: string;
  isAlert: boolean;
  type: string;
}

interface TokenCall {
  username: string;
  tweetText: string;
  tokens: string[];
  sentiment: string;
  timestamp: Date;
}

// Configuration
const CONFIG = {
  WHALE_THRESHOLD_USD: 5000000, // $5M minimum for auto-posting
  TOKEN_CALL_MIN_ENGAGEMENT: 100, // Minimum engagement for token calls
  POSTING_INTERVAL_MINUTES: 30, // Post every 30 minutes
  MAX_POSTS_PER_RUN: 3, // Maximum posts per execution
  DRY_RUN: false, // Set to true for testing without posting
};

// Track last posted items to avoid duplicates
let lastPostedWhaleId: string | null = null;
let lastPostedTokenCall: string | null = null;
let lastPostTime: number = 0;

/**
 * Fetch recent whale transactions
 */
async function fetchWhaleTransactions(): Promise<WhaleTransaction[]> {
  try {
    const response = await fetch('http://localhost:3000/api/whale-transactions?limit=20&minUsd=5000000');
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching whale transactions:', error);
    return [];
  }
}

/**
 * Fetch recent token calls from shot callers
 */
async function fetchTokenCalls(): Promise<TokenCall[]> {
  try {
    const response = await fetch('http://localhost:3000/api/shot-callers/feed?limit=10');
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data.map((item: any) => ({
        username: item.author?.username || 'Unknown',
        tweetText: item.text,
        tokens: item.tokensMentioned || [],
        sentiment: item.sentiment?.sentiment || 'neutral',
        timestamp: new Date(item.createdAt)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching token calls:', error);
    return [];
  }
}

/**
 * Post whale alert to Twitter
 */
async function postWhaleAlert(transaction: WhaleTransaction): Promise<boolean> {
  try {
    const type = transaction.type.includes('withdrawal') ? 'sell' : 
                 transaction.type.includes('deposit') ? 'buy' : 'transfer';
    
    const tweetData = {
      address: transaction.fromAddress,
      amount: transaction.value,
      token: transaction.cryptocurrency.symbol,
      usdValue: `$${(transaction.valueUsd / 1000000).toFixed(2)}M`,
      type: type as 'buy' | 'sell' | 'transfer',
      chain: transaction.blockchain.charAt(0).toUpperCase() + transaction.blockchain.slice(1)
    };

    if (CONFIG.DRY_RUN) {
      const tweetText = twitterClient.createWhaleAlertTweet(tweetData);
      console.log('\n🧪 DRY RUN - Would post:');
      console.log(tweetText);
      console.log('\n---\n');
      return true;
    }

    const tweetText = twitterClient.createWhaleAlertTweet(tweetData);
    const result = await twitterClient.postTweet(tweetText);
    
    if (result.success) {
      console.log(`✅ Posted whale alert for ${transaction.cryptocurrency.symbol} transaction`);
      console.log(`   Tweet ID: ${result.tweetId}`);
      lastPostedWhaleId = transaction.id;
      return true;
    } else {
      console.error(`❌ Failed to post whale alert: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('Error posting whale alert:', error);
    return false;
  }
}

/**
 * Post token call alert to Twitter
 */
async function postTokenCallAlert(tokenCall: TokenCall): Promise<boolean> {
  try {
    const tokens = tokenCall.tokens.slice(0, 3); // Max 3 tokens
    const sentimentEmoji = tokenCall.sentiment === 'very_bullish' || tokenCall.sentiment === 'bullish' ? '🚀' :
                          tokenCall.sentiment === 'bearish' || tokenCall.sentiment === 'very_bearish' ? '🔻' : '📊';
    
    const tweetText = `${sentimentEmoji} TOKEN CALL ALERT

Shot Caller: @${tokenCall.username}
Tokens: ${tokens.map(t => `$${t}`).join(' ')}
Sentiment: ${tokenCall.sentiment.toUpperCase()}

${tokenCall.tweetText.substring(0, 100)}${tokenCall.tweetText.length > 100 ? '...' : ''}

Track shot callers: https://defidashtracker.com/shot-callers

#Crypto #TokenCall #SmartMoney`;

    if (CONFIG.DRY_RUN) {
      console.log('\n🧪 DRY RUN - Would post:');
      console.log(tweetText);
      console.log('\n---\n');
      return true;
    }

    const result = await twitterClient.postTweet(tweetText);
    
    if (result.success) {
      console.log(`✅ Posted token call from @${tokenCall.username}`);
      console.log(`   Tweet ID: ${result.tweetId}`);
      lastPostedTokenCall = `${tokenCall.username}_${tokenCall.timestamp.getTime()}`;
      return true;
    } else {
      console.error(`❌ Failed to post token call: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('Error posting token call:', error);
    return false;
  }
}

/**
 * Post daily market summary
 */
async function postDailySummary(): Promise<boolean> {
  try {
    // Fetch market data
    const response = await fetch('http://localhost:3000/api/trending-tokens?limit=5');
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.log('⚠️ No trending tokens data available for daily summary');
      return false;
    }

    const topMovers = data.data.slice(0, 3).map((token: any) => ({
      token: token.symbol,
      change: `${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%`
    }));

    const whaleTransactions = await fetchWhaleTransactions();
    
    const summaryData = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalWhaleTransactions: whaleTransactions.length,
      topMovers,
      marketSentiment: topMovers.some((m: any) => parseFloat(m.change) > 10) ? 'BULLISH' :
                       topMovers.some((m: any) => parseFloat(m.change) < -10) ? 'BEARISH' : 'NEUTRAL'
    };

    if (CONFIG.DRY_RUN) {
      const tweetText = twitterClient.createDailyReportTweet(summaryData);
      console.log('\n🧪 DRY RUN - Would post:');
      console.log(tweetText);
      console.log('\n---\n');
      return true;
    }

    const tweetText = twitterClient.createDailyReportTweet(summaryData);
    const result = await twitterClient.postTweet(tweetText);
    
    if (result.success) {
      console.log('✅ Posted daily market summary');
      console.log(`   Tweet ID: ${result.tweetId}`);
      return true;
    } else {
      console.error(`❌ Failed to post daily summary: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('Error posting daily summary:', error);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🐦 Starting Auto Twitter Post Script');
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log(`🧪 Dry Run: ${CONFIG.DRY_RUN ? 'YES' : 'NO'}`);
  console.log('---\n');

  let postsCount = 0;
  const now = Date.now();
  
  // Rate limiting: Don't post more than once every 30 minutes
  if (lastPostTime && (now - lastPostTime) < CONFIG.POSTING_INTERVAL_MINUTES * 60 * 1000) {
    console.log('⏳ Too soon since last post. Waiting for next interval...');
    return;
  }

  // 1. Check for significant whale movements
  console.log('🔍 Checking for whale movements...');
  const whaleTransactions = await fetchWhaleTransactions();
  
  if (whaleTransactions.length > 0) {
    // Filter out already posted transactions
    const newTransactions = whaleTransactions.filter(tx => 
      tx.id !== lastPostedWhaleId && tx.valueUsd >= CONFIG.WHALE_THRESHOLD_USD
    );

    if (newTransactions.length > 0) {
      console.log(`   Found ${newTransactions.length} significant whale transaction(s)`);
      
      // Post the most significant transaction
      const topTransaction = newTransactions.sort((a, b) => b.valueUsd - a.valueUsd)[0];
      const success = await postWhaleAlert(topTransaction);
      
      if (success) {
        postsCount++;
        lastPostTime = now;
      }
    } else {
      console.log('   No new whale transactions to post');
    }
  } else {
    console.log('   No whale transactions found');
  }

  // Wait between posts
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 2. Check for token calls
  if (postsCount < CONFIG.MAX_POSTS_PER_RUN) {
    console.log('\n🔍 Checking for token calls...');
    const tokenCalls = await fetchTokenCalls();
    
    if (tokenCalls.length > 0) {
      const newCalls = tokenCalls.filter(call => {
        const callId = `${call.username}_${call.timestamp.getTime()}`;
        return callId !== lastPostedTokenCall && call.tokens.length > 0;
      });

      if (newCalls.length > 0) {
        console.log(`   Found ${newCalls.length} new token call(s)`);
        
        // Post the most recent call with tokens
        const topCall = newCalls[0];
        const success = await postTokenCallAlert(topCall);
        
        if (success) {
          postsCount++;
          lastPostTime = now;
        }
      } else {
        console.log('   No new token calls to post');
      }
    } else {
      console.log('   No token calls found');
    }
  }

  // 3. Post daily summary at 9 AM UTC (configurable)
  const currentHour = new Date().getUTCHours();
  if (currentHour === 9 && postsCount < CONFIG.MAX_POSTS_PER_RUN) {
    console.log('\n📊 Posting daily market summary...');
    const success = await postDailySummary();
    
    if (success) {
      postsCount++;
    }
  }

  console.log(`\n✅ Auto-posting completed. Posted ${postsCount} tweet(s)`);
  console.log(`⏰ Next check: ${new Date(now + CONFIG.POSTING_INTERVAL_MINUTES * 60 * 1000).toLocaleString()}`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as autoTwitterPost };
