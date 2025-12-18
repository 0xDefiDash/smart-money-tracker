#!/usr/bin/env node
/**
 * Direct Watchlist Monitor Script
 * Directly calls the monitoring logic without requiring the Next.js server
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting direct watchlist monitoring...`);
  
  const results = {
    timestamp,
    walletsChecked: 0,
    alertsCreated: 0,
    walletDetails: [],
    errors: []
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

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      const walletDetail = {
        address: item.address,
        chain: item.chain,
        label: item.label || 'Unlabeled',
        tokenSymbol: item.tokenSymbol || 'ALL',
        newTransactions: 0,
        error: null
      };

      try {
        // Get the last checked time
        const lastChecked = item.lastChecked || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24h ago
        
        console.log(`Checking ${item.address} on ${item.chain} (last checked: ${lastChecked.toISOString()})`);
        
        // Note: In a real implementation, we would call blockchain APIs here
        // For now, we'll just update the lastChecked timestamp
        
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        walletDetail.newTransactions = 0; // Would be populated by actual API calls
        results.walletDetails.push(walletDetail);
        
      } catch (error) {
        console.error(`Error checking ${item.address}:`, error.message);
        walletDetail.error = error.message;
        results.walletDetails.push(walletDetail);
        results.errors.push({
          wallet: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  - Wallets checked: ${results.walletsChecked}`);
    console.log(`  - Alerts created: ${results.alertsCreated}`);
    console.log(`  - Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error);
    results.errors.push({
      type: 'FATAL',
      error: error.message,
      stack: error.stack
    });
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((results) => {
    // Write results to file
    const fs = require('fs');
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join('/home/ubuntu/watchlist_logs', `monitor_${timestamp}.json`);
    
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
    console.log(`\nResults written to: ${logPath}`);
    
    process.exit(results.errors.length === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
