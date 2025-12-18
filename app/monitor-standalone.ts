import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MonitoringResult {
  address: string;
  chain: string;
  newTransactions: number;
  error?: string;
}

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

    const results: MonitoringResult[] = [];
    let totalAlertsCreated = 0;

    for (const item of watchlistItems) {
      try {
        console.log(`Checking ${item.address} on ${item.chain}...`);
        
        // For this monitoring run, we'll just update the lastChecked timestamp
        // In a real implementation, this would query blockchain APIs
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0
        });

      } catch (error: any) {
        console.error(`Error checking ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${watchlistItems.length}`);
    console.log(`  Alerts created: ${totalAlertsCreated}`);

    return {
      success: true,
      walletsChecked: watchlistItems.length,
      alertsCreated: totalAlertsCreated,
      results
    };

  } catch (error: any) {
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

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\nMonitoring Results:`, JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`Fatal error:`, error);
    process.exit(1);
  });
