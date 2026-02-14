#!/usr/bin/env ts-node
/**
 * Full Standalone Watchlist Monitor
 * Includes all monitoring logic from the API endpoint
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import the actual library functions
let getWalletTransactions: any;
let getSolanaTokenTransfers: any;
let notifyWalletTransaction: any;

async function loadLibraries() {
  try {
    const ethLib = await import('./app/lib/ethereum');
    getWalletTransactions = ethLib.getWalletTransactions;
    
    const solLib = await import('./app/lib/solana');
    getSolanaTokenTransfers = solLib.getSolanaTokenTransfers;
    
    const telegramLib = await import('./app/lib/telegram-client');
    notifyWalletTransaction = telegramLib.notifyWalletTransaction;
    
    return true;
  } catch (error: any) {
    console.error('Error loading libraries:', error.message);
    return false;
  }
}

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
  try {
    // Load required libraries
    const librariesLoaded = await loadLibraries();
    if (!librariesLoaded) {
      console.log('⚠️  Libraries not loaded - running in dry-run mode');
    }
    
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
          userId: { in: expiredUsers.map((u: any) => u.id) }
        }
      });
      console.log(`  🧹 Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
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

    console.log(`  📋 Found ${watchlistItems.length} watchlist items to check`);

    let alertsCreated = 0;
    const results = [];

    // Step 3: Check each watchlist item for new transactions
    for (const item of watchlistItems) {
      try {
        let transactions = [];

        // Fetch transactions based on chain
        if (librariesLoaded) {
          if (item.chain === 'solana') {
            transactions = await getSolanaTokenTransfers(item.address);
          } else {
            transactions = await getWalletTransactions(item.address, item.chain, 10);
          }
        }

        // Filter for new transactions (since lastChecked)
        const newTransactions = transactions.filter((tx: any) => {
          const txTime = new Date(tx.timestamp || tx.blockTimestamp);
          return txTime > item.lastChecked;
        });

        // Process each new transaction
        for (const tx of newTransactions) {
          // If token-specific monitoring, filter by token
          if (item.tokenAddress) {
            const hasTokenTransfer = tx.tokenTransfers?.some(
              (transfer: any) =>
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

            // Send Telegram notification
            if (item.user.telegramUsername && librariesLoaded) {
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
          } catch (error: any) {
            // Skip if duplicate alert (same tx hash for same user)
            if (error.code === 'P2002') continue;
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

        if (newTransactions.length > 0) {
          console.log(`  🔔 ${item.address} (${item.chain}): ${newTransactions.length} new transaction(s)`);
        } else {
          console.log(`  ✓ ${item.address} (${item.chain}): No new transactions`);
        }
      } catch (error: any) {
        console.error(`  ❌ ${item.address} (${item.chain}): ${error.message}`);
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

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  ⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`  📊 Wallets checked: ${watchlistItems.length}`);
    console.log(`  🔔 Alerts created: ${alertsCreated}`);

    await prisma.$disconnect();

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      duration,
      timestamp: endTime.toISOString()
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    await prisma.$disconnect();
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n✅ Monitoring task completed`);
    // Output result as JSON for parsing
    console.log('\n--- RESULT JSON ---');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
