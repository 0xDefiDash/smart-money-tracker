// Direct monitoring script that doesn't require Next.js server
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorWatchlist() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
  try {
    // Fetch all active watchlist items
    const watchlistItems = await prisma.watchlist.findMany({
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

    const results = {
      walletsChecked: watchlistItems.length,
      alertsCreated: 0,
      walletDetails: [],
      errors: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.walletAddress} on ${item.chain}`);
        
        // For now, just log that we checked it
        // In a full implementation, this would call blockchain APIs
        results.walletDetails.push({
          address: item.walletAddress,
          chain: item.chain,
          tokenAddress: item.tokenAddress,
          lastChecked: item.lastChecked,
          status: 'checked'
        });

        // Update lastChecked timestamp
        await prisma.watchlist.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

      } catch (error) {
        console.error(`Error checking wallet ${item.walletAddress}:`, error.message);
        results.errors.push({
          address: item.walletAddress,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${results.walletsChecked}`);
    console.log(`  Alerts created: ${results.alertsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    return results;

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Monitoring failed:`, error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n[${new Date().toISOString()}] Monitoring task completed successfully`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n[${new Date().toISOString()}] Fatal error:`, error);
    process.exit(1);
  });
