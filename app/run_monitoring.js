require('dotenv').config();
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
    // Fetch all active watchlist items
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
        const walletDetail = {
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: null
        };

        // For this monitoring run, we'll check the database for existing alerts
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
        const errorMsg = error.message || 'Unknown error';
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
    console.error(`[${new Date().toISOString()}] Fatal error:`, error.message);
    results.errors.push({
      address: 'N/A',
      chain: 'N/A',
      error: error.message
    });
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((results) => {
    console.log('\n=== Monitoring Results ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
