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
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
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
          address: item.walletAddress,
          chain: item.chain,
          newTransactions: 0,
          error: null
        };

        // For this monitoring run, we'll just log the wallet info
        // The actual transaction fetching would require API keys
        console.log(`Checking wallet: ${item.walletAddress} on ${item.chain}`);
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.walletDetails.push(walletDetail);
      } catch (error) {
        console.error(`Error checking wallet ${item.walletAddress}:`, error.message);
        results.errors.push({
          wallet: item.walletAddress,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    
    return results;
  } catch (error) {
    console.error(`Fatal error:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((results) => {
    console.log('\nFinal results:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
