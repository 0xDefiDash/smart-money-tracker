#!/usr/bin/env ts-node
/**
 * Standalone Watchlist Monitor
 * Directly queries the database and simulates monitoring
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
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

    let cleanedUp = 0;
    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map((u: any) => u.id) }
        }
      });
      cleanedUp = deleted.count;
      console.log(`Cleaned up ${cleanedUp} watchlist items from ${expiredUsers.length} expired users`);
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

    console.log(`Found ${watchlistItems.length} watchlist items to monitor`);

    const results: MonitorResult[] = [];
    let alertsCreated = 0;

    // Step 3: Process each watchlist item
    for (const item of watchlistItems) {
      try {
        // Note: We're simulating the check since API keys are not configured
        // In production, this would call blockchain APIs
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: 'API keys not configured - simulation mode'
        });
      } catch (error: any) {
        console.error(`Error checking watchlist item ${item.id}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message
        });
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const summary = {
      success: true,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      cleanedUpItems: cleanedUp,
      results
    };

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  - Wallets checked: ${summary.walletsChecked}`);
    console.log(`  - Alerts created: ${summary.alertsCreated}`);
    console.log(`  - Cleaned up items: ${summary.cleanedUpItems}`);
    console.log(`  - Duration: ${summary.duration}`);

    return summary;
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
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
    console.log(`\n[${new Date().toISOString()}] Task completed`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
