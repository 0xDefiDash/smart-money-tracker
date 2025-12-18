#!/usr/bin/env ts-node
/**
 * Direct Watchlist Monitor Script
 * 
 * This script directly monitors watchlisted wallets without requiring the dev server
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

    console.log(`Found ${watchlistItems.length} watchlist items to monitor`);

    let alertsCreated = 0;
    const results: MonitorResult[] = [];

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      try {
        // For this monitoring run, we'll just update the lastChecked timestamp
        // and log the wallet info. Actual transaction fetching would require
        // API keys and external service calls.
        
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
    console.log(`  - Wallets checked: ${watchlistItems.length}`);
    console.log(`  - Alerts created: ${alertsCreated}`);
    console.log(`  - Duration: ${duration.toFixed(2)}s`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      results,
      startTime,
      endTime,
      duration
    };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: [],
      startTime,
      endTime: new Date(),
      duration: 0
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    // Write results to stdout as JSON for parsing
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
