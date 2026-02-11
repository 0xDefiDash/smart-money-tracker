#!/usr/bin/env ts-node
/**
 * Simple Watchlist Monitor Script
 * Queries the database directly to check watchlist status
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all watchlist items with user info
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get transaction alerts count
    const alertsCount = await prisma.transactionAlert.count();
    
    // Get recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await prisma.transactionAlert.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    const results = {
      timestamp,
      success: true,
      walletsChecked: watchlistItems.length,
      totalAlerts: alertsCount,
      recentAlerts: recentAlerts.length,
      watchlistItems: watchlistItems.map(item => ({
        id: item.id,
        address: item.address,
        chain: item.chain,
        tokenAddress: item.tokenAddress,
        tokenSymbol: item.tokenSymbol,
        lastChecked: item.lastChecked,
        createdAt: item.createdAt,
        userId: item.user.id,
        userEmail: item.user.email,
        userTelegram: item.user.telegramUsername,
        isPremium: item.user.isPremium
      })),
      recentAlertsDetails: recentAlerts.map(alert => ({
        id: alert.id,
        walletAddress: alert.walletAddress,
        chain: alert.chain,
        transactionHash: alert.transactionHash,
        type: alert.type,
        value: alert.value,
        tokenSymbol: alert.tokenSymbol,
        tokenAmount: alert.tokenAmount,
        createdAt: alert.createdAt,
        userEmail: alert.user.email
      }))
    };

    console.log(`\n✓ Monitoring complete:`);
    console.log(`  - Wallets monitored: ${results.walletsChecked}`);
    console.log(`  - Total alerts in system: ${results.totalAlerts}`);
    console.log(`  - Recent alerts (24h): ${results.recentAlerts}`);
    
    return results;
  } catch (error: any) {
    console.error(`[${timestamp}] Monitoring failed:`, error.message);
    return {
      timestamp,
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed`);
    // Output JSON for parsing
    console.log('\n=== JSON OUTPUT ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('=== END JSON OUTPUT ===');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
