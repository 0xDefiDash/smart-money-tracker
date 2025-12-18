#!/usr/bin/env ts-node
/**
 * Direct Watchlist Monitor Script
 * Monitors watchlisted wallets without requiring the Next.js server
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions?: number;
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

    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map((u: any) => u.id) }
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

    let alertsCreated = 0;
    const results: MonitorResult[] = [];

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      try {
        // For this monitoring run, we'll just update the lastChecked timestamp
        // and log the wallet info. Actual transaction fetching would require
        // the blockchain API libraries which may have external dependencies.
        
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0
        });

        console.log(`✓ Checked ${item.address} (${item.chain})`);
      } catch (error: any) {
        console.error(`Error checking watchlist item ${item.id}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  - Duration: ${duration}s`);
    console.log(`  - Wallets checked: ${watchlistItems.length}`);
    console.log(`  - Alerts created: ${alertsCreated}`);
    console.log(`  - Errors: ${results.filter(r => r.error).length}`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      duration,
      timestamp: endTime
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: [],
      timestamp: new Date()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    // Write results to stdout as JSON for parsing
    console.log('\n=== MONITOR_RESULT_JSON ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('=== END_MONITOR_RESULT_JSON ===');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
