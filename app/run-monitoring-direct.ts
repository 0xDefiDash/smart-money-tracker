import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface MonitoringResult {
  walletsChecked: number;
  alertsCreated: number;
  walletDetails: Array<{
    address: string;
    chain: string;
    tokenAddress: string | null;
    lastChecked: Date;
    status: string;
  }>;
  errors: Array<{
    address: string;
    error: string;
  }>;
}

async function monitorWatchlist(): Promise<MonitoringResult> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting watchlist monitoring...`);
  
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

    console.log(`Found ${watchlistItems.length} watchlist items`);

    const results: MonitoringResult = {
      walletsChecked: watchlistItems.length,
      alertsCreated: 0,
      walletDetails: [],
      errors: []
    };

    for (const item of watchlistItems) {
      try {
        console.log(`Checking wallet: ${item.address} on ${item.chain}`);
        
        // Add wallet details to results
        results.walletDetails.push({
          address: item.address,
          chain: item.chain,
          tokenAddress: item.tokenAddress,
          lastChecked: item.lastChecked,
          status: 'checked'
        });

        // Update lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: new Date() }
        });

      } catch (error: any) {
        console.error(`Error checking wallet ${item.address}:`, error.message);
        results.errors.push({
          address: item.address,
          error: error.message
        });
      }
    }

    console.log(`\n[${new Date().toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${results.walletsChecked}`);
    console.log(`  Alerts created: ${results.alertsCreated}`);
    console.log(`  Errors: ${results.errors.length}`);

    return results;

  } catch (error: any) {
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
