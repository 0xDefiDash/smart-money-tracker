const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
            email: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items`);
    results.walletsChecked = watchlistItems.length;

    for (const item of watchlistItems) {
      const walletDetail = {
        address: item.address,
        chain: item.chain,
        label: item.label,
        userId: item.userId,
        newTransactions: 0,
        error: null
      };

      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        // Check if there are any existing alerts for this wallet
        const existingAlerts = await prisma.transactionAlert.count({
          where: {
            walletAddress: item.address,
            chain: item.chain,
            userId: item.userId
          }
        });

        walletDetail.existingAlerts = existingAlerts;
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        console.log(`  ✓ ${item.address} (${item.chain}): ${existingAlerts} existing alerts`);
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

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  - Wallets checked: ${results.walletsChecked}`);
    console.log(`  - Alerts created: ${results.alertsCreated}`);
    console.log(`  - Errors: ${results.errors.length}`);

    return results;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((results) => {
    // Write results to stdout as JSON for capture
    console.log('\n=== RESULTS JSON ===');
    console.log(JSON.stringify(results, null, 2));
    console.log('=== END RESULTS ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
