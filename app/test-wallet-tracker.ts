
import { moralisClient } from './lib/moralis-client';

const TEST_WALLET = '0x8A9E890f48Df383a6839387bC93cB661C1c7D87a';
const CHAINS = ['base', 'bnb', 'ethereum'];

async function testWalletTracker() {
  console.log('\n🔍 Testing Wallet Tracker with Moralis API\n');
  console.log('═══════════════════════════════════════════════\n');
  console.log(`📍 Test Wallet: ${TEST_WALLET}\n`);

  for (const chain of CHAINS) {
    try {
      const chainId = moralisClient.getChainId(chain);
      const chainInfo = moralisClient.getChainInfo(chainId);
      
      console.log(`\n🔗 Chain: ${chainInfo.name.toUpperCase()} (${chain})`);
      console.log('─────────────────────────────────────────────');

      // Get native balance
      const nativeBalance = await moralisClient.getNativeBalance(TEST_WALLET, chainId);
      const nativeData = nativeBalance.toJSON();
      const nativeBalanceFormatted = moralisClient.formatWei(nativeData.balance, 18);
      
      console.log(`\n💰 Native Balance:`);
      console.log(`   ${nativeBalanceFormatted} ${chainInfo.symbol}`);

      // Get token balances
      const tokenBalances = await moralisClient.getWalletTokenBalances(TEST_WALLET, chainId);
      const tokenData = tokenBalances.toJSON();
      
      if (tokenData?.result && tokenData.result.length > 0) {
        console.log(`\n🪙  Token Holdings (${tokenData.result.length} tokens):`);
        
        tokenData.result.slice(0, 10).forEach((token: any, index: number) => {
          const balance = moralisClient.formatWei(token.balance, token.decimals || 18);
          const usdValue = token.usd_value ? `$${token.usd_value.toFixed(2)}` : 'N/A';
          
          console.log(`\n   ${index + 1}. ${token.symbol || 'UNKNOWN'}`);
          console.log(`      Name: ${token.name || 'Unknown Token'}`);
          console.log(`      Balance: ${balance}`);
          console.log(`      USD Value: ${usdValue}`);
          console.log(`      Contract: ${token.token_address}`);
        });

        if (tokenData.result.length > 10) {
          console.log(`\n   ... and ${tokenData.result.length - 10} more tokens`);
        }
      } else {
        console.log(`\n🪙  Token Holdings: No tokens found`);
      }

      console.log(`\n🔍 Explorer: ${chainInfo.explorer}/address/${TEST_WALLET}`);
      console.log('\n═══════════════════════════════════════════════');

    } catch (error: any) {
      console.error(`\n❌ Error testing ${chain}:`, error.message);
      console.log('═══════════════════════════════════════════════');
    }
  }

  console.log('\n✅ Wallet tracker test completed!\n');
}

// Run the test
testWalletTracker().catch(console.error);
