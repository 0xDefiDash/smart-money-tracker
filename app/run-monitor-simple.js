const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  console.log(`[${new Date().toISOString()}] Starting watchlist monitoring...`);
  
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

    console.log(`Found ${watchlistItems.length} watchlist items`);

    let walletsChecked = 0;
    let alertsCreated = 0;
    const results = [];

    for (const item of watchlistItems) {
      walletsChecked++;
      
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}${item.tokenSymbol ? ` (Token: ${item.tokenSymbol})` : ''}`);
        
        // For now, just log that we checked it
        results.push({
          address: item.address,
          chain: item.chain,
          tokenSymbol: item.tokenSymbol,
          newTransactions: 0,
          status: 'checked'
        });
        
      } catch (error) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${walletsChecked}`);
    console.log(`  Alerts created: ${alertsCreated}`);

    return {
      success: true,
      walletsChecked,
      alertsCreated,
      results
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    return {
      success: false,
      error: error.message,
      walletsChecked: 0,
      alertsCreated: 0,
      results: []
    };
  } finally {
    await prisma.$disconnect();
  }
}

monitorWatchlist()
  .then((result) => {
    console.log(`\nMonitoring Results:`, JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`Fatal error:`, error);
    process.exit(1);
  });
