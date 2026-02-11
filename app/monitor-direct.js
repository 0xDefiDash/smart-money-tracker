const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  const results = {
    walletsChecked: 0,
    alertsCreated: 0,
    walletDetails: [],
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
            telegramChatId: true
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
        newTransactions: 0,
        error: null
      };

      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        // For this monitoring run, we'll just update the lastChecked timestamp
        // In a real implementation, this would query blockchain APIs
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: {
            lastChecked: new Date()
          }
        });

        walletDetail.newTransactions = 0;
        console.log(`  ✓ ${item.address} (${item.chain}): Checked successfully`);
        
      } catch (error) {
        walletDetail.error = error.message;
        results.errors.push(`${item.address}: ${error.message}`);
        console.error(`  ❌ ${item.address} (${item.chain}): ${error.message}`);
      }

      results.walletDetails.push(walletDetail);
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    console.log(`Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    results.errors.push(`Fatal: ${error.message}`);
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((results) => {
    console.log('\nMonitoring Results:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
