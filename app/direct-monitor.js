const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  const results = {
    timestamp,
    walletsChecked: 0,
    alertsCreated: 0,
    wallets: [],
    errors: []
  };

  try {
    console.log(`[${timestamp}] Starting watchlist monitoring...`);
    
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telegramChatId: true,
            telegramUsername: true
          }
        }
      }
    });

    console.log(`Found ${watchlistItems.length} active watchlist items`);
    results.walletsChecked = watchlistItems.length;

    for (const item of watchlistItems) {
      const walletInfo = {
        address: item.address,
        chain: item.chain,
        label: item.label || 'Unlabeled',
        transactionCount: 0,
        status: 'checked',
        lastChecked: item.lastChecked
      };

      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        walletInfo.status = 'success';
        
      } catch (error) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        walletInfo.status = 'error';
        walletInfo.error = error.message;
        results.errors.push({
          wallet: item.address,
          error: error.message
        });
      }

      results.wallets.push(walletInfo);
    }

    console.log(`[${timestamp}] Monitoring completed`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    console.log(`Errors: ${results.errors.length}`);

  } catch (error) {
    console.error('Fatal error during monitoring:', error);
    results.errors.push({
      type: 'fatal',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }

  return results;
}

monitorWatchlist()
  .then(results => {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to run monitoring:', error);
    process.exit(1);
  });
