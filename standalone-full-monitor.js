#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Replicates the functionality of /api/watchlist/check endpoint
 * Queries blockchain APIs and creates transaction alerts
 */

const { PrismaClient } = require('./app/node_modules/@prisma/client');
const { getWalletTransactions } = require('./app/lib/ethereum.js');
const { getSolanaTokenTransfers } = require('./app/lib/solana.js');
const { notifyWalletTransaction } = require('./app/lib/telegram-client.js');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting comprehensive watchlist monitoring...`);
  
  const results = {
    walletsChecked: 0,
    alertsCreated: 0,
    errors: [],
    walletDetails: [],
    startTime: startTime.toISOString(),
    endTime: null
  };

  try {
    // Step 1: Cleanup expired trial users' watchlists
    console.log('\n[Step 1] Cleaning up expired trial users...');
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
      console.log(`  ✓ Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
    } else {
      console.log(`  ✓ No expired users found`);
    }

    // Step 2: Fetch all active watchlist items
    console.log('\n[Step 2] Fetching active watchlist items...');
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

    console.log(`  ✓ Found ${watchlistItems.length} active watchlist items`);
    results.walletsChecked = watchlistItems.length;

    // Step 3: Check each watchlist item for new transactions
    console.log('\n[Step 3] Checking wallets for new transactions...');
    for (const item of watchlistItems) {
      const walletDetail = {
        address: item.address,
        chain: item.chain,
        tokenAddress: item.tokenAddress,
        lastChecked: item.lastChecked ? item.lastChecked.toISOString() : null,
        newTransactions: 0,
        alertsCreated: 0,
        error: null
      };

      try {
        console.log(`\n  Checking ${item.address} on ${item.chain}...`);
        let transactions = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          console.log(`    Fetching Solana transactions...`);
          transactions = await getSolanaTokenTransfers(item.address);
        } else {
          console.log(`    Fetching ${item.chain} transactions...`);
          transactions = await getWalletTransactions(item.address, item.chain, 10);
        }

        console.log(`    Found ${transactions.length} total transactions`);

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter(tx => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        console.log(`    ${newTransactions.length} new transactions since last check`);
        walletDetail.newTransactions = newTransactions.length;

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
            if (!hasTokenTransfer) {
              console.log(`    Skipping tx ${tx.hash} - no matching token transfer`);
              continue;
            }
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

            results.alertsCreated++;
            walletDetail.alertsCreated++;
            console.log(`    ✓ Created alert for tx ${tx.hash} (${type})`);

            // Send Telegram notification
            if (item.user.telegramUsername) {
              try {
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
                console.log(`    ✓ Sent Telegram notification to @${item.user.telegramUsername}`);
              } catch (telegramError) {
                console.error(`    ⚠ Failed to send Telegram notification:`, telegramError.message);
              }
            }
          } catch (error) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') {
              console.log(`    ⚠ Duplicate alert for tx ${tx.hash}, skipping`);
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

        console.log(`    ✓ Updated lastChecked timestamp`);
        results.walletDetails.push(walletDetail);

      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        walletDetail.error = error.message;
        results.errors.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
        results.walletDetails.push(walletDetail);
      }
    }

    const endTime = new Date();
    results.endTime = endTime.toISOString();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n[${endTime.toISOString()}] Monitoring complete`);
    console.log(`  Duration: ${duration}s`);
    console.log(`  Wallets checked: ${results.walletsChecked}`);
    console.log(`  Alerts created: ${results.alertsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    results.errors.push({
      error: error.message,
      stack: error.stack,
      fatal: true
    });
    results.endTime = new Date().toISOString();
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((results) => {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    console.log('=== END RESULTS ===');
    process.exit(results.errors.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
