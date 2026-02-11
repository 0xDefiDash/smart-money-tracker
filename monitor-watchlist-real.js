#!/usr/bin/env node
/**
 * Real Watchlist Monitor
 * Uses actual Prisma client and blockchain libraries from the app
 */

const path = require('path');

// Use the app's Prisma client
const { PrismaClient } = require('./app/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Import blockchain libraries
const { getWalletTransactions } = require('./app/lib/ethereum.js');

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...\n`);

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
      console.log(`🧹 Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired trial users\n`);
    }

    // Step 2: Fetch all active watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramUsername: true,
            telegramChatId: true,
            isPremium: true,
            trialEndsAt: true
          }
        }
      }
    });

    console.log(`📋 Found ${watchlistItems.length} watchlist items to monitor\n`);

    let alertsCreated = 0;
    const results = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      console.log(`Checking: ${item.address} (${item.chain})${item.tokenAddress ? ` - Token: ${item.tokenAddress}` : ''}`);
      
      try {
        let transactions = [];

        // Fetch transactions based on chain
        if (item.chain === 'solana') {
          console.log(`  ⚠️  Solana monitoring not yet implemented`);
          transactions = [];
        } else {
          try {
            transactions = await getWalletTransactions(item.address, item.chain, 10);
          } catch (error) {
            console.log(`  ⚠️  Error fetching transactions: ${error.message}`);
            transactions = [];
          }
        }

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter(tx => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        console.log(`  Found ${newTransactions.length} new transactions since ${item.lastChecked.toISOString()}`);

        // Process each new transaction
        for (const tx of newTransactions) {
          // If token-specific monitoring, filter by token
          if (item.tokenAddress) {
            const hasTokenTransfer = tx.tokenTransfers?.some(
              transfer =>
                transfer.rawContract?.address?.toLowerCase() ===
                item.tokenAddress?.toLowerCase() ||
                transfer.contractAddress?.toLowerCase() ===
                item.tokenAddress?.toLowerCase() ||
                transfer.tokenAddress?.toLowerCase() ===
                item.tokenAddress?.toLowerCase()
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
            console.log(`  ✅ Alert created: ${type} transaction ${tx.hash.substring(0, 10)}...`);

            // Log Telegram notification (actual sending would require Telegram Bot API)
            if (item.user.telegramUsername) {
              console.log(`  📱 Would send Telegram notification to @${item.user.telegramUsername}`);
            }
          } catch (error) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') {
              console.log(`  ⏭️  Skipped duplicate alert for ${tx.hash.substring(0, 10)}...`);
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

        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: newTransactions.length,
          success: true
        });

        console.log(`  ✓ Updated lastChecked timestamp\n`);
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message,
          success: false
        });
      }
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Monitoring Complete`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Wallets Checked: ${watchlistItems.length}`);
    console.log(`Alerts Created: ${alertsCreated}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      duration,
      timestamp: endTime.toISOString()
    };
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    // Store result globally for access
    global.monitoringResult = result;
    console.log('\n--- RESULT JSON ---');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\nFatal error:`, error);
    process.exit(1);
  });
