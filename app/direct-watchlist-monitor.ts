#!/usr/bin/env ts-node
/**
 * Direct Watchlist Monitor
 * Queries the database directly to generate monitoring report
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting direct watchlist monitoring...`);
  
  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} watchlist items`);

    // Fetch recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await prisma.transactionAlert.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    console.log(`Found ${recentAlerts.length} alerts in the last 24 hours`);

    // Group alerts by wallet
    const alertsByWallet = new Map<string, any[]>();
    for (const alert of recentAlerts) {
      const key = `${alert.walletAddress}-${alert.chain}`;
      if (!alertsByWallet.has(key)) {
        alertsByWallet.set(key, []);
      }
      alertsByWallet.get(key)!.push(alert);
    }

    // Prepare results
    const results = watchlistItems.map((item: any) => {
      const key = `${item.address}-${item.chain}`;
      const alerts = alertsByWallet.get(key) || [];
      
      return {
        id: item.id,
        address: item.address,
        chain: item.chain,
        tokenAddress: item.tokenAddress,
        userId: item.userId,
        userEmail: item.user?.email,
        label: item.label,
        lastChecked: item.lastChecked,
        alertsLast24h: alerts.length,
        latestAlert: alerts.length > 0 ? alerts[0].createdAt : null
      };
    });

    return {
      success: true,
      timestamp,
      walletsChecked: watchlistItems.length,
      totalAlerts24h: recentAlerts.length,
      results
    };

  } catch (error: any) {
    console.error(`[${timestamp}] Monitoring failed:`, error.message);
    return {
      success: false,
      timestamp,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
