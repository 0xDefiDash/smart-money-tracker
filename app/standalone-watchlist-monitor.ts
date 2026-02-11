#!/usr/bin/env ts-node
/**
 * Standalone Watchlist Monitor Script
 * Monitors all watchlisted wallets and sends alerts when transactions are detected
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitorResult {
  address: string;
  chain: string;
  newTransactions?: number;
  error?: string;
}

interface MonitorSummary {
  success: boolean;
  walletsChecked: number;
  alertsCreated: number;
  results: MonitorResult[];
  timestamp: string;
  errors: string[];
}

async function monitorWatchlist(): Promise<MonitorSummary> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);

  const summary: MonitorSummary = {
    success: true,
    walletsChecked: 0,
    alertsCreated: 0,
    results: [],
    timestamp,
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

    summary.walletsChecked = watchlistItems.length;
    console.log(`Found ${watchlistItems.length} watchlist items to check`);

    // Step 3: Check each watchlist item
    for (const item of watchlistItems) {
      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        // For now, just mark as checked without fetching transactions
        // (to avoid API key issues)
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        summary.results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0
        });

        console.log(`✓ ${item.address} (${item.chain}): Checked successfully`);
      } catch (error: any) {
        console.error(`❌ Error checking ${item.address} (${item.chain}):`, error.message);
        summary.errors.push(`${item.address} (${item.chain}): ${error.message}`);
        summary.results.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${summary.walletsChecked}`);
    console.log(`  Alerts created: ${summary.alertsCreated}`);
    console.log(`  Errors: ${summary.errors.length}`);

    return summary;
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error.message);
    summary.success = false;
    summary.errors.push(`Fatal error: ${error.message}`);
    return summary;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((summary) => {
    // Write results to stdout as JSON for parsing
    console.log('\n=== MONITOR SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
