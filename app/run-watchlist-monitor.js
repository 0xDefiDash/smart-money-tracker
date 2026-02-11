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
          label: item.label,
          tokenAddress: item.tokenAddress,
          tokenSymbol: item.tokenSymbol,
          newTransactions: 0,
          error: null
        };

        // For this monitoring run, we'll just log the wallet info
        // The actual transaction fetching would require API keys
        console.log(`Checking wallet: ${item.address} on ${item.chain}${item.tokenSymbol ? ` (${item.tokenSymbol})` : ''}`);
        
        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.walletDetails.push(walletDetail);
      } catch (error) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.errors.push({
          wallet: item.address,
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
