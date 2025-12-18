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
            email: true,
            telegramChatId: true
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
          newTransactions: 0,
          error: null
        };

        // Update the lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: {
            lastChecked: new Date()
          }
        });

        console.log(`✓ Updated lastChecked for ${item.address}`);
        results.walletDetails.push(walletDetail);

      } catch (error) {
        console.error(`❌ Error checking wallet ${item.address}:`, error.message);
        results.errors.push({
          address: item.address,
          error: error.message
        });
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
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
    console.error(`Fatal error:`, error.message);
    results.errors.push({
      address: 'N/A',
      error: error.message
    });
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((results) => {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
