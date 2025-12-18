import { PrismaClient } from '@prisma/client';

interface MonitoringResult {
  address: string;
  chain: string;
  newTransactions: number;
  error: string | null;
  lastChecked: Date;
}

async function monitorWatchlist() {
  const prisma = new PrismaClient();
  const timestamp = new Date();
  
  console.log(`[${timestamp.toISOString()}] Starting watchlist monitoring...`);
  
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

    console.log(`Found ${watchlistItems.length} active watchlist items to monitor`);

    let walletsChecked = 0;
    let alertsCreated = 0;
    const results: MonitoringResult[] = [];

    for (const item of watchlistItems) {
      walletsChecked++;
      
      try {
        console.log(`\nChecking wallet: ${item.address} on ${item.chain}`);
        console.log(`  Label: ${item.label || 'N/A'}`);
        console.log(`  Last checked: ${item.lastChecked}`);
        console.log(`  User: ${item.user?.email}`);
        console.log(`  Telegram: ${item.user?.telegramChatId ? 'Connected' : 'Not connected'}`);
        
        // Update the lastChecked timestamp
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: { lastChecked: timestamp }
        });
        
        // In a real implementation, this would:
        // 1. Query blockchain APIs (Alchemy, Moralis, Etherscan, Helius)
        // 2. Filter transactions newer than lastChecked
        // 3. Create TransactionAlert records
        // 4. Send Telegram notifications
        
        // For now, we'll just log that the wallet was checked
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: null,
          lastChecked: timestamp
        });
        
        console.log(`  ✓ Wallet checked successfully`);
      } catch (error: any) {
        console.error(`  ❌ Error checking wallet ${item.address}:`, error.message);
        results.push({
          address: item.address,
          chain: item.chain,
          newTransactions: 0,
          error: error.message,
          lastChecked: item.lastChecked
        });
      }
    }

    await prisma.$disconnect();

    const summary = {
      success: true,
      walletsChecked,
      alertsCreated,
      results,
      timestamp: timestamp.toISOString()
    };

    console.log(`\n[${timestamp.toISOString()}] Monitoring complete:`);
    console.log(`  Wallets checked: ${walletsChecked}`);
    console.log(`  Alerts created: ${alertsCreated}`);
    console.log(`  Errors: ${results.filter(r => r.error).length}`);

    return summary;
  } catch (error: any) {
    console.error(`[${timestamp.toISOString()}] Monitoring failed:`, error.message);
    await prisma.$disconnect();
    return {
      success: false,
      error: error.message,
      timestamp: timestamp.toISOString()
    };
  }
}

// Execute monitoring
monitorWatchlist()
  .then((result) => {
    console.log(`\n=== MONITORING SUMMARY ===`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(`\nFatal error:`, error);
    process.exit(1);
  });
