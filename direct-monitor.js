#!/usr/bin/env node
/**
 * Direct Database Watchlist Monitor
 * Queries the database directly to check watchlist status
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results = {
    timestamp,
    walletsChecked: 0,
    activeWatchlistItems: 0,
    walletsByChain: {},
    errors: []
  };

  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramUserId: true
          }
        }
      }
    });

    results.walletsChecked = watchlistItems.length;
    results.activeWatchlistItems = watchlistItems.filter(item => !item.isDeleted).length;

    console.log(`Found ${results.walletsChecked} total watchlist items`);
    console.log(`Active items: ${results.activeWatchlistItems}`);

    // Group by chain
    watchlistItems.forEach(item => {
      if (!item.isDeleted) {
        const chain = item.chain || 'unknown';
        if (!results.walletsByChain[chain]) {
          results.walletsByChain[chain] = [];
        }
        results.walletsByChain[chain].push({
          address: item.walletAddress,
          label: item.label,
          userId: item.userId,
          lastChecked: item.lastChecked,
          hasTelegram: !!item.user?.telegramUserId
        });
      }
    });

    // Display results by chain
    console.log('\n=== Watchlist Summary by Chain ===');
    for (const [chain, wallets] of Object.entries(results.walletsByChain)) {
      console.log(`\n${chain.toUpperCase()}: ${wallets.length} wallet(s)`);
      wallets.forEach((wallet, index) => {
        console.log(`  ${index + 1}. ${wallet.address}`);
        console.log(`     Label: ${wallet.label || 'N/A'}`);
        console.log(`     Last Checked: ${wallet.lastChecked ? new Date(wallet.lastChecked).toISOString() : 'Never'}`);
        console.log(`     Telegram: ${wallet.hasTelegram ? 'Linked' : 'Not linked'}`);
      });
    }

    // Check recent alerts
    const recentAlerts = await prisma.transactionAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        watchlistItem: {
          select: {
            walletAddress: true,
            chain: true,
            label: true
          }
        }
      }
    });

    console.log(`\n=== Recent Alerts (Last 10) ===`);
    if (recentAlerts.length === 0) {
      console.log('No alerts found');
    } else {
      recentAlerts.forEach((alert, index) => {
        console.log(`\n${index + 1}. Alert ID: ${alert.id}`);
        console.log(`   Wallet: ${alert.watchlistItem?.walletAddress || 'Unknown'}`);
        console.log(`   Chain: ${alert.watchlistItem?.chain || 'Unknown'}`);
        console.log(`   Type: ${alert.type}`);
        console.log(`   Created: ${alert.createdAt.toISOString()}`);
        console.log(`   Read: ${alert.isRead ? 'Yes' : 'No'}`);
      });
    }

    return results;

  } catch (error) {
    console.error('Error during monitoring:', error);
    results.errors.push(error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((results) => {
    console.log('\n=== Monitoring Complete ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== Monitoring Failed ===');
    console.error(error);
    process.exit(1);
  });
