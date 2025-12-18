// Direct monitoring script that doesn't require the dev server
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
            telegramChatId: true,
            telegramUsername: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items`);
    results.walletsChecked = watchlistItems.length;

    for (const item of watchlistItems) {
      try {
        console.log(`\nChecking wallet: ${item.address} on ${item.chain}`);
        
        const walletDetail = {
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress,
          newTransactions: 0,
          error: null
        };

        // For now, we'll just update the lastChecked timestamp
        // In a real implementation, you would query blockchain APIs here
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: {
            lastChecked: new Date()
          }
        });

        console.log(`✓ Updated lastChecked for ${item.address}`);
        results.walletDetails.push(walletDetail);

      } catch (error) {
        const errorMsg = `Error checking wallet ${item.address}: ${error.message}`;
        console.error(`✗ ${errorMsg}`);
        results.errors.push(errorMsg);
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
    console.error(`Fatal error: ${error.message}`);
    results.errors.push(`Fatal error: ${error.message}`);
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

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
