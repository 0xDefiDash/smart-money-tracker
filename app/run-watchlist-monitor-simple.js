const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: true
      }
    });

    console.log(`Found ${watchlistItems.length} watchlist items`);

    const results = {
      walletsChecked: watchlistItems.length,
      alertsCreated: 0,
      results: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        // For now, just log that we checked it
        results.results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          status: 'checked'
        });
      } catch (error) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.results.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`[${new Date().toISOString()}] Monitoring complete:`, {
      walletsChecked: results.walletsChecked,
      alertsCreated: results.alertsCreated
    });

    return results;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed successfully`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
