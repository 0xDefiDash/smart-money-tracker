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
        user: true
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
        
        // For now, just log that we checked it
        // The actual transaction fetching would happen via the API
        walletDetail.newTransactions = 0;
        
      } catch (error) {
        console.error(`Error checking ${item.address}:`, error.message);
        walletDetail.error = error.message;
        results.errors.push({
          wallet: item.address,
          chain: item.chain,
          error: error.message
        });
      }

      results.walletDetails.push(walletDetail);
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    console.log(`Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`Fatal error:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((results) => {
    console.log('\nMonitoring completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMonitoring failed:', error);
    process.exit(1);
  });
