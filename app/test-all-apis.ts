
import { etherscanClient } from './lib/etherscan-client';
import { moralisClient } from './lib/moralis-client';
import { getWalletBalance, getTokenBalances } from './lib/ethereum';

const TEST_WALLET = '0x8A9E890f48Df383a6839387bC93cB661C1c7D87a';
const CHAINS = ['base', 'bnb', 'ethereum'];

console.log('\n🚀 COMPREHENSIVE WALLET TRACKER TEST\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📍 Test Wallet: ${TEST_WALLET}\n`);
console.log('Testing All API Integrations: Alchemy, Moralis, Etherscan\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function testAllAPIs() {
  for (const chain of CHAINS) {
    console.log(`\n🔗 TESTING CHAIN: ${chain.toUpperCase()}`);
    console.log('─────────────────────────────────────────────────────────');

    // Test 1: Etherscan Balance
    console.log('\n📊 Test 1: Etherscan Balance API');
    try {
      const etherscanBalance = await etherscanClient.getBalance(TEST_WALLET, chain);
      console.log(`   ✅ Balance: ${etherscanBalance.balance}`);
      console.log(`   📦 Raw Wei: ${etherscanBalance.balanceWei}`);
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 2: Moralis Balance
    console.log('\n📊 Test 2: Moralis Balance API');
    try {
      const chainId = moralisClient.getChainId(chain);
      const chainInfo = moralisClient.getChainInfo(chainId);
      const nativeBalance = await moralisClient.getNativeBalance(TEST_WALLET, chainId);
      const nativeData = nativeBalance.toJSON();
      const formatted = moralisClient.formatWei(nativeData.balance, 18);
      
      console.log(`   ✅ Balance: ${formatted} ${chainInfo.symbol}`);
      console.log(`   🏦 Chain: ${chainInfo.name}`);
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 3: Alchemy Balance (if chain is supported)
    if (['ethereum', 'base', 'bnb'].includes(chain)) {
      console.log('\n📊 Test 3: Alchemy Balance API');
      try {
        const alchemyBalance = await getWalletBalance(TEST_WALLET, chain);
        console.log(`   ✅ Balance: ${alchemyBalance.balance} ${alchemyBalance.currency}`);
        console.log(`   💵 USD Value: $${alchemyBalance.balanceUSD}`);
      } catch (error: any) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    // Test 4: Moralis Token Balances
    console.log('\n🪙  Test 4: Moralis Token Balances');
    try {
      const chainId = moralisClient.getChainId(chain);
      const tokenBalances = await moralisClient.getWalletTokenBalances(TEST_WALLET, chainId);
      const tokenData = tokenBalances.toJSON();
      
      if (tokenData?.result && tokenData.result.length > 0) {
        console.log(`   ✅ Found ${tokenData.result.length} tokens`);
        tokenData.result.slice(0, 5).forEach((token: any, idx: number) => {
          const balance = moralisClient.formatWei(token.balance, token.decimals || 18);
          const usdValue = token.usd_value ? `$${token.usd_value.toFixed(2)}` : 'N/A';
          console.log(`   ${idx + 1}. ${token.symbol}: ${balance} (${usdValue})`);
        });
      } else {
        console.log(`   ℹ️  No tokens found`);
      }
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 5: Alchemy Token Balances
    if (['ethereum', 'base', 'bnb'].includes(chain)) {
      console.log('\n🪙  Test 5: Alchemy Token Balances');
      try {
        const alchemyTokens = await getTokenBalances(TEST_WALLET, chain);
        if (alchemyTokens.length > 0) {
          console.log(`   ✅ Found ${alchemyTokens.length} tokens`);
          alchemyTokens.slice(0, 5).forEach((token: any, idx: number) => {
            console.log(`   ${idx + 1}. ${token.symbol}: ${token.balance} ($${token.valueUSD})`);
          });
        } else {
          console.log(`   ℹ️  No tokens found`);
        }
      } catch (error: any) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    // Test 6: Etherscan Transactions
    console.log('\n📜 Test 6: Etherscan Transactions API');
    try {
      const txs = await etherscanClient.getTransactions(TEST_WALLET, chain, { offset: 5 });
      if (txs.length > 0) {
        console.log(`   ✅ Found ${txs.length} transactions`);
        txs.slice(0, 3).forEach((tx: any, idx: number) => {
          const value = (parseFloat(tx.value) / 1e18).toFixed(6);
          const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
          console.log(`   ${idx + 1}. ${tx.hash.substring(0, 10)}... | ${value} | ${date}`);
        });
      } else {
        console.log(`   ℹ️  No transactions found`);
      }
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 7: Etherscan Token Transfers
    console.log('\n🔄 Test 7: Etherscan Token Transfers');
    try {
      const tokenTxs = await etherscanClient.getTokenTransfers(TEST_WALLET, chain, { offset: 5 });
      if (tokenTxs.length > 0) {
        console.log(`   ✅ Found ${tokenTxs.length} token transfers`);
        tokenTxs.slice(0, 3).forEach((tx: any, idx: number) => {
          const value = (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal || '18'))).toFixed(4);
          console.log(`   ${idx + 1}. ${tx.tokenSymbol}: ${value} | ${tx.hash.substring(0, 10)}...`);
        });
      } else {
        console.log(`   ℹ️  No token transfers found`);
      }
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
  }

  // Test Gas Oracle
  console.log('\n\n⛽ BONUS TEST: Gas Price Oracle');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const gasOracle = await etherscanClient.getGasOracle('ethereum');
    console.log(`   ✅ Safe Gas Price: ${gasOracle.SafeGasPrice} Gwei`);
    console.log(`   ✅ Propose Gas Price: ${gasOracle.ProposeGasPrice} Gwei`);
    console.log(`   ✅ Fast Gas Price: ${gasOracle.FastGasPrice} Gwei`);
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('\n✅ ALL TESTS COMPLETED!\n');
  console.log('Summary:');
  console.log('  • Alchemy API: Integrated for balance, tokens, transactions');
  console.log('  • Moralis API: Integrated for multi-chain token tracking');
  console.log('  • Etherscan API: Integrated for all EVM chains');
  console.log('  • Redundancy: Multiple fallback sources configured');
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

testAllAPIs().catch(console.error);
