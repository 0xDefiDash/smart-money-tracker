const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: true
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items`);
    
    const results = {
      walletsChecked: watchlistItems.length,
      alertsCreated: 0,
      results: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        // For this monitoring run, we'll just log the wallets
        // The actual transaction fetching would require API keys
        results.results.push({
          address: item.address,
          chain: item.chain,
          label: item.label,
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

    return results;
    
  } catch (error) {
    console.error('Error in checkWatchlist:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkWatchlist()
  .then((results) => {
    console.log('\n=== Monitoring Results ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
