#!/usr/bin/env node
/**
 * Simple Watchlist Monitor Script
 * Queries database and reports on watchlist status
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
  try {
    // Step 1: Check for expired trial users
    const now = new Date();
    const expiredUsers = await prisma.user.findMany({
      where: {
        isPremium: false,
        trialEndsAt: { lte: now }
      },
      select: { id: true, email: true }
    });

    console.log(`  🔍 Found ${expiredUsers.length} expired trial users`);

    if (expiredUsers.length > 0) {
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          userId: { in: expiredUsers.map(u => u.id) }
        }
      });
      console.log(`  🧹 Cleaned up ${deleted.count} watchlist items from expired users`);
    }

    // Step 2: Fetch all active watchlist items
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
      }
    });

    console.log(`  📋 Found ${watchlistItems.length} active watchlist items`);

    const results = [];
    let alertsCreated = 0;

    // Step 3: Process each watchlist item
    for (const item of watchlistItems) {
      try {
        // For this monitoring run, we'll just update the lastChecked timestamp
        // and report on the watchlist status
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        const timeSinceLastCheck = now.getTime() - item.lastChecked.getTime();
        const minutesSinceLastCheck = Math.floor(timeSinceLastCheck / 60000);

        results.push({
          address: item.address,
          chain: item.chain,
          label: item.label,
          tokenAddress: item.tokenAddress,
          lastChecked: item.lastChecked,
          minutesSinceLastCheck,
          user: item.user.email || item.user.telegramUsername,
          isPremium: item.user.isPremium,
          success: true
        });

        console.log(`  ✓ ${item.address.substring(0, 10)}... (${item.chain}): Last checked ${minutesSinceLastCheck}m ago`);
      } catch (error) {
        console.error(`  ❌ ${item.address} (${item.chain}): ${error.message}`);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message,
          success: false
        });
      }
    }

    // Get alert statistics
    const totalAlerts = await prisma.transactionAlert.count();
    const recentAlerts = await prisma.transactionAlert.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  ⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`  📊 Wallets checked: ${watchlistItems.length}`);
    console.log(`  🔔 Total alerts in system: ${totalAlerts}`);
    console.log(`  📅 Alerts in last 24h: ${recentAlerts}`);

    await prisma.$disconnect();

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated,
      totalAlerts,
      recentAlerts,
      results,
      duration,
      timestamp: endTime
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    await prisma.$disconnect();
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n✅ Monitoring task completed`);
    // Write result to stdout for capture
    console.log('\n--- RESULT JSON ---');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
