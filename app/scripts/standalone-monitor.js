#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Monitors watchlisted wallets without requiring Next.js server
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock implementations for blockchain APIs (since we can't access the actual libs without TypeScript)
async function getWalletTransactions(address, chain, limit = 10) {
  console.log(`  Fetching transactions for ${address} on ${chain}...`);
  // In a real scenario, this would call Alchemy/Moralis/Etherscan
  // For now, return empty array to simulate no new transactions
  return [];
}

async function getSolanaTokenTransfers(address) {
  console.log(`  Fetching Solana transfers for ${address}...`);
  // In a real scenario, this would call Helius
  return [];
}

async function notifyWalletTransaction(data) {
  console.log(`  📱 Would send Telegram notification to ${data.username}`);
  // In a real scenario, this would call Telegram Bot API
}

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  console.log('='.repeat(80));

  try {
    // Step 1: Cleanup expired trial users' watchlists
    const now = new Date();
    const expiredUsers = await prisma.user.findMany({
      where: {
        isPremium: false,
        trialEndsAt: { lte: now }
      },
      select: { id: true }
    });

    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map(u => u.id) }
        }
      });
      console.log(`✓ Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
    } else {
      console.log('✓ No expired trial users found');
    }

    // Step 2: Fetch all active watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramUsername: true,
            telegramChatId: true,
            isPremium: true,
            trialEndsAt: true
          }
        }
      }
    });

    console.log(`\n✓ Found ${watchlistItems.length} watchlist items to monitor`);
    console.log('='.repeat(80));

    let alertsCreated = 0;
    const results = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      console.log(`\n📊 Checking: ${item.address} (${item.chain})`);
      console.log(`   Last checked: ${item.lastChecked.toISOString()}`);
      console.log(`   User: ${item.user.telegramUsername || 'No Telegram'}`);
      
      try {
        let transactions = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          transactions = await getSolanaTokenTransfers(item.address);
        } else {
          transactions = await getWalletTransactions(item.address, item.chain, 10);
        }

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter(tx => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        console.log(`   Found ${transactions.length} total transactions, ${newTransactions.length} new`);

        // Process each new transaction
        for (const tx of newTransactions) {
          // If token-specific monitoring, filter by token
          if (item.tokenAddress) {
            const hasTokenTransfer = tx.tokenTransfers?.some(
              transfer =>
                transfer.rawContract?.address?.toLowerCase() === item.tokenAddress?.toLowerCase() ||
                transfer.contractAddress?.toLowerCase() === item.tokenAddress?.toLowerCase() ||
                transfer.tokenAddress?.toLowerCase() === item.tokenAddress?.toLowerCase()
            );
            if (!hasTokenTransfer) continue;
          }

          // Determine transaction type
          const isSent = tx.from?.toLowerCase() === item.address.toLowerCase();
          const isReceived = tx.to?.toLowerCase() === item.address.toLowerCase();
          const type = isSent ? 'sent' : isReceived ? 'received' : 'contract';

          // Extract token transfer details
          let tokenTransfer = null;
          if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
            const transfer = tx.tokenTransfers[0];
            tokenTransfer = {
              address: transfer.rawContract?.address || transfer.contractAddress || transfer.tokenAddress,
              symbol: transfer.asset || transfer.tokenSymbol,
              amount: transfer.valueFormatted || transfer.value
            };
          }

          // Create transaction alert
          try {
            const alert = await prisma.transactionAlert.create({
              data: {
                userId: item.user.id,
                walletAddress: item.address,
                chain: item.chain,
                transactionHash: tx.hash,
                fromAddress: tx.from,
                toAddress: tx.to,
                value: tx.value,
                tokenAddress: tokenTransfer?.address,
                tokenSymbol: tokenTransfer?.symbol,
                tokenAmount: tokenTransfer?.amount,
                type
              }
            });

            alertsCreated++;
            console.log(`   🔔 Created alert for transaction ${tx.hash.substring(0, 10)}...`);

            // Send Telegram notification
            if (item.user.telegramUsername) {
              await notifyWalletTransaction({
                username: item.user.telegramUsername,
                walletAddress: item.address,
                chain: item.chain,
                transactionHash: tx.hash,
                type,
                value: tx.value,
                tokenSymbol: tokenTransfer?.symbol,
                tokenAmount: tokenTransfer?.amount
              });
            }
          } catch (error) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') {
              console.log(`   ⚠️  Duplicate alert skipped for ${tx.hash.substring(0, 10)}...`);
              continue;
            }
            throw error;
          }
        }

        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        console.log(`   ✓ Updated lastChecked timestamp`);

        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: newTransactions.length,
          success: true
        });
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message,
          success: false
        });
      }
    }

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('📈 MONITORING SUMMARY');
    console.log('='.repeat(80));
    console.log(`Wallets checked: ${watchlistItems.length}`);
    console.log(`Alerts created: ${alertsCreated}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Completed at: ${endTime.toISOString()}`);
    console.log('='.repeat(80));

    await prisma.$disconnect();

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      startTime,
      endTime,
      duration
    };
  } catch (error) {
    console.error(`\n❌ MONITORING FAILED: ${error.message}`);
    console.error(error.stack);
    await prisma.$disconnect();
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Execute monitoring
if (require.main === module) {
  monitorWatchlist()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { monitorWatchlist };
