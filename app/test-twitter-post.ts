import { twitterClient } from './lib/twitter-client';

async function testTwitterPost() {
  console.log('🧪 Testing Twitter Integration for @Defidash_Agent\n');

  // Test 1: Create a platform feature tweet
  console.log('📝 Test 1: Creating platform feature tweet...');
  const featureTweet = twitterClient.createPlatformFeatureTweet('whale-tracker');
  console.log('Tweet preview:\n', featureTweet);
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Post a real test tweet
  console.log('🐦 Test 2: Attempting to post a live tweet to @Defidash_Agent...');
  const testTweet = `🚀 DeFiDash Tracker - Smart Money Intelligence

Track whale movements, monitor wallets, and get real-time crypto alerts across multiple chains.

Join us: https://defidashtracker.com

#DeFi #Crypto #SmartMoney #WhaleTracking`;

  console.log('Posting tweet:\n', testTweet);
  console.log('\nAttempting to post...');
  
  const result = await twitterClient.postTweet(testTweet);

  if (result.success) {
    console.log('\n✅ SUCCESS! Tweet posted to @Defidash_Agent');
    console.log(`Tweet ID: ${result.tweetId}`);
    console.log(`View at: https://twitter.com/Defidash_Agent/status/${result.tweetId}`);
  } else {
    console.log('\n❌ FAILED to post tweet');
    console.log('Error:', result.error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Create different types of tweets
  console.log('📊 Test 3: Preview different tweet types...\n');

  const whaleAlert = twitterClient.createWhaleAlertTweet({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: '2,500',
    token: 'ETH',
    usdValue: '$12.8M',
    type: 'buy',
    chain: 'Ethereum'
  });
  console.log('Whale Alert Tweet:\n', whaleAlert);

  console.log('\n' + '-'.repeat(60) + '\n');

  const marketUpdate = twitterClient.createMarketUpdateTweet({
    token: 'BTC',
    price: '$132,850',
    change24h: '+5.3%',
    sentiment: 'bullish'
  });
  console.log('Market Update Tweet:\n', marketUpdate);

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('✅ Twitter integration test complete!');
}

testTwitterPost().catch(console.error);
