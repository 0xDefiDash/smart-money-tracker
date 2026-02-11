// Direct monitoring without dev server
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all watchlist items
    const watchlistItems = await prisma.watchlistItem.findMany({
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

    const results = {
      walletsChecked: watchlistItems.length,
      alertsCreated: 0,
      walletDetails: [],
      errors: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        // For now, just log that we checked it
        // In a real implementation, we would call blockchain APIs here
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          status: 'checked',
          newTransactions: 0
        });
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });
        
      } catch (error) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.errors.push({
          address: item.address,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete`);
    console.log(`Wallets checked: ${results.walletsChecked}`);
    console.log(`Alerts created: ${results.alertsCreated}`);
    
    return results;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((results) => {
    console.log('\nResults:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
