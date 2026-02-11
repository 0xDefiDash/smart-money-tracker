// Direct monitoring script that doesn't require Next.js server
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
    // Fetch all watchlist items (no isActive field in schema)
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

    console.log(`Found ${watchlistItems.length} watchlist items`);
    results.walletsChecked = watchlistItems.length;

    // Process each watchlist item
    for (const item of watchlistItems) {
      try {
        console.log(`\nChecking ${item.address} on ${item.chain}...`);
        
        const walletDetail = {
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress,
          lastChecked: item.lastChecked,
          newTransactions: 0,
          error: null
        };

        // Simulate checking for new transactions
        // In a real implementation, this would call blockchain APIs
        // For now, we'll just update the lastChecked timestamp
        
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: {
            lastChecked: new Date()
          }
        });

        console.log(`✓ Updated lastChecked for ${item.address}`);
        results.walletDetails.push(walletDetail);

      } catch (error) {
        console.error(`❌ Error processing ${item.address}:`, error.message);
        results.errors.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    console.log(`Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`Fatal error:`, error);
    results.errors.push({
      error: error.message,
      fatal: true
    });
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the monitoring
monitorWatchlist()
  .then((results) => {
    // Write results to stdout as JSON for parsing
    console.log('\n=== RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
