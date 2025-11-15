
/**
 * Immediate Twitter Test Post
 * Posts a test tweet right now to verify integration
 */

import { twitterClient } from './lib/twitter-client';

async function testPost() {
  console.log('\n🐦 Testing Twitter Integration');
  console.log('⏰ Time:', new Date().toLocaleString());
  console.log('---\n');

  try {
    // Test 1: Simple test tweet
    console.log('📝 Test 1: Simple test tweet...');
    const testTweet = `🚀 DeFiDash Smart Money Tracker is LIVE!

Real-time whale tracking, market insights, and instant alerts.

Track smart money movements: https://defidashtracker.com

#DeFi #Crypto #SmartMoney`;

    const result1 = await twitterClient.postTweet(testTweet);
    
    if (result1.success) {
      console.log('✅ Test tweet posted successfully!');
      console.log(`   Tweet ID: ${result1.tweetId}`);
      console.log(`   View: https://twitter.com/Defidash_Agent/status/${result1.tweetId}`);
    } else {
      console.error('❌ Test tweet failed:', result1.error);
    }

    // Wait 5 seconds between tweets
    console.log('\n⏳ Waiting 5 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 2: Whale alert example
    console.log('📝 Test 2: Whale alert example...');
    const whaleAlertTweet = twitterClient.createWhaleAlertTweet({
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
      amount: '15,234',
      token: 'ETH',
      usdValue: '$60.8M',
      type: 'buy',
      chain: 'Ethereum'
    });

    const result2 = await twitterClient.postTweet(whaleAlertTweet);
    
    if (result2.success) {
      console.log('✅ Whale alert posted successfully!');
      console.log(`   Tweet ID: ${result2.tweetId}`);
      console.log(`   View: https://twitter.com/Defidash_Agent/status/${result2.tweetId}`);
    } else {
      console.error('❌ Whale alert failed:', result2.error);
    }

    // Wait 5 seconds
    console.log('\n⏳ Waiting 5 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 3: Market update
    console.log('📝 Test 3: Market update...');
    const marketTweet = twitterClient.createMarketUpdateTweet({
      token: 'BTC',
      price: '$111,888',
      change24h: '+8.5%',
      sentiment: 'bullish'
    });

    const result3 = await twitterClient.postTweet(marketTweet);
    
    if (result3.success) {
      console.log('✅ Market update posted successfully!');
      console.log(`   Tweet ID: ${result3.tweetId}`);
      console.log(`   View: https://twitter.com/Defidash_Agent/status/${result3.tweetId}`);
    } else {
      console.error('❌ Market update failed:', result3.error);
    }

    console.log('\n✅ All test tweets completed!');
    console.log('\n📊 Summary:');
    console.log(`   Test 1: ${result1.success ? '✅' : '❌'}`);
    console.log(`   Test 2: ${result2.success ? '✅' : '❌'}`);
    console.log(`   Test 3: ${result3.success ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error during test:', error);
    throw error;
  }
}

// Run the test
testPost().catch(console.error);
