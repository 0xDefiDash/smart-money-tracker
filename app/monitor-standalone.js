const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results = {
    walletsChecked: 0,
    alertsCreated: 0,
    errors: [],
    walletDetails: []
  };

  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            telegramChatId: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items`);
    results.walletsChecked = watchlistItems.length;

    for (const item of watchlistItems) {
      try {
        const walletDetail = {
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: null
        };

        // For this monitoring run, we'll just check the database for existing alerts
        // In a real implementation, this would query blockchain APIs
        const recentAlerts = await prisma.transactionAlert.findMany({
          where: {
            walletAddress: item.address,
            chain: item.chain,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        });

        walletDetail.newTransactions = recentAlerts.length;
        results.walletDetails.push(walletDetail);

        console.log(`  ✓ ${item.address} (${item.chain}): ${recentAlerts.length} alerts in last 24h`);

      } catch (error) {
        const errorMsg = error.message || String(error);
        results.errors.push({
          address: item.address,
          chain: item.chain,
          error: errorMsg
        });
        console.error(`  ❌ ${item.address} (${item.chain}): ${errorMsg}`);
      }
    }

    // Update lastChecked timestamp for all items
    await prisma.watchlistItem.updateMany({
      data: {
        lastChecked: new Date()
      }
    });

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`  Wallets checked: ${results.walletsChecked}`);
    console.log(`  Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
monitorWatchlist()
  .then(results => {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n=== MONITORING FAILED ===');
    console.error(error);
    process.exit(1);
  });
