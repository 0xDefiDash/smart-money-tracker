#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorWatchlist() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting watchlist monitoring...`);
  
  const results = {
    timestamp: startTime.toISOString(),
    walletsChecked: 0,
    alertsCreated: 0,
    errors: [],
    walletDetails: []
  };

  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      }
    });

    console.log(`  📋 Found ${watchlistItems.length} watchlist items to check`);
    results.walletsChecked = watchlistItems.length;

    for (const item of watchlistItems) {
      const walletDetail = {
        address: item.address,
        chain: item.chain,
        label: item.label || 'Unlabeled',
        userId: item.userId,
        username: item.user?.username || item.user?.email || 'Unknown',
        tokenAddress: item.tokenAddress || null,
        lastChecked: item.lastChecked?.toISOString() || 'Never',
        newTransactions: 0,
        error: null
      };

      try {
        const existingAlerts = await prisma.transactionAlert.count({
          where: {
            walletAddress: item.address,
            chain: item.chain,
            userId: item.userId
          }
        });

        walletDetail.existingAlerts = existingAlerts;
        
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        console.log(`  ✓ ${item.address} (${item.chain}): No new transactions`);
      } catch (error) {
        walletDetail.error = error.message;
        results.errors.push({
          wallet: item.address,
          chain: item.chain,
          error: error.message
        });
        console.error(`  ❌ ${item.address} (${item.chain}): ${error.message}`);
      }

      results.walletDetails.push(walletDetail);
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    
    console.log(`\n[${endTime.toISOString()}] Monitoring complete:`);
    console.log(`  ⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`  📊 Wallets checked: ${results.walletsChecked}`);
    console.log(`  🔔 Alerts created: ${results.alertsCreated}`);
    
    results.duration = duration;
    results.endTime = endTime.toISOString();

    return results;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((results) => {
    console.log('\n✅ Monitoring task completed');
    console.log('\n=== JSON OUTPUT ===');
    console.log(JSON.stringify(results, null, 2));
    console.log('=== END JSON ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
