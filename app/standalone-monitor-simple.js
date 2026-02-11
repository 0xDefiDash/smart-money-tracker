const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
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
      walletDetails: [],
      errors: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        // Simulate checking for transactions
        // In a real scenario, this would call blockchain APIs
        const walletResult = {
          address: item.address,
          chain: item.chain,
          label: item.label,
          lastChecked: item.lastChecked,
          status: 'checked',
          newTransactions: 0,
          error: null
        };

        // Check if we have API keys configured
        const hasApiKey = process.env.ALCHEMY_API_KEY || 
                         process.env.MORALIS_API_KEY || 
                         process.env.HELIUS_API_KEY;
        
        if (!hasApiKey) {
          walletResult.error = 'No API keys configured';
          walletResult.status = 'error';
          results.errors.push(`${item.address}: No API keys configured`);
        } else {
          walletResult.status = 'API keys present but not queried (simulation mode)';
        }

        results.walletDetails.push(walletResult);

      } catch (error) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.errors.push(`${item.address}: ${error.message}`);
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          error: error.message,
          status: 'error'
        });
      }
    }

    console.log(`\nMonitoring complete:`);
    console.log(`- Wallets checked: ${results.walletsChecked}`);
    console.log(`- Alerts created: ${results.alertsCreated}`);
    console.log(`- Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error('Fatal error during monitoring:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the monitoring
monitorWatchlist()
  .then((results) => {
    console.log('\n=== Monitoring Results ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== Fatal Error ===');
    console.error(error);
    process.exit(1);
  });
