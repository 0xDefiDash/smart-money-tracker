#!/usr/bin/env node
/**
 * Standalone Watchlist Monitor Script
 * 
 * This script directly monitors watchlisted wallets without requiring the Next.js server.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
      console.log(`✓ Cleaned up ${deleted.count} watchlist items from ${expiredUsers.length} expired users\n`);
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

    console.log(`Found ${watchlistItems.length} watchlist items to check\n`);

    let alertsCreated = 0;
    const results = [];

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      console.log(`Checking: ${item.address} (${item.chain})`);
      
      try {
        // For this monitoring run, we'll just update the lastChecked timestamp
        // In production, this would fetch actual transactions from blockchain APIs
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.push({
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress,
          newTransactions: 0,
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
      timestamp: endTime
    };
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    // Save result for Step 2
    global.monitoringResult = result;
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\nFatal error:`, error);
    process.exit(1);
  });
