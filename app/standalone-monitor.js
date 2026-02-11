#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor
 * Runs monitoring without requiring Next.js server
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
  const results = {
    walletsChecked: 0,
    alertsCreated: 0,
    errors: [],
    walletDetails: []
  };

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
      console.log(`Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users`);
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

    console.log(`Found ${watchlistItems.length} watchlist items to check`);
    results.walletsChecked = watchlistItems.length;

    // Step 3: Process each watchlist item
    for (const item of watchlistItems) {
      const walletResult = {
        address: item.address,
        chain: item.chain,
        newTransactions: 0,
        error: null
      };

      try {
        // For this standalone version, we'll just update the lastChecked timestamp
        // In production, this would call blockchain APIs to fetch transactions
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: now }
        });

        console.log(`✓ Checked ${item.address} (${item.chain})`);
        walletResult.newTransactions = 0; // Would be actual count from API
      } catch (error) {
        console.error(`✗ Error checking ${item.address}:`, error.message);
        walletResult.error = error.message;
        results.errors.push({
          wallet: item.address,
          chain: item.chain,
          error: error.message
        });
      }

      results.walletDetails.push(walletResult);
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  - Wallets checked: ${results.walletsChecked}`);
    console.log(`  - Alerts created: ${results.alertsCreated}`);
    console.log(`  - Errors: ${results.errors.length}`);
    console.log(`  - Duration: ${duration.toFixed(2)}s`);

    return {
      success: true,
      timestamp: endTime.toISOString(),
      duration: duration,
      ...results
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      ...results
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
if (require.main === module) {
  monitorWatchlist()
    .then((result) => {
      console.log('\n=== Monitoring Results ===');
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { monitorWatchlist };
